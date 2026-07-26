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
    quizName: { type: String, required: true },
    description: { type: String, required: true },
    photo: { type: String, required: true },
    time: { type: Number, required: true },
    passingThreshold: { type: Number },
    diplomaId: {
      type: Schema.Types.ObjectId,
      ref: 'Diploma',
      required: true,
      index: true,
    },
    instrcutions: { type: [String] },
    questions: { type: [quizQuestionSchema], required: true },
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
