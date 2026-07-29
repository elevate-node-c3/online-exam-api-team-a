import { IAppError } from '../types/error.types';

export type AppErrorOptions = ErrorOptions & {
  data?: Record<string, unknown> | undefined;
};

export class AppError extends Error implements IAppError {
  public data?: Record<string, unknown> | undefined;
  constructor(
    message: string,
    public statusCode: number,
    options?: AppErrorOptions,
  ) {
    super(message, options);
    this.data = options?.data;
  }
}

export class InternalServerErrorException extends AppError {
  constructor(
    message: string = 'Internal Server Error',
    options?: ErrorOptions,
  ) {
    super(message, 502, options);
  }
}

export class NotFoundException extends AppError {
  constructor(
    message: string = 'Resource request not found',
    options?: ErrorOptions,
  ) {
    super(message, 404, options);
  }
}

export class ConflictException extends AppError {
  constructor(
    message: string = 'Resource already exists',
    options?: ErrorOptions,
  ) {
    super(message, 409, options);
  }
}

export class UnauthorizedException extends AppError {
  constructor(message: string = 'Unauthorized', options?: AppErrorOptions) {
    super(message, 401, options);
  }
}

export class ForbiddenException extends AppError {
  constructor(message: string = 'Forbidden Action', options?: ErrorOptions) {
    super(message, 403, options);
  }
}

export class BadRequestException extends AppError {
  constructor(message: string = 'Bad Request', options?: AppErrorOptions) {
    super(message, 400, options);
  }
}

export class TooManyRequestsException extends AppError {
  constructor(
    message: string = 'Too Many Requests',
    options?: AppErrorOptions,
  ) {
    super(message, 429, options);
  }
}
