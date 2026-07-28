import { quizRepo, QuizRepo } from '../../common/repositories/quiz.repo';
import {
  createQuizDTO,
  quizListQueryDTO,
  updateQuizDTO,
} from '../../common/schemas/quiz.schema';
import {
  DiplomaRepo,
  diplomaRepo,
} from '../../common/repositories/diploma.repo.js';
import {
  ConflictException,
  NotFoundException,
} from '../../common/utils/exception.util.js';
import {
  QUIZ_DEFAULT_INSTRUCTIONS,
  QUIZ_PASSING_DEFAULT_THRESHOLD,
} from '../../common/constants/quiz.constant.js';
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

    const nameExist = await this.quizRepo.findOne({
      filter: { quizName: dto.quizName },
    });

    if (nameExist)
      throw new ConflictException('A quiz with this name already exists');

    dto.passingThreshold =
      dto.passingThreshold ?? QUIZ_PASSING_DEFAULT_THRESHOLD;
    dto.instructions = dto.instructions || QUIZ_DEFAULT_INSTRUCTIONS;

    return await this.quizRepo.create({
      data: { ...dto, photo: photo.filename },
    });
  }

  async updateQuiz(
    id: string,
    dto: updateQuizDTO,
    photo?: Express.Multer.File,
  ) {
    const quiz = await this.quizRepo.findOne({ filter: { _id: id } });
    if (!quiz) throw new NotFoundException('quiz not found');

    if (dto.diplomaId) {
      const diploma = await this.diplomaRepo.findOne({
        filter: { _id: dto.diplomaId },
      });
      if (!diploma) throw new NotFoundException('diploma not found');
    }

    if (dto.quizName) {
      const nameExist = await this.quizRepo.findOne({
        filter: { quizName: dto.quizName, _id: { $ne: id } },
      });
      if (nameExist)
        throw new ConflictException('A quiz with this name already exists');
    }

    await this.quizRepo.updateOne({
      filter: { _id: id },
      update: { $set: { ...dto, ...(photo && { photo: photo.filename }) } },
    });

    return this.quizRepo.findOne({ filter: { _id: id } });
  }

  async getQuiz(id: string) {
    const quiz = await this.quizRepo.findOne({ filter: { _id: id } });
    if (!quiz) throw new NotFoundException('quiz not found');
    return quiz;
  }

  async getQuizzes({ query, page, size }: quizListQueryDTO) {
    const filter = query ? { $text: { $search: query } } : {};

    return this.quizRepo.paginate({
      filter,
      options: { lean: true },
      page,
      size,
    });
  }
}

export const quizService = new QuizService(quizRepo, diplomaRepo);
