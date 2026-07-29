import { Router } from 'express';
import { UserRole } from '../../common/enums/user.enum.js';
import { auth } from '../../common/middlewares/auth.middleware.js';
import { checkRole } from '../../common/middlewares/checkRole.middleware.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import {
  attemptIdParamSchema,
  attemptListQuerySchema,
  submitAttemptSchema,
} from '../../common/schemas/attempt.schema.js';
import { ROUTES } from '../../routes.js';
import { attemptController } from './attempt.controller.js';

export const attemptRouter = Router();

attemptRouter.use(auth, checkRole([UserRole.USER]));

attemptRouter.get(
  '/',
  validate({ query: attemptListQuerySchema }),
  attemptController.getAttemptsController.bind(attemptController),
);

attemptRouter.get(
  ROUTES.ATTEMPT.BY_ID,
  validate({ params: attemptIdParamSchema }),
  attemptController.getAttemptController.bind(attemptController),
);

attemptRouter.post(
  ROUTES.ATTEMPT.SUBMIT,
  validate({ params: attemptIdParamSchema, body: submitAttemptSchema }),
  attemptController.submitAttemptController.bind(attemptController),
);
