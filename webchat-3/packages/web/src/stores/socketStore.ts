import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { Message } from '@webchat/shared';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useChatStore } from './chatStore';

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;

  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (data: {
    chatId: string;
    content: string;
    type: 'text' | 'image' | 'file';
    chatType: 'group' | 'private';
    fileUrl?: string;
    fileName?: string;
  }) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,

  connect: (token) => {
    const socket = connectSocket(token);

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('message:receive', (message: Message) => {
      useChatStore.getState().addMessage(message);
    });

    socket.on('user:online', (data) => {
      useChatStore.getState().addOnlineUser(data);
    });

    socket.on('user:offline', (data) => {
      useChatStore.getState().removeOnlineUser(data.userId);
    });

    set({ socket });
  },

  disconnect: () => {
    disconnectSocket();
    set({ socket: null, isConnected: false });
  },

  sendMessage: (data) => {
    const { socket } = get();
    if (socket) {
      socket.emit('message:send', data);
    }
  },
}));
