import { Types } from 'mongoose';
import { AppError } from '../errors/app-error.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const requireObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new AppError(400, 'Request body must be a JSON object');
  }
  return value as Record<string, unknown>;
};

export const requireString = (
  body: Record<string, unknown>,
  field: string,
): string => {
  const value = body[field];
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, `${field} is required and must be a non-empty string`);
  }
  return value.trim();
};

export const requireEmail = (body: Record<string, unknown>): string => {
  const email = requireString(body, 'email').toLowerCase();
  if (!emailPattern.test(email) || email.length > 254) {
    throw new AppError(400, 'email must be a valid email address');
  }
  return email;
};

export const requireNonNegativeNumber = (
  body: Record<string, unknown>,
  field: string,
): number => {
  const value = body[field];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new AppError(400, `${field} must be a non-negative number`);
  }
  return value;
};

export const requireDate = (
  body: Record<string, unknown>,
  field: string,
): Date => {
  const value = body[field];
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AppError(400, `${field} must be an ISO date string or Unix timestamp`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, `${field} must be a valid date`);
  }
  return date;
};

export const objectId = (value: string, field = 'id'): Types.ObjectId => {
  if (!Types.ObjectId.isValid(value)) {
    throw new AppError(400, `${field} must be a valid MongoDB ObjectId`);
  }
  return new Types.ObjectId(value);
};

export const requirePathParam = (
  value: string | string[] | undefined,
  field: string,
): string => {
  if (typeof value !== 'string' || !value) {
    throw new AppError(400, `${field} is required`);
  }
  return value;
};

export const parseDateTimestamp = (value: unknown): Date => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new AppError(400, 'dateTimestamp query parameter is required');
  }

  const trimmed = value.trim();
  const date = /^\d+$/.test(trimmed)
    ? new Date(Number(trimmed))
    : new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(400, 'dateTimestamp must be a valid Unix millisecond timestamp or ISO date');
  }
  return date;
};
