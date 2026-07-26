import { Document, Types } from 'mongoose';

export interface IAttemptAnswer {
  questionId?: Types.ObjectId;
  selectedOptionIds?: Types.ObjectId[];
}

export interface IAttempt extends Document {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  startTime?: Date;
  submittedAt?: Date;
  timeTaken?: number;
  scorePercentage?: number;
  passed?: boolean;
  totalCorrectQuestions?: number;
  answers?: IAttemptAnswer[];
}
