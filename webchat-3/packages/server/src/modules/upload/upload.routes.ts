import { Router, type IRouter } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';
import { uploadController } from './upload.controller';

const router: IRouter = Router();

router.post('/', authMiddleware, upload.single('file'), uploadController.uploadFile);

export default router;
