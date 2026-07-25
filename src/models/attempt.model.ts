import { Schema, model, Document, Types } from "mongoose";

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

const attemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId },
    selectedOptionIds: { type: [Schema.Types.ObjectId] },
  },
  { _id: false },
);

const attemptSchema = new Schema<IAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true, index: true },
    startTime: { type: Date },
    submittedAt: { type: Date },
    timeTaken: { type: Number },
    scorePercentage: { type: Number },
    passed: { type: Boolean },
    totalCorrectQuestions: { type: Number },
    answers: { type: [attemptAnswerSchema] },
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

attemptSchema.index({ userId: 1, quizId: 1 });
attemptSchema.index({ userId: 1, passed: 1 });

export const Attempt = model<IAttempt>("Attempt", attemptSchema);
