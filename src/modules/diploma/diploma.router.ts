import { validate } from '../../common/middlewares/validation.middleware.js';
import {
  forgetPassowrdOTPSchema,
  resetPasswordSchema,
  verifyForgetPasswordOTPSchema,
} from '../../common/schemas/auth.schema.js';
import { ROUTES } from '../../routes.js';
import { diplomaController } from './diploma.controller.js';
import { Router } from 'express';

const authRouter = Router();

authRouter.post(
  ROUTES.DIPLOMA.BASE,
  validate({ body: forgetPassowrdOTPSchema }),
  diplomaController.createDiploma.bind(diplomaController),
);

authRouter.get(
  ROUTES.DIPLOMA.BASE,
  validate({ body: verifyForgetPasswordOTPSchema }),
  diplomaController.getAllDiplomas.bind(diplomaController),
);

export default authRouter;
