import { Server, Socket } from 'socket.io';
import { chatService } from '../../modules/chat/chat.service';

export const messageHandler = (io: Server, socket: Socket) => {
  socket.on('message:send', async (data) => {
    try {
      const userId = (socket as any).userId;

      const message = await chatService.saveMessage({
        sender: userId,
        content: data.content,
        type: data.type || 'text',
        chatType: data.chatType,
        chatId: data.chatId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
      });

      if (data.chatType === 'group') {
        io.emit('message:receive', message);
      } else {
        socket.emit('message:receive', message);

        const otherUserId = data.chatId.split('_').find((id: string) => id !== userId);
        const receiverSocket = Array.from(io.sockets.sockets.values())
          .find((s) => (s as any).userId === otherUserId);

        if (receiverSocket) {
          receiverSocket.emit('message:receive', message);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
};
