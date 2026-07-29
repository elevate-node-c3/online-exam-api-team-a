import { Types } from 'mongoose';
import { AttemptStatus } from '../../common/enums/attempt.enum';
import {
  AttemptAnswerRepo,
  attemptAnswerRepo,
} from '../../common/repositories/attempt-answer.repo';
import {
  AttemptRepo,
  attemptRepo,
} from '../../common/repositories/attempt.repo';
import { QuizRepo, quizRepo } from '../../common/repositories/quiz.repo';
import { UserRepo, userRepo } from '../../common/repositories/user.repo';
import {
  attemptListQueryDTO,
  submitAttemptDTO,
} from '../../common/schemas/attempt.schema';
import { IAttemptQuestionSnapshot } from '../../common/types/attempt.types';
import { IQuizQuestion } from '../../common/types/quiz.types';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../../common/utils/exception.util';
import { QUIZ_PASSING_DEFAULT_THRESHOLD } from '../../common/constants/quiz.constant';

const asId = (value: Types.ObjectId | undefined, field: string) => {
  if (!value) throw new BadRequestException(`Quiz ${field} is invalid`);
  return value;
};

const normalizeIds = (ids: Types.ObjectId[]) =>
  ids.map(String).sort((left, right) => left.localeCompare(right));

const sameIdSet = (left: Types.ObjectId[], right: Types.ObjectId[]) => {
  if (left.length !== right.length) return false;
  const normalizedLeft = normalizeIds(left);
  const normalizedRight = normalizeIds(right);
  return normalizedLeft.every((id, index) => id === normalizedRight[index]);
};

export class AttemptService {
  constructor(
    private readonly attemptRepo: AttemptRepo,
    private readonly attemptAnswerRepo: AttemptAnswerRepo,
    private readonly quizRepo: QuizRepo,
    private readonly userRepo: UserRepo,
  ) {}

  private async expireOverdueAttempts(userId: string, now: Date) {
    await this.attemptRepo.updateMany({
      filter: {
        userId,
        status: AttemptStatus.IN_PROGRESS,
        expiresAt: { $lt: now },
      },
      update: { $set: { status: AttemptStatus.EXPIRED } },
    });
  }

  private buildQuestionSnapshot(question: IQuizQuestion) {
    const questionId = asId(question._id, 'question ID');
    const options = question.options ?? [];
    const optionSnapshots = options.map((option) => ({
      optionId: asId(option._id, 'option ID'),
      text: option.text ?? '',
    }));
    const correctOptionIds = (question.correctOptionIndex ?? []).map(
      (index) => {
        const option = optionSnapshots[index];
        if (!option)
          throw new BadRequestException('Quiz answer key is invalid');
        return option.optionId;
      },
    );

    if (!question.type)
      throw new BadRequestException('Quiz question type is invalid');

    return {
      questionId,
      text: question.text ?? '',
      type: question.type,
      options: optionSnapshots,
      correctOptionIds,
      selectedOptionIds: [],
      isCorrect: null,
    };
  }

