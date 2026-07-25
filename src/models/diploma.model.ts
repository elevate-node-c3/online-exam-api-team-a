import { Schema, model, Document } from "mongoose";

export interface IDiploma extends Document {
  diplomaName?: string;
  diplomaDescription?: string;
  photo?: string;
}

const diplomaSchema = new Schema<IDiploma>(
  {
    diplomaName: { type: String },
    diplomaDescription: { type: String },
    photo: { type: String },
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

export const Diploma = model<IDiploma>("Diploma", diplomaSchema);
