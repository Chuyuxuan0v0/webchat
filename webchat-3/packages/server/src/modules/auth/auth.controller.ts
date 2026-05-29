import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authService } from './auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { email, username, password } = req.body;
      const result = await authService.register({ email, username, password });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ error: errors.array()[0].msg });
        return;
      }

      const { email, password } = req.body;
      const result = await authService.login({ email, password });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};
