import { quizRepo, QuizRepo } from '../../common/repositories/quiz.repo.js';
import { createQuizDTO } from '../../common/schemas/quiz.schema.js';
import {
  DiplomaRepo,
  diplomaRepo,
} from '../../common/repositories/diploma.repo.js';
export class QuizService {
  constructor(
    private readonly quizRepo: QuizRepo,
    private readonly diplomaRepo: DiplomaRepo,
  ) {}

  async createQuiz(dto: createQuizDTO) {
    const diploma = await this.diplomaRepo.findOne({
      filter: { _id: dto.diplomaId },
      options: { lean: true },
    });
  }
}

export const quizService = new QuizService(quizRepo, diplomaRepo);
