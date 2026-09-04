import { Router } from 'express';
import { getMe, login, logout, refresh, register, updateAppearance } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';
import { loginLimiter, refreshLimiter, registerLimiter } from '../middleware/rateLimit.middleware';
import { appearanceSchema, loginSchema, registerSchema } from '../validators/auth.validators';

const router = Router();

router.post('/register', registerLimiter, validateBody(registerSchema), register);
router.post('/login', loginLimiter, validateBody(loginSchema), login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, validateBody(appearanceSchema), updateAppearance);

export default router;
