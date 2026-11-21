import type { ErrorRequestHandler, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

interface MongoDuplicateError extends Error {
  code: number;
  keyValue?: Record<string, unknown>;
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    details = error.details;
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(error.errors).map((item) => item.message);
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${error.path}`;
  } else if (
    error instanceof Error &&
    'code' in error &&
    (error as MongoDuplicateError).code === 11_000
  ) {
    const duplicateError = error as MongoDuplicateError;
    statusCode = 409;
    const field = Object.keys(duplicateError.keyValue ?? {})[0] ?? 'field';
    message = `${field} already exists`;
  }

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(details !== undefined ? { details } : {}),
      ...(env.nodeEnv === 'development' && error instanceof Error
        ? { stack: error.stack }
        : {}),
    },
  });
};
