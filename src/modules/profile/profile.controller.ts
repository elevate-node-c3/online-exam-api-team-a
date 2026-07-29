import { Request, Response, NextFunction } from 'express';
import { errorRes, successRes } from '../../common/utils/response.util';
import { ProfileService, profileService } from './profile.service';



export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  async getProfileController(req: any, res: Response, next: NextFunction) {
    try {
      const result = await this.profileService.getProfile(req.credentials.user._id);
      successRes({ res, message: 'Profile fetched successfully', status: 200, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getProfileByIdController(req: Request, res: Response, next: NextFunction) {
    try {
      
      const id = req.params.id as string | undefined;
      if (!id) {
        return errorRes({ res, message: 'User id is required', status: 400 });
      }

      const result = await this.profileService.getProfileById(id);
      successRes({ res, message: 'Profile fetched successfully', status: 200, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateProfileController(req: any, res: Response, next: NextFunction) {
    try {
      const result = await this.profileService.updateProfile(req.credentials.user._id, req.body);
      successRes({ res, message: 'Profile updated successfully', status: 200, data: result });
    } catch (err) {
      next(err);
    }
  }
}

export const profileController = new ProfileController(profileService);