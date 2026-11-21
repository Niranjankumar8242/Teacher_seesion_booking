import type { Request, Response } from 'express';
import { User } from '../models/user.model.js';
import { Session } from '../models/session.model.js';
import { AppError } from '../errors/app-error.js';
import {
  objectId,
  requireEmail,
  requireObject,
  requirePathParam,
  requireString,
} from '../utils/validation.js';

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const body = requireObject(req.body);
  const user = await User.create({
    fullName: requireString(body, 'fullName'),
    email: requireEmail(body),
    phone: requireString(body, 'phone'),
  });

  res.status(201).json({ data: user });
};

export const getUserSessions = async (req: Request, res: Response): Promise<void> => {
  const userId = objectId(requirePathParam(req.params.id, 'user id'), 'user id');
  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new AppError(404, 'User not found');
  }

  const [result] = await Session.aggregate<{
    upcomingSessions: unknown[];
    completedSessions: unknown[];
  }>([
    { $match: { userId } },
    {
      $lookup: {
        from: 'teachers',
        localField: 'teacherId',
        foreignField: '_id',
        as: 'teacher',
      },
    },
    { $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        teacherId: 1,
        userId: 1,
        startTime: 1,
        endTime: 1,
        status: 1,
        completedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        teacher: {
          _id: '$teacher._id',
          fullName: '$teacher.fullName',
          email: '$teacher.email',
          specialization: '$teacher.specialization',
          experience: '$teacher.experience',
        },
      },
    },
    {
      $facet: {
        upcomingSessions: [
          { $match: { status: 'BOOKED' } },
          { $sort: { startTime: 1 } },
        ],
        completedSessions: [
          { $match: { status: 'COMPLETED' } },
          { $sort: { completedAt: -1 } },
        ],
      },
    },
  ]);

  res.status(200).json({
    data: result ?? { upcomingSessions: [], completedSessions: [] },
  });
};
