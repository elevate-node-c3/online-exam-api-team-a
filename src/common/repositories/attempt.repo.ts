import { DatabaseRepo } from './db.repo.js';
import { IAttempt } from '../types/attempt.types.js';
import { Attempt } from '../../models/attempt.model.js';

export class AttemptRepo extends DatabaseRepo<IAttempt> {
  constructor() {
    super(Attempt);
  }
}

export const attemptRepo = new AttemptRepo();
