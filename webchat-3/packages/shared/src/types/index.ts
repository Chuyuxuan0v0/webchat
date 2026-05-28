export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  avatarBgColor: string;
  status: 'online' | 'offline' | 'away';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  avatarBgColor: string;
  owner: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  content: string;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  chatType: 'group' | 'private';
  chatId: string;
  createdAt: string;
}

export interface SocketEvents {
  'message:send': {
    chatId: string;
    content: string;
    type: 'text' | 'image' | 'file';
    chatType: 'group' | 'private';
    fileUrl?: string;
    fileName?: string;
  };
  'message:receive': Message;
  'user:online': { userId: string; username: string };
  'user:offline': { userId: string; username: string };
  'typing:start': { chatId: string };
  'typing:stop': { chatId: string };
  'typing:indicator': { chatId: string; userId: string; username: string };
}
