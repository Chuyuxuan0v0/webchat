import { Message, IMessage } from '../../models';

export const chatService = {
  async saveMessage(data: {
    sender: string;
    content: string;
    type: 'text' | 'image' | 'file';
    chatType: 'group' | 'private';
    chatId: string;
    fileUrl?: string;
    fileName?: string;
  }) {
    const message = await Message.create(data);
    const populated = await message.populate('sender', 'username avatar avatarBgColor');
    return populated;
  },

  async getMessages(chatId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId })
        .populate('sender', 'username avatar avatarBgColor')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId }),
    ]);

    return {
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },
};
