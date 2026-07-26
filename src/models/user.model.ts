import { Schema, model } from 'mongoose';
import { UserRole } from '../common/enums/user.enum';
import { IUser } from '../common/types/user.types';

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    photo: { type: String },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    fastestTime: { type: Number },
    correctAnswers: { type: Number },
    quizzesPassed: { type: Number },
    credentialsChangedAt: { type: Date },
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

export const User = model<IUser>('User', userSchema);
