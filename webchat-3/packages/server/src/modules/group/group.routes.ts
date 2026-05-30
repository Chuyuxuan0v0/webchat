import { Router, type IRouter } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { groupController } from './group.controller';

const router: IRouter = Router();

router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getGroups);
router.get('/:id', authMiddleware, groupController.getGroup);
router.put('/:id', authMiddleware, groupController.updateGroup);
router.post('/:id/members', authMiddleware, groupController.addMember);
router.delete('/:id/members/:userId', authMiddleware, groupController.removeMember);

export default router;
