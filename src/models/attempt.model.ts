import { Schema, model } from 'mongoose';
import { AttemptStatus } from '../common/enums/attempt.enum';
import { IAttempt } from '../common/types/attempt.types';

const attemptSchema = new Schema<IAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AttemptStatus),
      required: true,
      default: AttemptStatus.IN_PROGRESS,
    },
    startTime: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    submittedAt: { type: Date, default: null },
    timeSpentSeconds: { type: Number, min: 0, default: null },
    scorePercentage: { type: Number, min: 0, max: 100, default: null },
    passed: { type: Boolean, default: null },
    correctCount: { type: Number, min: 0, default: null },
    totalQuestionsSnapshot: { type: Number, min: 1, required: true },
    timeLimitSecondsSnapshot: { type: Number, min: 1, required: true },
    passingThresholdSnapshot: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },
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

attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ userId: 1, submittedAt: -1 });
attemptSchema.index({ userId: 1, status: 1, createdAt: -1 });
attemptSchema.index({ quizId: 1, createdAt: -1 });
attemptSchema.index(
  { userId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: AttemptStatus.IN_PROGRESS },
  },
);

export const Attempt = model<IAttempt>('Attempt', attemptSchema);
