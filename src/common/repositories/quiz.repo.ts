import { DatabaseRepo } from './db.repo.js';
import { IQuiz } from '../types/quiz.types.js';
import { Quiz } from '../../models/quiz.model.js';
export class QuizRepo extends DatabaseRepo<IQuiz> {
  constructor() {
    super(Quiz);
  }
}

export const quizRepo = new QuizRepo();
