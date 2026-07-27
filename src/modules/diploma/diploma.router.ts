import { Router } from 'express';
import { UserRole } from '../../common/enums/user.enum.js';
import { auth } from '../../common/middlewares/auth.middleware.js';
import { checkRole } from '../../common/middlewares/checkRole.middleware.js';
import { validate } from '../../common/middlewares/validation.middleware.js';
import { createDiplomaSchema } from '../../common/schemas/diploma.schema.js';
import { mutlerFileSchema } from '../../common/schemas/global.schema.js';
import { uploadPhoto } from '../../common/utils/multer.util.js';
import { diplomaController } from './diploma.controller.js';

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
