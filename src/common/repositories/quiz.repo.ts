import { DatabaseRepo } from './db.repo';
import { IQuiz } from '../types/quiz.types';
import { Quiz } from '../../models/quiz.model';
export class QuizRepo extends DatabaseRepo<IQuiz> {
  constructor() {
    super(Quiz);
  }
}

export const quizRepo = new QuizRepo();
