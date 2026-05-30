import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDatabase } from './config/database';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import chatRoutes from './modules/chat/chat.routes';
import groupRoutes from './modules/group/group.routes';
import uploadRoutes from './modules/upload/upload.routes';
import { errorHandler } from './middleware/error.middleware';
import { initializeSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const PORT = process.env.PORT || 4400;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(process.env.UPLOAD_DIR || './uploads')));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

initializeSocket(io);

const start = async () => {
  await connectDatabase();
  httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start().catch(console.error);
