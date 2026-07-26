import jwt from 'jsonwebtoken';
import {
  ADMIN_ACCESS_SECRET,
  USER_ACCESS_SECRET,
} from '../configs/env.config.js';
import {
  decodeTokenParams,
  generateTokenParams,
  verifyTokenParams,
} from '../types/global.types.js';

import { UserRepo, userRepo } from '../repositories/user.repo.js';

import { nanoid } from 'nanoid';
import {
  InternalServerErrorException,
  UnauthorizedException,
} from '../utils/exception.util.js';
import { UserRole } from '../enums/user.enum.js';

export const token_secrets = {
  user: USER_ACCESS_SECRET,

  admin: ADMIN_ACCESS_SECRET,
};

export class TokenService {
  constructor(private readonly userRepo: UserRepo) {}

  generateToken({ payload, options }: generateTokenParams) {
    try {
      const secretKey = token_secrets[payload.role];
      if (!secretKey) throw new Error('Invalid token or user type');
      const jti = nanoid(25);

      return jwt.sign(payload, secretKey, { ...options, jwtid: jti });
    } catch (err) {
      throw new InternalServerErrorException('Failed to generate token', {
        cause: err,
      });
    }
  }

  verifyToken({ role = UserRole.USER, token }: verifyTokenParams) {
    const secretKey = token_secrets[role];
    if (!secretKey) {
      throw new InternalServerErrorException('Invalid token or user type');
    }

    try {
      return jwt.verify(token, secretKey);
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token', {
        cause: err,
      });
    }
  }

  async decodeToken({ token }: decodeTokenParams) {
    const decoded = jwt.decode(token) as { role: UserRole } | null;

    if (!decoded?.role) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const jwtPayload = this.verifyToken({
      role: decoded.role,
      token,
    }) as unknown as {
      _id: string;
      jti: string;
      email: string;
      iat: number;
      role: UserRole;
    };

    const user = await this.userRepo.findOne({
      filter: {
        _id: jwtPayload._id,
      },
      options: {
        lean: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return {
      user,
      jti: jwtPayload.jti,
      iat: jwtPayload.iat,
    };
  }
}

export const tokenService = new TokenService(userRepo);
