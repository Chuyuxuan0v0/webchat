import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { userService } from './user.service';

export const userController = {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.getProfile(req.user!.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateProfile(req.user!.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  },

  async getOnlineUsers(_req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await userService.getOnlineUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  },
};
