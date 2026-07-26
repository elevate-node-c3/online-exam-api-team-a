import { Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { randomUUID } from 'node:crypto';
import { uploadOpts } from '../types/global.types.js';
import { BadRequestException } from './exception.util.js';
import { multerStorageType } from '../enums/multer.enum.js';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'node:fs';

export const cloudUpload = (
  opts: uploadOpts,
  storageTYPE: multerStorageType = multerStorageType.MEM,
) => {
  const { maxSizeMB = 5, allowedMimTypes, buildFileName } = opts;

  const storage =
    storageTYPE === multerStorageType.MEM
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            const subfolder = getUploadSubFolder(file.fieldname);

            const uploadsPath = resolve(
              import.meta.dirname,
              '..',
              '..',
              '/uploads',
              subfolder,
            );
            if (!existsSync(uploadsPath))
              mkdirSync(uploadsPath, { recursive: true });
            callback(null, uploadsPath);
          },
          filename(
            req: Request,
            file: Express.Multer.File,
            callback: (error: Error | null, destination: string) => void,
          ) {
            callback(null, `${file.filename}/${buildFileName(req, file)}`);
          },
        });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback,
  ) => {
    if (allowedMimTypes && !allowedMimTypes.includes(file.mimetype)) {
      return callback(new BadRequestException(`File type is not allowed`));
    }
    callback(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
  });
};

const getUploadSubFolder = (filedName: string) => {
  const folderMap = {
    userPhoto: 'personal-photos',
    diplomaPhoto: 'diploma-photos',
    quizPhoto: 'quiz-photos',
  };

  return folderMap[filedName as keyof typeof folderMap] || 'dump';
};

export const uploadUserPhoto = cloudUpload(
  {
    maxSizeMB: 2,
    allowedMimTypes: ['image/jpeg', 'image/png', 'image/webp'],
    buildFileName: (req, file) => {
      if (!req.credentials.user._id)
        throw new BadRequestException(
          'User must be authenticated to upload a photo',
        );
      return `${req.credentials.user._id}__${file.originalname}`;
    },
  },
  multerStorageType.DESK,
);

export const uploadPhoto = cloudUpload(
  {
    maxSizeMB: 2,
    allowedMimTypes: ['image/jpeg', 'image/png', 'image/webp'],
    buildFileName: (_req, file) => {
      return `${randomUUID()}__${file.originalname}`;
    },
  },
  multerStorageType.DESK,
);
