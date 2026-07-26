import { Document } from 'mongoose';
import { UserRole } from '../enums/user.enum';

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
