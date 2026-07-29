import { Document, Types } from 'mongoose';
import { QuestionType } from '../enums/quiz.enum';

export interface IQuizOption {
  _id?: Types.ObjectId;
  text?: string;
}

export interface IQuizQuestion {
  _id?: Types.ObjectId;
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
