import { Document, Types } from 'mongoose';
import { QuestionType } from '../enums/quiz.enum.js';

export interface IQuizOption {
  text?: string;
}

export interface IQuizQuestion {
  text?: string;
  type?: QuestionType;
  options?: IQuizOption[];
  correctOptionIndex?: number[];
}

export interface IQuiz extends Document {
  quizName?: string;
  instrcutions?: string[];
  description?: string;
  photo?: string;
  time?: number;
  passingThreshold?: number;
  diplomaId: Types.ObjectId;
  questions?: IQuizQuestion[];
}
