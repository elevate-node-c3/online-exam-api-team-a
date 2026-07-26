import { Router } from 'express';
import { ROUTES } from '../../routes.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import {
  createQuizSchema,
  quizIdParamSchema,
  updateQuizSchema,
} from '../../common/schemas/quiz.schema.js';
import { uploadPhoto } from '../../common/utils/multer.util.js';
import { mutlerFileSchema } from '../../common/schemas/global.schema.js';
import { quizController } from './quiz.controller.js';

export const quizRouter = Router();

quizRouter.post(
  ROUTES.QUIZ.BASE,
  uploadPhoto.single('quizPhoto'),
  validate({ body: createQuizSchema, file: mutlerFileSchema }),
  quizController.createQuizController.bind(quizController),
);

quizRouter.patch(
  ROUTES.QUIZ.UPDATE,
  uploadPhoto.single('quizPhoto'),
  validate({
    params: quizIdParamSchema,
    body: updateQuizSchema,
    file: mutlerFileSchema.optional(),
  }),
  quizController.updateQuizController.bind(quizController),
);
