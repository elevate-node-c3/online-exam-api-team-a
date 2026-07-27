import { QuizService, quizService } from './quiz.service.js';
import { Request, Response, NextFunction } from 'express';
import { unlink } from 'node:fs/promises';
import {
  createQuizDTO,
  quizListQueryDTO,
  updateQuizDTO,
} from '../../common/schemas/quiz.schema.js';
import { successRes } from '../../common/utils/response.util.js';

export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  async createQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.quizService.createQuiz(
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

  async updateQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.quizService.updateQuiz(
        req.params.id as string,
        req.body as updateQuizDTO,
        req.file as Express.Multer.File | undefined,
      );
      successRes({
        res,
        message: 'Quiz updated successfully',
        status: 200,
        data,
      });
    } catch (err) {
      if (req.file) await unlink(req.file.path).catch(() => {});
      next(err);
    }
  }

  async getQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.quizService.getQuiz(req.params.id as string);
      successRes({
        res,
        message: 'Quiz fetched successfully',
        status: 200,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async getQuizzesController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.quizService.getQuizzes(
        req.query as quizListQueryDTO,
      );
      successRes({
        res,
        message: 'Quizzes fetched successfully',
        status: 200,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      await this.quizService.deleteQuiz(req.params.id as string);
      successRes({
        res,
        message: 'Quiz deleted successfully',
        status: 200,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const quizController = new QuizController(quizService);
