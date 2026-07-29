import { ROUTES } from '../../routes';
import { Router } from 'express';
import { auth } from '../../common/middlewares/auth.middleware';
import { profileController } from './profile.controller';

const profileRouter = Router();

profileRouter.get(
  ROUTES.PROFILE.GETPROFILE,
  auth,
  profileController.getProfileController.bind(profileController),
);

profileRouter.get(
  ROUTES.PROFILE.GETPROFILEBYID,
  profileController.getProfileByIdController.bind(profileController),
);

profileRouter.patch(
  ROUTES.PROFILE.UPDATEPROFILE,
  auth,
  profileController.updateProfileController.bind(profileController),
);

export default profileRouter;