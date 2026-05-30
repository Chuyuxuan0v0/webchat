import { Router, type IRouter } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { chatController } from './chat.controller';

const router: IRouter = Router();

router.get('/:chatId', authMiddleware, chatController.getMessages);

export default router;
