import { NextFunction, Request, Response } from 'express';
import { UserRole } from '../enums';
import { ForbiddenException } from '../utils';

export const checkRole = (allowedRoles: UserRole[] = [UserRole.USER]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!allowedRoles.includes(req.credentials.user?.role as UserRole)) {
        throw new ForbiddenException(
          'You do not have permission to access this resource',
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};
