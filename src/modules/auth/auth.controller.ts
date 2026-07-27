import { AuthService, authService } from './auth.service';
import { Request, Response, NextFunction } from 'express';
import {
  forgetPassowrdOTPDTO,
  registerDTO,
  resetPasswordDTO,
  verifyForgetPasswordOTPDTO,
} from '../../common/schemas/auth.schema';

import { successRes } from '../../common/utils/response.util';
import { accessTokenCookieOptions } from '../../common/configs/cookie.config';
export class AuthController {
  constructor(private readonly authService: AuthService) {}


    async registerController(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const result = await this.authService.register(req.body as registerDTO);
        res.cookie('accessToken', result.token, accessTokenCookieOptions);
        successRes({
          res,
          message: 'User registered successfully',
          status: 201,
          data: result,
        });
      } catch (error) {
        next(error);
      }
    }

    async loginController(
      req: Request,
      res: Response,
      next: NextFunction,
    ) {
      try {
        const result = await this.authService.login(req.body);
        res.cookie('accessToken', result.token, accessTokenCookieOptions);
        successRes({
          res,
          message: 'User logged in successfully',
          status: 200,
        });
      } catch (error) {
        next(error);
      }
    }
    

  async sendForgotPasswordOTPController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.sendForgetPasswordOTP(
        req.body as forgetPassowrdOTPDTO,
      );
      successRes({
        res,
        message: 'Password reset code sent successfully',
        status: 200,
      });
    } catch (err) {
      next(err);
    }
  }
  async verfiyForgotPasswordOTPController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.verifyForgotPasswordOTP(
        req.body as verifyForgetPasswordOTPDTO,
      );
      successRes({
        res,
        message: 'OTP verified',
        status: 200,
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPasswordController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      await this.authService.resetPassword(req.body as resetPasswordDTO);
      successRes({
        res,
        message: 'Password reset successfully',
        status: 200,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController(authService);
