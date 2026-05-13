import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

const asyncHandler = (fn: any) => (req: express.Request, res: express.Response, next: express.NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post('/login', asyncHandler(login));
router.post('/register', asyncHandler(register));

export default router;
