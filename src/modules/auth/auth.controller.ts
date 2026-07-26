import { AuthService, authService } from './auth.service.js';
import { Request, Response, NextFunction } from 'express';
import {
  forgetPassowrdOTPDTO,
  resetPasswordDTO,
  verifyForgetPasswordOTPDTO,
} from '../../common/schemas/auth.schema.js';
import { successRes } from '../../common/utils/response.util.js';
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController(authService);
