import { DatabaseRepo } from './db.repo';
import { IAttemptAnswers } from '../types/attempt.types';
import { AttemptAnswers } from '../../models/attempt-answer.model';

export class AttemptAnswerRepo extends DatabaseRepo<IAttemptAnswers> {
  constructor() {
    super(AttemptAnswers);
  }
}

export const attemptAnswerRepo = new AttemptAnswerRepo();
