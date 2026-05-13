# Webchat v2.0

基于 Vue3 + TypeScript + Express + Socket.IO 的实时群聊与私聊 Web 应用。

> v1.0（原始版本）保留在 `master` 分支和 `v1.0` tag 中。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite |
| 后端 | Express + TypeScript |
| 数据库 | MySQL + Prisma ORM |
| 实时通信 | Socket.IO v4 |
| 用户认证 | JWT + bcryptjs |
| Markdown 渲染 | marked + DOMPurify（XSS 防护） |

## 快速开始

### 环境要求

- Node.js >= 18
- MySQL 8.0+（或 Docker）

### 数据库准备

```bash
# 使用 Docker 启动 MySQL
docker run -d --name webchat-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -p 3306:3306 \
  mysql:8.0

# 创建数据库
docker exec webchat-mysql mysql -uroot -p123456 \
  -e "CREATE DATABASE webchat_v2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 安装与启动

```bash
# 后端
cd server
npm install
npx prisma db push    # 创建数据库表
npm run dev           # 启动后端（端口 3000）

# 前端（新开一个终端）
cd client
npm install
npm run dev           # 启动前端（端口 5173）
```

打开浏览器访问 http://localhost:5173

## 项目结构

```
webchat-1/
  client/                  # Vue3 前端
    src/
      views/               # 页面组件
        LoginView.vue      # 登录/注册页
        ChatView.vue       # 聊天主页
      components/          # 通用组件
        ChatMessage.vue    # 消息气泡（支持 Markdown + XSS 防护）
        ChatInput.vue      # 输入框（文字/图片/Markdown 切换）
        ChatSidebar.vue    # 侧边栏（在线用户 + 未读徽章）
        UserAvatar.vue     # 头像组件
      stores/              # Pinia 状态管理
        auth.ts            # 用户认证状态
        chat.ts            # 聊天消息状态
      composables/         # 组合式函数
        useSocket.ts       # Socket.IO 连接管理
      router/              # Vue Router 路由 + 守卫
      types/               # TypeScript 类型定义
      utils/               # API 客户端（axios）

  server/                  # Express 后端
    src/
      routes/              # API 路由
        auth.ts            # 注册/登录
        user.ts            # 用户信息
        chat.ts            # 聊天历史/未读/图片上传
      controllers/         # 控制器
        authController.ts  # 认证相关逻辑
      middleware/           # 中间件
        auth.ts            # JWT 验证中间件
      socket/              # Socket.IO 事件处理
        index.ts           # 初始化 + JWT 鉴权
        chatHandler.ts     # 群聊/私聊消息处理
        userHandler.ts     # 用户上线/下线处理
      utils/
        db.ts              # Prisma 客户端单例
    prisma/
      schema.prisma        # 数据模型定义
```

## 功能特性

- **用户注册/登录** — 邮箱 + 密码，JWT 鉴权
- **群聊** — 所有在线用户实时消息
- **私聊** — 一对一私信，支持离线消息
- **图片发送** — JPEG/PNG/GIF/WebP，最大 5MB，UUID 文件名
- **Markdown 支持** — 发送 Markdown 格式消息，前端安全渲染
- **XSS 防护** — 纯文本和 Markdown 消息均经过 DOMPurify 过滤
- **未读消息** — 私聊未读计数，打开后自动标记已读
- **在线状态** — 实时显示在线用户列表
- **聊天历史** — 分页加载历史消息

## API 接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | /api/auth/register | 否 | 注册（邮箱+用户名+密码+头像） |
| POST | /api/auth/login | 否 | 登录，返回 JWT token |
| GET | /api/user/profile | 是 | 获取当前用户信息 |
| PUT | /api/user/profile | 是 | 更新个性签名/用户名 |
| GET | /api/chat/history | 是 | 查询聊天历史（群聊/私聊） |
| GET | /api/chat/unread | 是 | 获取未读消息计数 |
| PUT | /api/chat/read | 是 | 标记消息为已读 |
| POST | /api/chat/upload | 是 | 上传图片 |

## 环境变量

在 `server/.env` 中配置：

```env
DATABASE_URL="mysql://root:123456@localhost:3306/webchat_v2"
JWT_SECRET="your-secret-key"
PORT=3000
```

## 版本历史

- **v2.0** — 前后端分离重构，Vue3 + TypeScript + Prisma，新增私聊、Markdown、XSS 防护
- **v1.0** — 原始版本（jQuery + Express 单体架构）
