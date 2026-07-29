import { Router } from 'express';
import { UserRole } from '../../common/enums/user.enum';
import { auth } from '../../common/middlewares/auth.middleware';
import { checkRole } from '../../common/middlewares/checkRole.middleware';
import { validate } from '../../common/middlewares/validation.middleware';
import {
  attemptIdParamSchema,
  attemptListQuerySchema,
  submitAttemptSchema,
} from '../../common/schemas/attempt.schema';
import { ROUTES } from '../../routes';
import { attemptController } from './attempt.controller';

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
