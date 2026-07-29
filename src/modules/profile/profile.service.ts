import { UserRepo, userRepo } from '../../common/repositories/user.repo';
import { RegisterDto } from '../auth/dto/register.dto';
import { Types } from 'mongoose';
import { NotFoundException } from '../../common/utils/exception.util';

export class ProfileService {
  constructor(private readonly userRepo: UserRepo) {}

  async getProfile(userId: Types.ObjectId) {
    const user = await this.userRepo.findOne({
      filter: { _id: userId },
      projection: {
        firstName: 1,
        lastName: 1,
        quizzesPassed: 1,
        fastestTime: 1,
        correctAnswers: 1,
      },
      options: { lean: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      quizzesPassed: user.quizzesPassed,
      fastestTime: user.fastestTime,
      correctAnswers: user.correctAnswers,
    };
  }

  async getProfileById(id: string) {
    const user = await this.userRepo.findOne({
      filter: { _id: id },
      projection: {
        firstName: 1,
        lastName: 1,
        quizzesPassed: 1,
        fastestTime: 1,
        email: 1,
        role: 1,
        correctAnswers: 1,
      },
      options: { lean: true },
    });
    if (!user) throw new NotFoundException('User not found');

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      quizzesPassed: user.quizzesPassed,
      fastestTime: user.fastestTime,
      email: user.email,
      role: user.role,
      correctAnswers: user.correctAnswers,
    };
  }

  async updateProfile(
    id: string,
    data: Partial<Pick<RegisterDto, 'firstName' | 'lastName'>>,
  ) {
    const user = await this.userRepo.findOne({
      filter: { _id: id },
      options: { lean: true },
    });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepo.updateOne({
      filter: { _id: id },
      update: { $set: data },
    });

    const updatedUser = await this.userRepo.findOne({
      filter: { _id: id },
      projection: { firstName: 1, lastName: 1, email: 1 },
      options: { lean: true },
    });

    return updatedUser;
  }
}

export const profileService = new ProfileService(userRepo);
