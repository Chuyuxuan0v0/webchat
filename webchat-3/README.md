# WebChat v3.0

基于 React + Express + MongoDB 的实时聊天应用。

## 技术栈

- **前端**: React 19, Vite, TypeScript, Zustand, Tailwind CSS
- **后端**: Express, Socket.IO, Mongoose
- **数据库**: MongoDB 7 (Docker)

## 快速开始

### 1. 启动 MongoDB

```bash
docker run -d --name webchat-mongo -p 27017:27017 -v mongo-data:/data/db mongo:7
```

### 2. 安装依赖

```bash
cd webchat-3
pnpm install
```

### 3. 配置环境变量

复制 `packages/server/.env.example` 到 `packages/server/.env`，根据需要修改配置。

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

## 项目结构

```
webchat-3/
├── packages/
│   ├── shared/     # 共享类型和工具
│   ├── server/     # Express + Socket.IO 后端
│   └── web/        # React 前端
└── package.json
```

## 功能

- 用户注册/登录（邮箱认证）
- 群聊（实时消息）
- 私聊（一对一）
- 文件/图片上传
- 消息分页加载
- 在线状态显示
