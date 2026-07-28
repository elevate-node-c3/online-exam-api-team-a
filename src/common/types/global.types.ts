import { Response, Request } from 'express';
import { IUser } from './user.types';
import { UserRole } from '../enums/user.enum';
import { SignOptions } from 'jsonwebtoken';

export interface successResponseDTO<T> {
  res: Response;
  message: string;
  status: number;
  data?: T;
}

export interface errorResponseDTO<T> {
  res: Response;
  message: string;
  status: number;
  error?: T;
}

export interface uploadOpts {
  maxSizeMB: number;
  allowedMimTypes: string[];
  buildFileName: (req: Request, file: Express.Multer.File) => string;
}

declare global {
  namespace Express {
    interface Request {
      requestedAt: Date;
      credentials: {
        user: Partial<IUser>;
        jti: string;
      };
    }
  }
}

export interface generateTokenParams {
  payload: {
    _id: string;
    email: string;
    role: UserRole;
  };
  options?: SignOptions | undefined;
}

export interface verifyTokenParams {
  role: UserRole;
  token: string;
}

export interface decodeTokenParams {
  token: string;
}
