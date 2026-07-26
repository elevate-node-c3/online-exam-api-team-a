import { DiplomaService, diplomaService } from './diploma.service.js';
import { Request, Response, NextFunction } from 'express';
import {
  forgetPassowrdOTPDTO,
  verifyForgetPasswordOTPDTO,
} from '../../common/schemas/auth.schema.js';
import { successRes } from '../../common/utils/response.util.js';

export class DiplomaController {
  constructor(private readonly diplomaService: DiplomaService) {}

  async createDiploma(req: Request, res: Response, next: NextFunction) {
    try {
      await this.diplomaService.sendForgetPasswordOTP(
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
  async getAllDiplomas(req: Request, res: Response, next: NextFunction) {
    try {
      await this.diplomaService.verifyForgotPasswordOTP(
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
}

export const diplomaController = new DiplomaController(diplomaService);
