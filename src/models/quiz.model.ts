import { Schema, model, Document, Types } from "mongoose";
import { QuestionType } from "../enums/quiz.enum.js";

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
  description?: string;
  photo?: string;
  time?: number;
  passingThreshold?: number;
  diplomaId: Types.ObjectId;
  questions?: IQuizQuestion[];
}

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
      ref: "Diploma",
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

quizSchema.index({ quizName: "text", description: "text" });

export const Quiz = model<IQuiz>("Quiz", quizSchema);
