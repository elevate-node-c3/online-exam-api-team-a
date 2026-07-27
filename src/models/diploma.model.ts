import { Schema, model } from 'mongoose';
import { IDiploma } from '../common/types/diploma.types';

const diplomaSchema = new Schema<IDiploma>(
  {
    diplomaName: { type: String, required: true, trim: true },
    diplomaDescription: { type: String, required: true, trim: true },
    photo: { type: String },
  },
  {
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
    timestamps: true,
    strictQuery: true,
    strict: true,
    optimisticConcurrency: true,
    id: false,
  },
);

export const Diploma = model<IDiploma>('Diploma', diplomaSchema);
