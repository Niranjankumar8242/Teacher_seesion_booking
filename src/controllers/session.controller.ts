import type { Request, Response } from 'express';
import { Session } from '../models/session.model.js';
import { Teacher } from '../models/teacher.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../errors/app-error.js';
import {
  objectId,
  parseDateTimestamp,
  requireDate,
  requireObject,
  requirePathParam,
  requireString,
} from '../utils/validation.js';

export const createSession = async (req: Request, res: Response): Promise<void> => {
  const body = requireObject(req.body);
  const teacherId = objectId(requireString(body, 'teacherId'), 'teacherId');
  const startTime = requireDate(body, 'startTime');
  const endTime = requireDate(body, 'endTime');

  if (endTime <= startTime) {
    throw new AppError(400, 'endTime must be greater than startTime');
  }

  const teacherExists = await Teacher.exists({ _id: teacherId });
  if (!teacherExists) {
    throw new AppError(404, 'Teacher not found');
  }

  const session = await Session.create({ teacherId, startTime, endTime });
  res.status(201).json({ data: session });
};

export const getAvailableSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const suppliedDate = parseDateTimestamp(req.query.dateTimestamp);
  const startOfDay = new Date(suppliedDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

  const sessions = await Session.aggregate([
    {
      $match: {
        status: 'AVAILABLE',
        startTime: { $gte: startOfDay, $lt: endOfDay },
      },
    },
    { $sort: { startTime: 1 } },
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
  ]);

  res.status(200).json({ data: sessions });
};

export const bookSession = async (req: Request, res: Response): Promise<void> => {
  const sessionId = objectId(
    requirePathParam(req.params.id, 'session id'),
    'session id',
  );
  const body = requireObject(req.body);
  const userId = objectId(requireString(body, 'userId'), 'userId');

  const userExists = await User.exists({ _id: userId });
  if (!userExists) {
    throw new AppError(404, 'User not found');
  }

  const session = await Session.findOneAndUpdate(
    { _id: sessionId, status: 'AVAILABLE' },
    { $set: { status: 'BOOKED', userId } },
    { new: true, runValidators: true },
  );

  if (!session) {
    const existingSession = await Session.findById(sessionId).select('status').lean();
    if (!existingSession) {
      throw new AppError(404, 'Session not found');
    }
    throw new AppError(409, `Only AVAILABLE sessions can be booked; current status is ${existingSession.status}`);
  }

  res.status(200).json({ data: session });
};

export const completeSession = async (req: Request, res: Response): Promise<void> => {
  const sessionId = objectId(
    requirePathParam(req.params.id, 'session id'),
    'session id',
  );
  const session = await Session.findOneAndUpdate(
    { _id: sessionId, status: 'BOOKED' },
    { $set: { status: 'COMPLETED', completedAt: new Date() } },
    { new: true, runValidators: true },
  );

  if (!session) {
    const existingSession = await Session.findById(sessionId).select('status').lean();
    if (!existingSession) {
      throw new AppError(404, 'Session not found');
    }
    throw new AppError(409, `Only BOOKED sessions can be completed; current status is ${existingSession.status}`);
  }

  res.status(200).json({ data: session });
};
