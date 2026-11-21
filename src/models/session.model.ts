import { Schema, model, Types } from 'mongoose';
import { SESSION_STATUSES, type SessionStatus } from '../constants/session.js';

export interface ISession {
  teacherId: Types.ObjectId;
  userId: Types.ObjectId | null;
  startTime: Date;
  endTime: Date;
  status: SessionStatus;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'Teacher',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: 'AVAILABLE',
      required: true,
    },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false },
);

sessionSchema.index({ status: 1, startTime: 1 });
sessionSchema.index({ userId: 1, status: 1, startTime: 1 });

export const Session = model<ISession>('Session', sessionSchema);
