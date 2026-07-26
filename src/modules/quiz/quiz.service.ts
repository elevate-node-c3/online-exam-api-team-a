import { quizRepo, QuizRepo } from '../../common/repositories/quiz.repo.js';
import { createQuizDTO } from '../../common/schemas/quiz.schema.js';
import {
  DiplomaRepo,
  diplomaRepo,
} from '../../common/repositories/diploma.repo.js';
import { NotFoundException } from '../../common/utils/exception.util.js';
import { QUIZ_PASSING_DEFAULT_THRESHOLD } from '../../common/constants/quiz.constant.js';
export class QuizService {
  constructor(
    private readonly quizRepo: QuizRepo,
    private readonly diplomaRepo: DiplomaRepo,
  ) {}

  async createQuiz(dto: createQuizDTO, photo: Express.Multer.File) {
    const diploma = await this.diplomaRepo.findOne({
      filter: { _id: dto.diplomaId },
    });

    if (!diploma) throw new NotFoundException('diploma not found');
    dto.passingThreshold =
      dto.passingThreshold ?? QUIZ_PASSING_DEFAULT_THRESHOLD;

    return await this.quizRepo.create({
      data: { ...dto, photo: photo.filename },
    });
  }
}

export const quizService = new QuizService(quizRepo, diplomaRepo);
