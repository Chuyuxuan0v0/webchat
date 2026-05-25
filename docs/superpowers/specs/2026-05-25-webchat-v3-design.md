# WebChat v3.0 设计文档

## 概述

从零构建 WebChat v3.0，一个基于 React + Express + MongoDB 的实时聊天应用。目标是通过完整项目学习 React 技术栈，为后续 React Native 移动端开发打基础。

### 核心决策

- **前端**：React 19 + Vite + TypeScript + Zustand + Tailwind CSS
- **后端**：Express + TypeScript + Socket.IO 4.x + Mongoose
- **数据库**：MongoDB 7（Docker 运行）
- **项目结构**：pnpm Monorepo（packages/shared + packages/server + packages/web）
- **实时通信**：Socket.IO
- **认证**：JWT
- **文件存储**：本地 uploads/ 目录，后期迁移到云存储

### MVP 功能范围

1. 用户注册/登录（邮箱+密码，JWT 认证）
2. 群聊（全局聊天大厅，实时消息）
3. 私聊（一对一聊天）
4. 图片/文件发送

---

## 项目结构

```
webchat-3/
├── packages/
│   ├── shared/               # 前后端共享
│   │   ├── src/
│   │   │   ├── types/        # 消息、用户、Socket 事件类型定义
│   │   │   ├── constants/    # 共享常量
│   │   │   └── utils/        # 通用工具函数
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── server/               # 后端
│   │   ├── src/
│   │   │   ├── config/       # 数据库连接、环境变量
│   │   │   ├── modules/      # 按功能模块划分
│   │   │   │   ├── auth/     # 注册登录、JWT
│   │   │   │   ├── user/     # 用户信息管理
│   │   │   │   ├── chat/     # 消息收发、历史记录
│   │   │   │   └── upload/   # 文件/图片上传
│   │   │   ├── models/       # Mongoose Schema
│   │   │   ├── socket/       # Socket.IO 事件处理
│   │   │   ├── middleware/   # 认证、错误处理、上传
│   │   │   ├── utils/
│   │   │   └── index.ts      # 入口
│   │   ├── .env
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                  # Web 前端
│       ├── src/
│       │   ├── components/   # 通用组件
│       │   ├── pages/        # 页面级组件
│       │   ├── hooks/        # 自定义 Hooks
│       │   ├── stores/       # Zustand 状态管理
│       │   ├── services/     # API 请求、Socket.IO 客户端
│       │   └── App.tsx
│       ├── index.html
│       ├── package.json
│       └── tsconfig.json
│
├── package.json              # workspace 根配置
├── tsconfig.base.json
└── .gitignore
```

---

## 数据模型

### User

```typescript
{
  _id: ObjectId
  username: string          // 昵称，至少 2 个字符，可修改
  email: string             // 唯一身份标识，不可修改
  password: string          // bcrypt 哈希
  avatar: string            // 头像 URL（可选，用户自定义上传）
  avatarBgColor: string     // 默认头像背景色（随机生成的十六进制颜色）
  status: 'online' | 'offline' | 'away'
  createdAt: Date
  updatedAt: Date
}
```

**默认头像设计**：用户未设置自定义头像时，取用户名后 2 个字符作为头像文字，配合 `avatarBgColor` 随机背景色显示（参考飞书风格）。例如用户名"张三元"，默认头像显示"三元"。注册时用户名长度必须 >= 2。

### Message

```typescript
{
  _id: ObjectId
  sender: ObjectId          // ref -> User
  content: string           // 文本内容
  type: 'text' | 'image' | 'file'
  fileUrl?: string          // 图片/文件 URL
  fileName?: string         // 文件名
  chatType: 'group' | 'private'
  chatId: string            // 群聊: 'global'，私聊: 两个用户ID排序拼接
  createdAt: Date
}
```

### 私聊 chatId 设计

私聊 chatId 由两个用户 ID 按字母序拼接（如 `userA_userB`），确保同一对用户只有一个聊天会话，无需额外的 Conversation 表。

---

## API 设计

### REST API

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册（email 作为唯一标识 + username >= 2字符 + password） |
| POST | `/api/auth/login` | 邮箱+密码登录，返回 JWT |
| GET | `/api/users/me` | 获取当前用户信息 |
| PUT | `/api/users/me` | 更新个人信息 |
| GET | `/api/users/online` | 获取在线用户列表 |
| GET | `/api/messages/:chatId` | 获取聊天历史（分页，query: page, limit） |
| POST | `/api/upload` | 上传图片/文件 |

### Socket.IO 事件

