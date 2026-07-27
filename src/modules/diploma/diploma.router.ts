import { Router } from 'express';
import { UserRole } from '../../common/enums/user.enum';
import { auth } from '../../common/middlewares/auth.middleware';
import { checkRole } from '../../common/middlewares/checkRole.middleware';
import { validate } from '../../common/middlewares/validation.middleware';
import { createDiplomaSchema } from '../../common/schemas/diploma.schema';
import { mutlerFileSchema } from '../../common/schemas/global.schema';
import { uploadPhoto } from '../../common/utils/multer.util';
import { diplomaController } from './diploma.controller';

export const diplomaRouter = Router();

diplomaRouter.post(
  '/',
  auth,
  checkRole([UserRole.ADMIN]),
  uploadPhoto.single('diplomaPhoto'),
  validate({
    body: createDiplomaSchema,
    file: mutlerFileSchema.optional(),
  }),
  diplomaController.createDiploma.bind(diplomaController),
);

diplomaRouter.get(
  '/',
  auth,
  checkRole([UserRole.USER, UserRole.ADMIN]),
  diplomaController.getAllDiplomas.bind(diplomaController),
);
