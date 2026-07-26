import { QuizService, quizService } from './quiz.service.js';
import { Request, Response, NextFunction } from 'express';
import { unlink } from 'node:fs/promises';
import { createQuizDTO } from '../../common/schemas/quiz.schema.js';
import { successRes } from '../../common/utils/response.util.js';

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  async createQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = this.quizService.createQuiz(
        req.body as createQuizDTO,
        req.file as Express.Multer.File,
      );
      successRes({
        res,
        message: 'Quiz created successfully',
        status: 201,
        data,
      });
    } catch (err) {
      await unlink(req.file!.path as string).catch(() => {});
      next(err);
    }
  }
}

export const quizController = new QuizController(quizService);