| 事件 | 方向 | 数据 | 说明 |
|---|---|---|---|
| `message:send` | Client → Server | `{ chatId, content, type, fileUrl?, fileName? }` | 发送消息 |
| `message:receive` | Server → Client | `Message` 对象 | 收到新消息 |
| `user:online` | Server → Client | `{ userId, username }` | 用户上线 |
| `user:offline` | Server → Client | `{ userId, username }` | 用户下线 |
| `typing:start` | Client → Server | `{ chatId }` | 开始输入 |
| `typing:stop` | Client → Server | `{ chatId }` | 停止输入 |
| `typing:indicator` | Server → Client | `{ chatId, userId, username }` | 显示谁在输入 |

---

## 前端架构

### 页面结构

```
LoginPage    — 登录/注册（Tab 切换）
ChatPage     — 聊天主页面
  ├── Sidebar（左侧边栏）
  │   ├── UserList — 在线用户列表
  │   └── ChatList — 最近会话列表
  ├── ChatWindow（中间聊天区）
  │   ├── MessageList — 消息列表
  │   ├── MessageInput — 输入框 + 上传按钮
  │   └── MessageBubble — 单条消息气泡
  └── InfoPanel（右侧信息面板）
      ├── 群聊：群名 + 在线人数/总人数 + 在线用户列表
      └── 私聊：对方头像 + 用户名 + 在线状态
```

### 组件结构

```
App.tsx
├── pages/
│   ├── LoginPage.tsx
│   └── ChatPage.tsx
├── components/
│   ├── Avatar.tsx            # 头像组件（自定义图片 or 用户名后2字+随机背景色）
│   ├── EmojiPicker.tsx
│   ├── FileUpload.tsx
│   └── Loading.tsx
├── stores/
│   ├── authStore.ts        # user, token, login(), logout(), updateProfile()
│   ├── chatStore.ts        # messages, activeChat, onlineUsers, sendMessage(), loadHistory()
│   └── socketStore.ts      # socket, connect(), disconnect()
├── services/
│   ├── api.ts              # Axios 封装
│   └── socket.ts           # Socket.IO 客户端封装
└── hooks/
    ├── useAuth.ts
    └── useChat.ts
```

### 关键交互流程

**发送消息**：用户输入 → Socket.IO `message:send` → 后端存 MongoDB → 广播 `message:receive` → 前端更新 Zustand → React 重渲染

**文件上传**：选择文件 → POST `/api/upload` → 服务器返回 URL → 用 URL 发送消息

---

## 后端架构

### 分层设计

- **Routes**：URL 路由定义
- **Controller**：接收请求、调用 Service、返回响应
- **Service**：核心业务逻辑，可在 REST 和 Socket 中复用

### 安全措施

| 措施 | 实现 |
|---|---|
| 防 SQL 注入 | MongoDB + Mongoose 自动参数化 |
| 防 XSS | React JSX 自动转义 |
| 密码安全 | bcrypt 哈希 + salt |
| 认证 | JWT token，中间件验证 |
| 环境变量 | dotenv 管理敏感配置 |
| CORS | 限制允许的源 |

### 环境变量

```env
PORT=4400
MONGODB_URI=mongodb://localhost:27017/webchat_v3
JWT_SECRET=<random-secret>
JWT_EXPIRES_IN=7d
UPLOAD_DIR=./uploads
CORS_ORIGIN=http://localhost:5173
```

---

## 开发环境

### MongoDB（Docker）

```bash
docker pull mongo:7
docker run -d --name webchat-mongo -p 27017:27017 -v mongo-data:/data/db mongo:7
```

### 启动命令

```bash
pnpm dev                      # 同时启动 server + web
pnpm --filter server dev      # 仅后端
pnpm --filter web dev         # 仅前端
```

---

## 开发阶段

### Phase 1：项目脚手架
- pnpm workspace 配置
- TypeScript 基础配置
- 依赖安装
- Docker MongoDB 启动

### Phase 2：后端核心
- MongoDB 连接
- User / Message Mongoose 模型（邮箱唯一标识，用户名 >= 2 字符）
- 注册/登录 API + JWT（邮箱登录）
- 认证中间件

### Phase 3：Socket.IO
- 连接管理 + token 验证
- 消息收发事件
- 用户上下线事件

### Phase 4：前端基础页面
- 登录/注册页
- 聊天页面布局（Sidebar + ChatWindow + InfoPanel）
- 消息列表与输入框
- Socket.IO 连接

### Phase 5：完善功能
- 文件/图片上传
- 私聊
- 表情选择器
- 右侧信息面板

### Phase 6：打磨
- 响应式适配
- 错误处理与 Loading 状态
- 消息分页加载
- 输入状态指示器

---

## 部署（后期）

- 后端：迁移到自有 ECS
- 前端：Vercel 或 ECS
- 数据库：MongoDB Atlas 或 ECS 自建
- 文件存储：本地 → 阿里云 OSS
