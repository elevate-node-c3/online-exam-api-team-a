import { Response, Request } from 'express';
import { IUser } from './user.types.js';

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
      };
    }
  }
}
