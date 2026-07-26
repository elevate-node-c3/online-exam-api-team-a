import { validate } from '../../common/middlewares/validation.middleware.js';
import {
  forgetPassowrdOTPSchema,
  resetPasswordSchema,
  verifyForgetPasswordOTPSchema,
} from '../../common/schemas/auth.schema.js';
import { ROUTES } from '../../routes.js';
import { authController } from './auth.controller.js';
import { Router } from 'express';

const authRouter = Router();

authRouter.post(
  ROUTES.AUTH.SEND_FORGOT_PASSWORD_OTP,
  validate({ body: forgetPassowrdOTPSchema }),
  authController.sendForgotPasswordOTPController.bind(authController),
);

authRouter.post(
  ROUTES.AUTH.VERIFY_FORGOT_PASSWORD_OTP,
  validate({ body: verifyForgetPasswordOTPSchema }),
  authController.verfiyForgotPasswordOTPController.bind(authController),
);

authRouter.post(
  ROUTES.AUTH.RESET_PASSWORD,
  validate({ body: resetPasswordSchema }),
  authController.resetPasswordController.bind(authController),
);

export default authRouter;
