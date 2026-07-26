import { Schema, model } from 'mongoose';
import { QuestionType } from '../common/enums/quiz.enum.js';
import {
  IQuiz,
  IQuizOption,
  IQuizQuestion,
} from '../common/types/quiz.types.js';

const quizOptionSchema = new Schema<IQuizOption>({
  text: { type: String },
});

const quizQuestionSchema = new Schema<IQuizQuestion>({
  text: { type: String },
  type: { type: String, enum: Object.values(QuestionType) },
  options: { type: [quizOptionSchema] },
  correctOptionIndex: { type: [Number] },
});

const quizSchema = new Schema<IQuiz>(
  {
    quizName: { type: String },
    description: { type: String },
    photo: { type: String },
    time: { type: Number },
    passingThreshold: { type: Number },
    diplomaId: {
      type: Schema.Types.ObjectId,
      ref: 'Diploma',
      required: true,
      index: true,
    },
    questions: { type: [quizQuestionSchema] },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    timestamps: true,
    strictQuery: true,
    strict: true,
    optimisticConcurrency: true,
  },
);

quizSchema.index({ quizName: 'text', description: 'text' });

export const Quiz = model<IQuiz>('Quiz', quizSchema);
