import { NextFunction, Request, Response } from 'express';
import { errorRes } from '../utils';
import { redisService } from '../../DB';
import { IUser } from '../types';
import { tokenService } from '../services/token.service';
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user, jti, iat } = await tokenService.decodeToken({
      token: req.headers.authorization!,
    });

    if (!user) {
      return errorRes({
        res,
        message: 'user not found',
        status: 401,
      });
    }

    if (
      await redisService.exists(redisService.revokedTokenKey({ jti, userId: user._id }))
    ) {
      return errorRes({
        res,
        message: 'Invalid session. Please login again',
        status: 401,
      });
    }
    if (user.credentialsChangedAt) {
      if (iat < (user.credentialsChangedAt as Date).getTime() / 1000) {
        return errorRes({
          res,
          message: 'Invalid session. Please login again',
          status: 401,
        });
      }
    }

    req.credentials.user = user as unknown as IUser;
    req.credentials.jti = jti;

    next();
  } catch (err) {
    next(err);
  }
};
