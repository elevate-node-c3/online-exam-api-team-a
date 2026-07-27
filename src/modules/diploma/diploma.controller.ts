import { NextFunction, Request, Response } from 'express';
import { unlink } from 'node:fs/promises';
import { createDiplomaDTO } from '../../common/schemas/diploma.schema.js';
import { successRes } from '../../common/utils/response.util.js';
import { DiplomaService, diplomaService } from './diploma.service.js';

export class DiplomaController {
  constructor(private readonly diplomaService: DiplomaService) {}

  async createDiploma(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.diplomaService.createDiploma(
        req.body as createDiplomaDTO,
        req.file,
      );

      successRes({
        res,
        message: 'Diploma created successfully',
        status: 201,
        data,
      });
    } catch (err) {
      if (req.file) await unlink(req.file.path).catch(() => {});
      next(err);
    }
  }

  async getAllDiplomas(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await this.diplomaService.getDiplomas();

      successRes({
        res,
        message: 'Diplomas fetched successfully',
        status: 200,
        data,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const diplomaController = new DiplomaController(diplomaService);