  async startQuiz(quizId: string, userId: string, now = new Date()) {
    const quiz = await this.quizRepo.findOne({ filter: { _id: quizId } });
    if (!quiz) throw new NotFoundException('Quiz not found');

    await this.expireOverdueAttempts(userId, now);
    const activeAttempt = await this.attemptRepo.findOne({
      filter: { userId, status: AttemptStatus.IN_PROGRESS },
    });
    if (activeAttempt) {
      throw new ConflictException(
        'Finish the active attempt before starting another',
      );
    }

    const questions = quiz.questions ?? [];
    if (!questions.length)
      throw new BadRequestException('Quiz has no questions');

    const timeLimitSeconds = quiz.time ?? 0;
    const passingThreshold =
      quiz.passingThreshold ?? QUIZ_PASSING_DEFAULT_THRESHOLD;
    const expiresAt = new Date(now.getTime() + timeLimitSeconds * 1000);
    let attempt;

    try {
      attempt = await this.attemptRepo.create({
        data: {
          userId: new Types.ObjectId(userId),
          quizId: new Types.ObjectId(quizId),
          status: AttemptStatus.IN_PROGRESS,
          startTime: now,
          expiresAt,
          totalQuestionsSnapshot: questions.length,
          timeLimitSecondsSnapshot: timeLimitSeconds,
          passingThresholdSnapshot: passingThreshold,
        },
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('An active attempt already exists');
      }
      throw error;
    }

    try {
      const snapshot = questions.map((question) =>
        this.buildQuestionSnapshot(question),
      );
      await this.attemptAnswerRepo.create({
        data: { attemptId: attempt._id, questions: snapshot },
      });

      return {
        attemptId: String(attempt._id),
        quizId,
        status: attempt.status,
        startedAt: attempt.startTime,
        expiresAt: attempt.expiresAt,
        timeLimitSeconds: attempt.timeLimitSecondsSnapshot,
        questions: snapshot.map(
          ({ correctOptionIds: _, isCorrect: __, ...question }) => ({
            ...question,
            questionId: String(question.questionId),
            options: question.options.map((option) => ({
              optionId: String(option.optionId),
              text: option.text,
            })),
            selectedOptionIds: [],
          }),
        ),
      };
    } catch (error) {
      await this.attemptRepo.deleteOne({ filter: { _id: attempt._id } });
      throw error;
    }
  }

  async getAttempts(userId: string, { page, limit }: attemptListQueryDTO) {
    await this.expireOverdueAttempts(userId, new Date());
    const result = await this.attemptRepo.paginate({
      filter: { userId },
      projection: {
        quizId: 1,
        status: 1,
        scorePercentage: 1,
        passed: 1,
        submittedAt: 1,
      },
      options: { lean: true, sort: { createdAt: -1 } },
      page,
      size: limit,
    });

    return {
      attempts: (result.docs ?? []).map((attempt) => ({
        attemptId: String(attempt._id),
        quizId: String(attempt.quizId),
        status: attempt.status,
        scorePercentage: attempt.scorePercentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt,
      })),
      meta: result.meta,
    };
  }

  async getAttempt(attemptId: string, userId: string) {
    await this.expireOverdueAttempts(userId, new Date());
    const attempt = await this.attemptRepo.findOne({
      filter: { _id: attemptId, userId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const answerSnapshot = await this.attemptAnswerRepo.findOne({
      filter: { attemptId: attempt._id },
      options: { lean: true },
    });
    if (!answerSnapshot)
      throw new NotFoundException('Attempt snapshot not found');

    const revealAnswers = attempt.status === AttemptStatus.SUBMITTED;
    return {
      attemptId: String(attempt._id),
      quizId: String(attempt.quizId),
      status: attempt.status,
      scorePercentage: attempt.scorePercentage,
      passed: attempt.passed,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestionsSnapshot,
      startedAt: attempt.startTime,
      expiresAt: attempt.expiresAt,
      submittedAt: attempt.submittedAt,
      timeSpentSeconds: attempt.timeSpentSeconds,
      questions: answerSnapshot.questions.map((question) => ({
        questionId: String(question.questionId),
        text: question.text,
        type: question.type,
        options: question.options.map((option) => ({
          optionId: String(option.optionId),
          text: option.text,
        })),
        selectedOptionIds: question.selectedOptionIds.map(String),
        ...(revealAnswers && {
          correctOptionIds: question.correctOptionIds.map(String),
          isCorrect: question.isCorrect,
        }),
      })),
    };
  }

  async submitAttempt(
    attemptId: string,
    userId: string,
    dto: submitAttemptDTO,
    now = new Date(),
  ) {
    const attempt = await this.attemptRepo.findOne({
      filter: { _id: attemptId, userId },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status === AttemptStatus.SUBMITTED) {
      throw new ConflictException('Attempt has already been submitted');
    }
    if (attempt.status === AttemptStatus.EXPIRED || now > attempt.expiresAt) {
      await this.attemptRepo.updateOne({
        filter: { _id: attempt._id, userId, status: AttemptStatus.IN_PROGRESS },
        update: { $set: { status: AttemptStatus.EXPIRED } },
      });
      throw new ConflictException('Attempt has expired');
    }

    const answerSnapshot = await this.attemptAnswerRepo.findOne({
      filter: { attemptId: attempt._id },
    });
    if (!answerSnapshot)
      throw new NotFoundException('Attempt snapshot not found');
    if (dto.answers.length !== answerSnapshot.questions.length) {
      throw new BadRequestException('Every attempt question must be answered');
    }

    const submittedByQuestion = new Map(
      dto.answers.map((answer) => [
        answer.questionId,
        answer.selectedOptionIds,
      ]),
    );

    const gradedQuestions: IAttemptQuestionSnapshot[] =
      answerSnapshot.questions.map((question) => {
        const selectedOptionIds = submittedByQuestion.get(
          String(question.questionId),
        );
        if (!selectedOptionIds) {
          throw new BadRequestException(
            'Every attempt question must be answered',
          );
        }

        const validOptionIds = new Set(
          question.options.map(({ optionId }) => String(optionId)),
        );
        if (
          selectedOptionIds.some((optionId) => !validOptionIds.has(optionId))
        ) {
          throw new BadRequestException(
            'An answer contains an invalid option ID',
          );
        }

        const selectedIds = selectedOptionIds.map(
          (id) => new Types.ObjectId(id),
        );
        return {
          questionId: question.questionId,
          text: question.text,
          type: question.type,
          options: question.options,
          correctOptionIds: question.correctOptionIds,
          selectedOptionIds: selectedIds,
          isCorrect: sameIdSet(selectedIds, question.correctOptionIds),
        };
      });

    const correctCount = gradedQuestions.filter(
      ({ isCorrect }) => isCorrect,
    ).length;
    const scorePercentage = Number(
      ((correctCount / attempt.totalQuestionsSnapshot) * 100).toFixed(2),
    );
    const passed = scorePercentage >= attempt.passingThresholdSnapshot;
    const timeSpentSeconds = Math.min(
      attempt.timeLimitSecondsSnapshot,
      Math.max(
        0,
        Math.floor((now.getTime() - attempt.startTime.getTime()) / 1000),
      ),
    );

    const updateResult = await this.attemptRepo.updateOne({
      filter: {
        _id: attempt._id,
        userId,
        status: AttemptStatus.IN_PROGRESS,
        expiresAt: { $gte: now },
      },
      update: {
        $set: {
          status: AttemptStatus.SUBMITTED,
          submittedAt: now,
          timeSpentSeconds,
          scorePercentage,
          passed,
          correctCount,
        },
      },
    });
    if (updateResult.modifiedCount !== 1) {
      throw new ConflictException(
        'Attempt is no longer available for submission',
      );
    }

    await this.attemptAnswerRepo.updateOne({
      filter: { attemptId: attempt._id },
      update: { $set: { questions: gradedQuestions } },
    });

    await this.userRepo.updateOne({
      filter: { _id: userId },
      update: {
        $inc: {
          correctAnswers: correctCount,
          quizzesPassed: passed ? 1 : 0,
        },
        $min: { fastestTime: timeSpentSeconds },
      },
    });

    return {
      attemptId: String(attempt._id),
      status: AttemptStatus.SUBMITTED,
      scorePercentage,
      passed,
      correctCount,
      totalQuestions: attempt.totalQuestionsSnapshot,
      timeSpentSeconds,
      submittedAt: now,
    };
  }
}

export const attemptService = new AttemptService(
  attemptRepo,
  attemptAnswerRepo,
  quizRepo,
  userRepo,
);
