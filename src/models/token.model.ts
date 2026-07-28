import { Schema, Types, model } from 'mongoose';
import { IToken } from '../common/types/token.types';

const tokenSchema = new Schema<IToken>(
  {
    userId: { type: Types.ObjectId, required: true },
    jwtid: { type: String, required: true, unique: true },
  },
  { timestamps: true },
)
export const Token = model<IToken>('Token', tokenSchema);
