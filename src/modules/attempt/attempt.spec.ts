import { describe, expect, it, jest } from '@jest/globals';
import { Types } from 'mongoose';
import { AttemptStatus } from '../../common/enums/attempt.enum';
import { QuestionType } from '../../common/enums/quiz.enum';
import type {
  IAttempt,
  IAttemptAnswers,
} from '../../common/types/attempt.types';
import { NotFoundException } from '../../common/utils/exception.util';
import { AttemptService } from './attempt.service';

type RepoMethod = (...args: unknown[]) => Promise<unknown>;
type AttemptRepoMock = {
  findOne: jest.MockedFunction<RepoMethod>;
  updateOne: jest.MockedFunction<RepoMethod>;
  updateMany: jest.MockedFunction<RepoMethod>;
};
type AttemptAnswerRepoMock = Pick<AttemptRepoMock, 'findOne' | 'updateOne'>;
type QuizRepoMock = Pick<AttemptRepoMock, 'findOne'>;
type UserRepoMock = Pick<AttemptRepoMock, 'updateOne'>;

const mockRepoMethod = () => jest.fn<RepoMethod>();

const userId = new Types.ObjectId();
const quizId = new Types.ObjectId();
const attemptId = new Types.ObjectId();
const questionOneId = new Types.ObjectId();
const questionTwoId = new Types.ObjectId();
const optionOneId = new Types.ObjectId();
const optionTwoId = new Types.ObjectId();
const optionThreeId = new Types.ObjectId();

const buildAttempt = (overrides: Partial<IAttempt> = {}) =>
  ({
    _id: attemptId,
    userId,
    quizId,
    status: AttemptStatus.IN_PROGRESS,
    startTime: new Date('2026-07-29T10:00:00.000Z'),
    expiresAt: new Date('2026-07-29T11:00:00.000Z'),
    submittedAt: null,
    timeSpentSeconds: null,
    scorePercentage: null,
    passed: null,
    correctCount: null,
    totalQuestionsSnapshot: 2,
    timeLimitSecondsSnapshot: 3600,
    passingThresholdSnapshot: 80,
    ...overrides,
  }) as IAttempt;

const buildAnswerSnapshot = () =>
  ({
    _id: new Types.ObjectId(),
    attemptId,
    questions: [
      {
        questionId: questionOneId,
        text: 'Which protocol is connection-oriented?',
        type: QuestionType.RADIO_BUTTON,
        options: [
          { optionId: optionOneId, text: 'TCP' },
          { optionId: optionTwoId, text: 'UDP' },
        ],
        correctOptionIds: [optionOneId],
        selectedOptionIds: [],
        isCorrect: null,
      },
      {
        questionId: questionTwoId,
        text: 'Select the private ranges',
        type: QuestionType.CHECK_BOX,
        options: [
          { optionId: optionTwoId, text: '10.0.0.0/8' },
          { optionId: optionThreeId, text: '8.8.8.8' },
        ],
        correctOptionIds: [optionTwoId],
        selectedOptionIds: [],
        isCorrect: null,
      },
    ],
  }) as unknown as IAttemptAnswers;

const buildRepos = () => {
  const attemptRepo = {
    findOne: mockRepoMethod(),
    updateOne: mockRepoMethod(),
    updateMany: mockRepoMethod().mockResolvedValue({ modifiedCount: 0 }),
  } as AttemptRepoMock;
  const attemptAnswerRepo = {
    findOne: mockRepoMethod(),
    updateOne: mockRepoMethod(),
  } as AttemptAnswerRepoMock;
  const quizRepo = { findOne: mockRepoMethod() } as QuizRepoMock;
  const userRepo = { updateOne: mockRepoMethod() } as UserRepoMock;

  return { attemptRepo, attemptAnswerRepo, quizRepo, userRepo };
};

