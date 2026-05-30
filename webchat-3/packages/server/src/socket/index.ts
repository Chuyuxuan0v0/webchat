import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { messageHandler } from './handlers/message.handler';
import { presenceHandler } from './handlers/presence.handler';

export const initializeSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const secret = process.env.JWT_SECRET || 'default-secret';
      const decoded = jwt.verify(token, secret) as { id: string };

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error('User not found'));
      }

      (socket as any).userId = (user as any)._id.toString();
      (socket as any).username = user.username;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${(socket as any).username} (${socket.id})`);

    messageHandler(io, socket);
    presenceHandler(io, socket);

    socket.on('typing:start', (data) => {
      socket.broadcast.emit('typing:indicator', {
        chatId: data.chatId,
        userId: (socket as any).userId,
        username: (socket as any).username,
      });
    });

    socket.on('typing:stop', (data) => {
      socket.broadcast.emit('typing:indicator', {
        chatId: data.chatId,
        userId: (socket as any).userId,
        username: '',
      });
    });
  });
};
