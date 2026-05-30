import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { groupService } from './group.service';

export const groupController = {
  async createGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.createGroup(req.user!.id, req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  },

  async getGroups(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const groups = await groupService.getGroups(req.user!.id);
      res.json(groups);
    } catch (error) {
      next(error);
    }
  },

  async getGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.getGroup(String(req.params.id));
      res.json(group);
    } catch (error) {
      next(error);
    }
  },

  async updateGroup(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.updateGroup(
        String(req.params.id),
        req.user!.id,
        req.body
      );
      res.json(group);
    } catch (error) {
      next(error);
    }
  },

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.addMember(
        String(req.params.id),
        req.user!.id,
        req.body.memberId
      );
      res.json(group);
    } catch (error) {
      next(error);
    }
  },

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const group = await groupService.removeMember(
        String(req.params.id),
        req.user!.id,
        String(req.params.userId)
      );
      res.json(group);
    } catch (error) {
      next(error);
    }
  },
};