describe('AttemptService.submitAttempt', () => {
  it('grades exact option sets, applies the threshold, and caps server time', async () => {
    const repos = buildRepos();
    const attempt = buildAttempt({
      passingThresholdSnapshot: 50,
      timeLimitSecondsSnapshot: 600,
    });
    repos.attemptRepo.findOne = mockRepoMethod()
      .mockResolvedValueOnce(attempt)
      .mockResolvedValueOnce(attempt);
    repos.attemptRepo.updateOne = mockRepoMethod().mockResolvedValue({
      modifiedCount: 1,
    });
    repos.attemptAnswerRepo.findOne = mockRepoMethod().mockResolvedValue(
      buildAnswerSnapshot(),
    );
    repos.attemptAnswerRepo.updateOne = mockRepoMethod().mockResolvedValue({
      modifiedCount: 1,
    });
    const service = new AttemptService(
      repos.attemptRepo as never,
      repos.attemptAnswerRepo as never,
      repos.quizRepo as never,
      repos.userRepo as never,
    );

    const result = await service.submitAttempt(
      String(attemptId),
      String(userId),
      {
        answers: [
          {
            questionId: String(questionOneId),
            selectedOptionIds: [String(optionOneId)],
          },
          {
            questionId: String(questionTwoId),
            selectedOptionIds: [String(optionTwoId)],
          },
        ],
      },
      new Date('2026-07-29T10:20:00.999Z'),
    );

    expect(result).toMatchObject({
      scorePercentage: 100,
      passed: true,
      correctCount: 2,
      totalQuestions: 2,
      timeSpentSeconds: 600,
    });
    expect(repos.attemptRepo.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: expect.objectContaining({
          _id: attemptId,
          userId: String(userId),
          status: AttemptStatus.IN_PROGRESS,
        }),
        update: expect.objectContaining({
          $set: expect.objectContaining({ scorePercentage: 100, passed: true }),
        }),
      }),
    );
    expect(repos.attemptAnswerRepo.updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({
          $set: { questions: expect.any(Array) },
        }),
      }),
    );
    expect(repos.userRepo.updateOne).toHaveBeenCalledWith({
      filter: { _id: String(userId) },
      update: {
        $inc: { correctAnswers: 2, quizzesPassed: 1 },
        $min: { fastestTime: 600 },
      },
    });
  });

  it('uses exact-set grading with no partial credit', async () => {
    const repos = buildRepos();
    const attempt = buildAttempt({ passingThresholdSnapshot: 80 });
    repos.attemptRepo.findOne = mockRepoMethod().mockResolvedValue(attempt);
    repos.attemptRepo.updateOne = mockRepoMethod().mockResolvedValue({
      modifiedCount: 1,
    });
    repos.attemptAnswerRepo.findOne = mockRepoMethod().mockResolvedValue(
      buildAnswerSnapshot(),
    );
    repos.attemptAnswerRepo.updateOne = mockRepoMethod().mockResolvedValue({
      modifiedCount: 1,
    });
    const service = new AttemptService(
      repos.attemptRepo as never,
      repos.attemptAnswerRepo as never,
      repos.quizRepo as never,
      repos.userRepo as never,
    );

    const result = await service.submitAttempt(
      String(attemptId),
      String(userId),
      {
        answers: [
          {
            questionId: String(questionOneId),
            selectedOptionIds: [String(optionOneId), String(optionTwoId)],
          },
          {
            questionId: String(questionTwoId),
            selectedOptionIds: [String(optionThreeId)],
          },
        ],
      },
    );

    expect(result).toMatchObject({
      scorePercentage: 0,
      passed: false,
      correctCount: 0,
    });
    expect(repos.userRepo.updateOne).toHaveBeenCalledWith({
      filter: { _id: String(userId) },
      update: {
        $inc: { correctAnswers: 0, quizzesPassed: 0 },
        $min: { fastestTime: expect.any(Number) },
      },
    });
  });

  it('rejects an attempt owned by another user without exposing it', async () => {
    const repos = buildRepos();
    repos.attemptRepo.findOne = mockRepoMethod().mockResolvedValue(null);
    const service = new AttemptService(
      repos.attemptRepo as never,
      repos.attemptAnswerRepo as never,
      repos.quizRepo as never,
      repos.userRepo as never,
    );

    await expect(
      service.submitAttempt(String(attemptId), String(userId), {
        answers: [
          {
            questionId: String(questionOneId),
            selectedOptionIds: [String(optionOneId)],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repos.attemptRepo.findOne).toHaveBeenCalledWith({
      filter: { _id: String(attemptId), userId: String(userId) },
    });
    expect(repos.userRepo.updateOne).not.toHaveBeenCalled();
  });

  it.each([
    [AttemptStatus.SUBMITTED, 'already been submitted'],
    [AttemptStatus.EXPIRED, 'expired'],
  ] as const)('rejects a %s attempt as a conflict', async (status, message) => {
    const repos = buildRepos();
    repos.attemptRepo.findOne = mockRepoMethod().mockResolvedValue(
      buildAttempt({ status }),
    );
    const service = new AttemptService(
      repos.attemptRepo as never,
      repos.attemptAnswerRepo as never,
      repos.quizRepo as never,
      repos.userRepo as never,
    );

    await expect(
      service.submitAttempt(String(attemptId), String(userId), {
        answers: [
          {
            questionId: String(questionOneId),
            selectedOptionIds: [String(optionOneId)],
          },
        ],
      }),
    ).rejects.toMatchObject({ message: expect.stringContaining(message) });
    expect(repos.attemptAnswerRepo.findOne).not.toHaveBeenCalled();
    expect(repos.userRepo.updateOne).not.toHaveBeenCalled();
  });

  it('does not update user statistics when a concurrent submission wins', async () => {
    const repos = buildRepos();
    repos.attemptRepo.findOne =
      mockRepoMethod().mockResolvedValue(buildAttempt());
    repos.attemptRepo.updateOne = mockRepoMethod().mockResolvedValue({
      modifiedCount: 0,
    });
    repos.attemptAnswerRepo.findOne = mockRepoMethod().mockResolvedValue(
      buildAnswerSnapshot(),
    );
    const service = new AttemptService(
      repos.attemptRepo as never,
      repos.attemptAnswerRepo as never,
      repos.quizRepo as never,
      repos.userRepo as never,
    );

    await expect(
      service.submitAttempt(String(attemptId), String(userId), {
        answers: [
          {
            questionId: String(questionOneId),
            selectedOptionIds: [String(optionOneId)],
          },
          {
            questionId: String(questionTwoId),
            selectedOptionIds: [String(optionTwoId)],
          },
        ],
      }),
    ).rejects.toMatchObject({
      message: expect.stringContaining('no longer available'),
    });
    expect(repos.attemptAnswerRepo.updateOne).not.toHaveBeenCalled();
    expect(repos.userRepo.updateOne).not.toHaveBeenCalled();
  });
});
