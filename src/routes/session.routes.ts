import { Router } from 'express';
import {
  bookSession,
  completeSession,
  createSession,
  getAvailableSessions,
} from '../controllers/session.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const sessionRouter = Router();

sessionRouter.post('/', asyncHandler(createSession));
sessionRouter.get('/available', asyncHandler(getAvailableSessions));
sessionRouter.post('/:id/book', asyncHandler(bookSession));
sessionRouter.patch('/:id/complete', asyncHandler(completeSession));
