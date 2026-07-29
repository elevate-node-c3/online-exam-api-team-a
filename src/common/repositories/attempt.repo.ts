import { DatabaseRepo } from './db.repo';
import { IAttempt } from '../types/attempt.types';
import { Attempt } from '../../models/attempt.model';

export class AttemptRepo extends DatabaseRepo<IAttempt> {
  constructor() {
    super(Attempt);
  }
}

export const attemptRepo = new AttemptRepo();
