import { NextFunction, Request, Response } from 'express';

export const initCredentials = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  req.credentials = { user: {}, jti: '' };
  next();
};
