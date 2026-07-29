import { AuthService, authService } from './auth.service';
import { Request, Response, NextFunction } from 'express';
import {
  forgetPassowrdOTPDTO,
  resetPasswordDTO,
  verifyForgetPasswordOTPDTO,
} from '../../common/schemas/auth.schema';

import { RegisterDto } from '../../modules/auth/dto/register.dto';
import { successRes } from '../../common/utils/response.util';


export class AuthController {
  constructor(private readonly authService: AuthService) {}


  async registerController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.authService.register(req.body as RegisterDto);
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
      successRes({
        res,
        message: 'User logged in successfully',
        status: 200,
        data: { token: result.token },
      });
    } catch (error) {
      next(error);
    }
  }

  async logoutController(
    req: any,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.authService.logout({
        jti: req.credentials.jti,
        userId: req.credentials.user._id,
      });

      successRes({
        res,
        message: result.message,
        status: 200,
      });
    } catch (err) {
      next(err);
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
