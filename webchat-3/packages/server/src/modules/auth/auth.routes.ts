import { Router, type IRouter } from 'express';
import { authController } from './auth.controller';
import { registerValidation, loginValidation } from './auth.validation';

const router: IRouter = Router();

router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

export default router;
