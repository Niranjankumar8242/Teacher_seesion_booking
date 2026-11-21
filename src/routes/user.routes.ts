import { Router } from 'express';
import { createUser, getUserSessions } from '../controllers/user.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const userRouter = Router();

userRouter.post('/', asyncHandler(createUser));
userRouter.get('/:id/sessions', asyncHandler(getUserSessions));
