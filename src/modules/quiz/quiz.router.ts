import { Router } from 'express';
import { ROUTES } from '../../routes.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import { auth } from '../../common/middlewares/auth.middleware.js';
import { checkRole } from '../../common/middlewares/checkRole.middleware.js';
import { UserRole } from '../../common/enums/user.enum.js';
import {
  createQuizSchema,
  quizIdParamSchema,
  quizListQuerySchema,
  updateQuizSchema,
} from '../../common/schemas/quiz.schema.js';
import { uploadPhoto } from '../../common/utils/multer.util.js';
import { mutlerFileSchema } from '../../common/schemas/global.schema.js';
import { quizController } from './quiz.controller.js';

export const quizRouter = Router();

quizRouter.post(
  '/',
  auth,
  checkRole([UserRole.ADMIN]),
  uploadPhoto.single('quizPhoto'),
  validate({ body: createQuizSchema, file: mutlerFileSchema }),
  quizController.createQuizController.bind(quizController),
);

quizRouter.patch(
  ROUTES.QUIZ.BY_ID,
  auth,
  checkRole([UserRole.ADMIN]),
  uploadPhoto.single('quizPhoto'),
  validate({
    params: quizIdParamSchema,
    body: updateQuizSchema,
    file: mutlerFileSchema.optional(),
  }),
  quizController.updateQuizController.bind(quizController),
);

quizRouter.get(
  '/',
  auth,
  checkRole([UserRole.USER, UserRole.ADMIN]),
  validate({ query: quizListQuerySchema }),
  quizController.getQuizzesController.bind(quizController),
);

quizRouter.get(
  ROUTES.QUIZ.BY_ID,
  auth,
  checkRole([UserRole.USER, UserRole.ADMIN]),
  validate({ params: quizIdParamSchema }),
  quizController.getQuizController.bind(quizController),
);

quizRouter.delete(
  ROUTES.QUIZ.BY_ID,
  auth,
  checkRole([UserRole.ADMIN]),
  validate({ params: quizIdParamSchema }),
  quizController.deleteQuizController.bind(quizController),
);
