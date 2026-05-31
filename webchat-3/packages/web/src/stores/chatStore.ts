import { create } from 'zustand';
import { Message, User } from '@webchat/shared';
import { messageAPI, userAPI } from '../services/api';

interface ChatState {
  messages: Message[];
  onlineUsers: User[];
  activeChat: { id: string; type: 'group' | 'private'; name: string } | null;
  isLoading: boolean;
  hasMore: boolean;
  currentPage: number;

  setActiveChat: (chat: { id: string; type: 'group' | 'private'; name: string }) => void;
  addMessage: (message: Message) => void;
  loadMessages: (chatId: string) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  loadOnlineUsers: () => Promise<void>;
  setOnlineUsers: (users: User[]) => void;
  addOnlineUser: (user: { userId: string; username: string }) => void;
  removeOnlineUser: (userId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  onlineUsers: [],
  activeChat: null,
  isLoading: false,
  hasMore: true,
  currentPage: 1,

  setActiveChat: (chat) => {
    set({ activeChat: chat, messages: [], hasMore: true, currentPage: 1 });
    get().loadMessages(chat.id);
  },

  addMessage: (message) => {
    const { activeChat } = get();
    if (activeChat && message.chatId === activeChat.id) {
      set((state) => ({ messages: [...state.messages, message] }));
    }
  },

  loadMessages: async (chatId) => {
    set({ isLoading: true });
    try {
      const { data } = await messageAPI.getMessages(chatId, 1);
      set({
        messages: data.messages,
        isLoading: false,
        currentPage: 1,
        hasMore: data.totalPages > 1,
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoading: false });
    }
  },

  loadMoreMessages: async () => {
    const { hasMore, isLoading, activeChat, currentPage, messages } = get();
    if (!hasMore || isLoading || !activeChat) return;

    set({ isLoading: true });
    try {
      const nextPage = currentPage + 1;
      const { data } = await messageAPI.getMessages(activeChat.id, nextPage);
      set({
        messages: [...data.messages, ...messages],
        currentPage: nextPage,
        hasMore: nextPage < data.totalPages,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load more messages:', error);
      set({ isLoading: false });
    }
  },

  loadOnlineUsers: async () => {
    try {
      const { data } = await userAPI.getOnlineUsers();
      set({ onlineUsers: data });
    } catch (error) {
      console.error('Failed to load online users:', error);
    }
  },

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  addOnlineUser: (user) => {
    set((state) => {
      const exists = state.onlineUsers.some((u) => u._id === user.userId);
      if (exists) return state;
      return {
        onlineUsers: [...state.onlineUsers, {
          _id: user.userId,
          username: user.username,
          email: '',
          avatarBgColor: '#4ECDC4',
          status: 'online' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
      };
    });
  },

  removeOnlineUser: (userId) => {
    set((state) => ({
      onlineUsers: state.onlineUsers.filter((u) => u._id !== userId),
    }));
  },
}));
