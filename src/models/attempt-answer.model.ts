import { Schema, model } from 'mongoose';
import { QuestionType } from '../common/enums/quiz.enum';
import {
  IAttemptAnswers,
  IAttemptOptionSnapshot,
  IAttemptQuestionSnapshot,
} from '../common/types/attempt.types';

const optionSnapshotSchema = new Schema<IAttemptOptionSnapshot>(
  {
    optionId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
  },
  { _id: false },
);

const questionSnapshotSchema = new Schema<IAttemptQuestionSnapshot>(
  {
    questionId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, required: true },
    type: {
      type: String,
      enum: Object.values(QuestionType),
      required: true,
    },
    options: { type: [optionSnapshotSchema], required: true },
    correctOptionIds: { type: [Schema.Types.ObjectId], required: true },
    selectedOptionIds: { type: [Schema.Types.ObjectId], default: [] },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false },
);

const attemptAnswersSchema = new Schema<IAttemptAnswers>(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'Attempt',
      required: true,
      unique: true,
      index: true,
    },
    questions: { type: [questionSnapshotSchema], required: true },
  },
  { timestamps: true, strictQuery: true, strict: true },
);

export const AttemptAnswers = model<IAttemptAnswers>(
  'AttemptAnswers',
  attemptAnswersSchema,
);
