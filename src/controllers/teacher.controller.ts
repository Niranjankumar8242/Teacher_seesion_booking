import type { Request, Response } from 'express';
import { Teacher } from '../models/teacher.model.js';
import {
  requireEmail,
  requireNonNegativeNumber,
  requireObject,
  requireString,
} from '../utils/validation.js';

export const createTeacher = async (req: Request, res: Response): Promise<void> => {
  const body = requireObject(req.body);
  const teacher = await Teacher.create({
    fullName: requireString(body, 'fullName'),
    email: requireEmail(body),
    specialization: requireString(body, 'specialization'),
    experience: requireNonNegativeNumber(body, 'experience'),
  });

  res.status(201).json({ data: teacher });
};
