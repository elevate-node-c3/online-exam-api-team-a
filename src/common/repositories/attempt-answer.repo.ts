import { DatabaseRepo } from './db.repo.js';
import { IAttemptAnswers } from '../types/attempt.types.js';
import { AttemptAnswers } from '../../models/attempt-answer.model.js';

export class AttemptAnswerRepo extends DatabaseRepo<IAttemptAnswers> {
  constructor() {
    super(AttemptAnswers);
  }
}

export const attemptAnswerRepo = new AttemptAnswerRepo();
