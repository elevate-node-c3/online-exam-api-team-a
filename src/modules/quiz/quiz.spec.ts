import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import type { QuizService } from './quiz.service.js';

const unlink = jest
  .fn<(path: string) => Promise<void>>()
  .mockResolvedValue(undefined);

jest.unstable_mockModule('node:fs/promises', () => ({ unlink }));

const { QuizController } = await import('./quiz.controller.js');

const buildRes = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as unknown as Response['status'];
  res.json = jest.fn().mockReturnValue(res) as unknown as Response['json'];
  return res;
};

type MockedQuizService = {
  [K in keyof QuizService]: jest.MockedFunction<QuizService[K]>;
};

const buildQuizServiceMock = (): MockedQuizService => ({
  createQuiz: jest.fn(),
  updateQuiz: jest.fn(),
  getQuiz: jest.fn(),
  getQuizzes: jest.fn(),
  deleteQuiz: jest.fn(),
});

describe('QuizController', () => {
  let quizService: MockedQuizService;
  let controller: InstanceType<typeof QuizController>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    quizService = buildQuizServiceMock();
    controller = new QuizController(quizService as unknown as QuizService);
    res = buildRes();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createQuizController', () => {
    it('creates a quiz and responds 201 with the created quiz', async () => {
      const createdQuiz = { _id: 'quiz-1', quizName: 'Networking Final' };
      quizService.createQuiz.mockResolvedValue(createdQuiz as never);
      const req = {
        body: { quizName: 'Networking Final' },
        file: { path: '/uploads/photo.jpg' },
      } as unknown as Request;

      await controller.createQuizController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 201, data: createdQuiz }),
      );
    });

  });

  describe('updateQuizController', () => {
    it('updates a quiz and responds 200 with the updated quiz', async () => {
      const updatedQuiz = { _id: 'quiz-1', quizName: 'Networking Final v2' };
      quizService.updateQuiz.mockResolvedValue(updatedQuiz as never);
      const req = {
        params: { id: 'quiz-1' },
        body: { quizName: 'Networking Final v2' },
      } as unknown as Request;

      await controller.updateQuizController(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 200, data: updatedQuiz }),
      );
    });

  

    it('does not attempt to delete a file when update fails without a new photo', async () => {
      const error = new Error('quiz not found');
      quizService.updateQuiz.mockRejectedValue(error);
      const req = {
        params: { id: 'quiz-1' },
        body: {},
        file: undefined,
      } as unknown as Request;

      await controller.updateQuizController(req, res, next);

      expect(unlink).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getQuizController', () => {
    it('fetches a quiz by id and responds 200', async () => {
      const quiz = { _id: 'quiz-1', quizName: 'Networking Final' };
      quizService.getQuiz.mockResolvedValue(quiz as never);
      const req = { params: { id: 'quiz-1' } } as unknown as Request;

      await controller.getQuizController(req, res, next);

      expect(quizService.getQuiz).toHaveBeenCalledWith('quiz-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: quiz }),
      );
    });

  
  });

  describe('getQuizzesController', () => {
    it('passes query params through and responds with the paginated result', async () => {
      const result = { docs: [], meta: { page: 1 } };
      quizService.getQuizzes.mockResolvedValue(result as never);
      const req = {
        query: { query: 'networking', page: 1, size: 10 },
      } as unknown as Request;

      await controller.getQuizzesController(req, res, next);

      expect(quizService.getQuizzes).toHaveBeenCalledWith(req.query);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: result }),
      );
    });
  });

  describe('deleteQuizController', () => {
    it('deletes a quiz and responds 200 without a data payload', async () => {
      quizService.deleteQuiz.mockResolvedValue(undefined);
      const req = { params: { id: 'quiz-1' } } as unknown as Request;

      await controller.deleteQuizController(req, res, next);

      expect(quizService.deleteQuiz).toHaveBeenCalledWith('quiz-1');
      expect(res.status).toHaveBeenCalledWith(200);
      const [body] = (res.json as jest.Mock).mock.calls[0] as [
        Record<string, unknown>,
      ];
      expect(body).not.toHaveProperty('data');
    });


  });
});
