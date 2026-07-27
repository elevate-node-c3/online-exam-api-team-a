import { NextFunction, Request, Response } from 'express';
import { IAppError } from '../types/error.types';
import { serverLogger } from '../utils/pino.util';

export const globalErrorHandler = (
  err: IAppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let status = err.statusCode;
  let message = err.message;

  if (!status) {
    const raw = err as unknown as {
      name?: string;
      code?: number | string;
      keyValue?: Record<string, unknown>;
    };

    if (raw.code === 11000) {
      status = 409;
      const field = Object.keys(raw.keyValue ?? {})[0];
      message = field ? `${field} already exists` : 'Resource already exists';
    } else if (raw.name === 'ValidationError' || raw.name === 'CastError') {
      status = 400;
    }
  }

  status = status || 502;

  if (status >= 500) {
    serverLogger.error({ err }, err.message);
    message = 'Something went wrong. Please try again later.';
  }

  res.status(status).json({
    statusCode: status,
    message: message || 'Internal Server Error',
    ...(err.data && { data: err.data }),
  });
};
