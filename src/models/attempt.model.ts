import { Schema, model } from "mongoose";
import { IAttempt, IAttemptAnswer } from "../common/types/attempt.types.js";

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
