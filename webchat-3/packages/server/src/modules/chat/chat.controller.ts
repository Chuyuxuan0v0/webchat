import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { chatService } from './chat.service';

export const chatController = {
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chatId = String(req.params.chatId);
      const page = parseInt(String(req.query.page)) || 1;
      const limit = parseInt(String(req.query.limit)) || 50;

      const result = await chatService.getMessages(chatId, page, limit);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
