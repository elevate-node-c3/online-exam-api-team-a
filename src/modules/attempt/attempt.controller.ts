import { NextFunction, Request, Response } from 'express';
import {
  attemptListQueryDTO,
  submitAttemptDTO,
} from '../../common/schemas/attempt.schema';
import { successRes } from '../../common/utils/response.util';
import { AttemptService, attemptService } from './attempt.service';

export class AttemptController {
  constructor(private readonly attemptService: AttemptService) {}

  async startQuizController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.attemptService.startQuiz(
        req.params.id! as string,
        req.credentials.user._id!.toString(),
        req.requestedAt,
      );
      return successRes({ res, message: 'Attempt started', status: 201, data });
    } catch (error) {
      next(error);
    }
  }

  async getAttemptsController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.attemptService.getAttempts(
        req.credentials.user._id!.toString(),
        req.query as unknown as attemptListQueryDTO,
      );
      return successRes({
        res,
        message: 'Attempts retrieved',
        status: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttemptController(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.attemptService.getAttempt(
        req.params.id! as string,
        req.credentials.user._id!.toString(),
      );
      return successRes({
        res,
        message: 'Attempt retrieved',
        status: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  async submitAttemptController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = await this.attemptService.submitAttempt(
        req.params.id! as string,
        req.credentials.user._id!.toString(),
        req.body as submitAttemptDTO,
        req.requestedAt,
      );
      return successRes({
        res,
        message: 'Attempt submitted',
        status: 200,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const attemptController = new AttemptController(attemptService);
