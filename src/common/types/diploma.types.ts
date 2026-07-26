import { Document } from 'mongoose';

export interface IDiploma extends Document {
  diplomaName?: string;
  diplomaDescription?: string;
  photo?: string;
}
