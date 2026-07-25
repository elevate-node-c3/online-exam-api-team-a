import { Schema, model, Document } from "mongoose";
import { UserRole } from "../enums/user.enum.js";

export interface IUser extends Document {
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  photo?: string;
  role: UserRole;
  fastestTime?: number;
  correctAnswers?: number;
  quizzesPassed?: number;
  credentialsChangedAt?: Date;
}

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
      default: UserRole.STUDENT,
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

export const User = model<IUser>("User", userSchema);
