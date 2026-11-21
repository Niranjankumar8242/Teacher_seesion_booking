import { Router } from 'express';
import { createTeacher } from '../controllers/teacher.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

export const teacherRouter = Router();

teacherRouter.post('/', asyncHandler(createTeacher));
