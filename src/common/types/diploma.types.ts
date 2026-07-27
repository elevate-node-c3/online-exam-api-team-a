import { Document } from 'mongoose';

export interface IDiploma extends Document {
  diplomaName: string;
  diplomaDescription: string;
  photo?: string;
}

export interface DiplomaData {
  diplomaId: string;
  diplomaName: string;
  diplomaDescription: string;
  photo: string | null;
}
