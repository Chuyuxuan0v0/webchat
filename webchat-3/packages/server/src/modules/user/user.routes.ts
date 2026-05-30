import { Router, type IRouter } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { userController } from './user.controller';

const router: IRouter = Router();

router.get('/me', authMiddleware, userController.getProfile);
router.put('/me', authMiddleware, userController.updateProfile);
router.get('/online', authMiddleware, userController.getOnlineUsers);

export default router;
