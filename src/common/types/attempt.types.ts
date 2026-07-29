import { Document, Types } from 'mongoose';
import { AttemptStatus } from '../enums/attempt.enum';
import { QuestionType } from '../enums/quiz.enum';

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  status: AttemptStatus;
  startTime: Date;
  expiresAt: Date;
  submittedAt: Date | null;
  timeSpentSeconds: number | null;
  scorePercentage: number | null;
  passed: boolean | null;
  correctCount: number | null;
  totalQuestionsSnapshot: number;
  timeLimitSecondsSnapshot: number;
  passingThresholdSnapshot: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttemptOptionSnapshot {
  optionId: Types.ObjectId;
  text: string;
}

export interface IAttemptQuestionSnapshot {
  questionId: Types.ObjectId;
  text: string;
  type: QuestionType;
  options: IAttemptOptionSnapshot[];
  correctOptionIds: Types.ObjectId[];
  selectedOptionIds: Types.ObjectId[];
  isCorrect: boolean | null;
}

export interface IAttemptAnswers extends Document {
  attemptId: Types.ObjectId;
  questions: IAttemptQuestionSnapshot[];
  createdAt: Date;
  updatedAt: Date;
}
