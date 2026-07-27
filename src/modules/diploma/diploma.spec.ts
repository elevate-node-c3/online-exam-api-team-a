import express, { NextFunction, Request, Response } from 'express';
import { AddressInfo } from 'node:net';
import { existsSync } from 'node:fs';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import multer from 'multer';
import { DiplomaRepo } from '../../common/repositories/diploma.repo';
import { createDiplomaSchema } from '../../common/schemas/diploma.schema';
import { mutlerFileSchema } from '../../common/schemas/global.schema';
import { globalErrorHandler } from '../../common/middlewares/globalError.middleware';
import { validate } from '../../common/middlewares/validation.middleware';
import { DiplomaData } from '../../common/types/diploma.types';
import { UPLOADS_ROOT } from '../../common/utils/multer.util';
import { DiplomaController } from './diploma.controller';
import { DiplomaService } from './diploma.service';

const diplomaId = '507f1f77bcf86cd799439011';

const diplomaData: DiplomaData = {
  diplomaId,
  diplomaName: 'Frontend Development',
  diplomaDescription: 'Modern frontend development fundamentals.',
  photo: '/uploads/diploma-photos/frontend.png',
};

const createMockResponse = () => {
  const json = jest.fn((_body: unknown) => undefined);
  const status = jest.fn((_statusCode: number) => ({ json }));

  return {
    res: { status } as unknown as Response,
    status,
    json,
  };
};

const createMockFile = (
  path: string,
  filename = 'frontend.png',
): Express.Multer.File => ({
  fieldname: 'diplomaPhoto',
  originalname: 'frontend.png',
  encoding: '7bit',
  mimetype: 'image/png',
  destination: join(UPLOADS_ROOT, 'diploma-photos'),
  filename,
  path,
  size: 4,
  stream: undefined as never,
  buffer: Buffer.from('test'),
});

describe('createDiplomaSchema', () => {
  it('trims and accepts valid diploma text fields', () => {
    const result = createDiplomaSchema.parse({
      diplomaName: '  Frontend Development  ',
      diplomaDescription: '  Modern frontend development fundamentals.  ',
    });

    expect(result).toEqual({
      diplomaName: 'Frontend Development',
      diplomaDescription: 'Modern frontend development fundamentals.',
    });
  });

  it.each([
    [{}, 'missing fields'],
    [{ diplomaName: ' ', diplomaDescription: 'Description' }, 'empty name'],
    [{ diplomaName: 'Diploma', diplomaDescription: ' ' }, 'empty description'],
    [
      {
        diplomaName: 'Diploma',
        diplomaDescription: 'Description',
        unexpected: 'field',
      },
      'unknown fields',
    ],
  ])('rejects %s', (payload, _label) => {
    expect(createDiplomaSchema.safeParse(payload).success).toBe(false);
  });
});

describe('DiplomaService', () => {
  it('stores only the filename and returns the public photo path', async () => {
    const create = jest.fn(async (_input: unknown) => ({
      _id: diplomaId,
      diplomaName: diplomaData.diplomaName,
      diplomaDescription: diplomaData.diplomaDescription,
      photo: 'frontend photo.png',
    }));
    const repo = { create } as unknown as DiplomaRepo;
    const service = new DiplomaService(repo);
    const file = createMockFile('unused', 'frontend photo.png');

    const result = await service.createDiploma(
      {
        diplomaName: diplomaData.diplomaName,
        diplomaDescription: diplomaData.diplomaDescription,
      },
      file,
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        diplomaName: diplomaData.diplomaName,
        diplomaDescription: diplomaData.diplomaDescription,
        photo: 'frontend photo.png',
      },
    });
    expect(result).toEqual({
      ...diplomaData,
      photo: '/uploads/diploma-photos/frontend%20photo.png',
    });
  });

  it('creates a diploma without a photo and returns null', async () => {
    const create = jest.fn(async (_input: unknown) => ({
      _id: diplomaId,
      diplomaName: diplomaData.diplomaName,
      diplomaDescription: diplomaData.diplomaDescription,
    }));
    const service = new DiplomaService({
      create,
    } as unknown as DiplomaRepo);

    const result = await service.createDiploma({
      diplomaName: diplomaData.diplomaName,
      diplomaDescription: diplomaData.diplomaDescription,
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        diplomaName: diplomaData.diplomaName,
        diplomaDescription: diplomaData.diplomaDescription,
      },
    });
    expect(result.photo).toBeNull();
  });

  it('maps the complete diploma list and handles an empty result', async () => {
    const find = jest
      .fn()
      .mockResolvedValueOnce([
        {
          _id: diplomaId,
          diplomaName: diplomaData.diplomaName,
          diplomaDescription: diplomaData.diplomaDescription,
          photo: 'frontend.png',
        },
      ])
      .mockResolvedValueOnce(null); // This will be returned on the second call
    const service = new DiplomaService({ find } as unknown as DiplomaRepo);

    await expect(service.getDiplomas()).resolves.toEqual([diplomaData]);
    await expect(service.getDiplomas()).resolves.toEqual([]);
    expect(find).toHaveBeenCalledWith({
      filter: {},
      projection: {
        diplomaName: 1,
        diplomaDescription: 1,
        photo: 1,
      },
      options: { lean: true },
    });
  });
});

describe('DiplomaController', () => {
  it('returns the project response envelope for creation', async () => {
    const createDiploma = jest.fn(
      async (_dto: unknown, _file?: Express.Multer.File) => diplomaData,
    );
    const controller = new DiplomaController({
      createDiploma,
    } as unknown as DiplomaService);
    const { res, status, json } = createMockResponse();

    await controller.createDiploma(
      {
        body: {
          diplomaName: diplomaData.diplomaName,
          diplomaDescription: diplomaData.diplomaDescription,
        },
      } as Request,
      res,
      jest.fn() as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({
      statusCode: 201,
      message: 'Diploma created successfully',
      data: diplomaData,
    });
  });

  it('returns the project response envelope for listing', async () => {
    const getDiplomas = jest.fn(async () => [diplomaData]);
    const controller = new DiplomaController({
      getDiplomas,
    } as unknown as DiplomaService);
    const { res, status, json } = createMockResponse();

    await controller.getAllDiplomas(
      {} as Request,
      res,
      jest.fn() as NextFunction,
    );

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      statusCode: 200,
      message: 'Diplomas fetched successfully',
      data: [diplomaData],
    });
  });

  it('removes an uploaded file when persistence fails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'diploma-controller-'));
    const filePath = join(directory, 'failed.png');
    await writeFile(filePath, 'test');
    const error = new Error('Database failure');
    const controller = new DiplomaController({
      createDiploma: jest.fn(async (_dto: unknown) => {
        throw error;
      }),
    } as unknown as DiplomaService);
    const next = jest.fn((_error?: unknown) => undefined);

    await controller.createDiploma(
      {
        body: {
          diplomaName: diplomaData.diplomaName,
          diplomaDescription: diplomaData.diplomaDescription,
        },
        file: createMockFile(filePath),
      } as Request,
      createMockResponse().res,
      next,
    );

    expect(existsSync(filePath)).toBe(false);
    expect(next).toHaveBeenCalledWith(error);
    await rm(directory, { recursive: true, force: true });
  });
});

describe('multipart failure handling', () => {
  it('removes an uploaded file when body validation fails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'diploma-validation-'));
    const filePath = join(directory, 'invalid.png');
    await writeFile(filePath, 'test');
    const { res, status } = createMockResponse();
    const middleware = validate({
      body: createDiplomaSchema,
      file: mutlerFileSchema.optional(),
    });

    await middleware(
      {
        body: { diplomaName: diplomaData.diplomaName },
        file: createMockFile(filePath),
      } as Request,
      res,
      jest.fn(),
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(existsSync(filePath)).toBe(false);
    await rm(directory, { recursive: true, force: true });
  });

  it.each([
    ['LIMIT_FILE_SIZE', 413, 'Uploaded file is too large'],
    ['LIMIT_UNEXPECTED_FILE', 400, 'Invalid file upload'],
  ] as const)(
    'maps %s Multer errors to %s',
    (code, expectedStatus, expectedMessage) => {
      const error = new multer.MulterError(code);
      const { res, status, json } = createMockResponse();

      globalErrorHandler(error as never, {} as Request, res, jest.fn());

      expect(status).toHaveBeenCalledWith(expectedStatus);
      expect(json).toHaveBeenCalledWith({
        statusCode: expectedStatus,
        message: expectedMessage,
      });
    },
  );
});

describe('diploma photo serving', () => {
  it('serves a stored diploma photo from its public URL', async () => {
    const photoDirectory = join(UPLOADS_ROOT, 'diploma-photos');
    const filename = `jest-${Date.now()}.png`;
    const filePath = join(photoDirectory, filename);
    const contents = Buffer.from('photo-data');
    await mkdir(photoDirectory, { recursive: true });
    await writeFile(filePath, contents);

    const testApp = express();
    testApp.use('/uploads', express.static(UPLOADS_ROOT));
    const server = testApp.listen(0);

    try {
      const { port } = server.address() as AddressInfo;
      const response = await fetch(
        `http://127.0.0.1:${port}/uploads/diploma-photos/${filename}`,
      );

      expect(response.status).toBe(200);
      expect(Buffer.from(await response.arrayBuffer())).toEqual(contents);
      expect(await readFile(filePath)).toEqual(contents);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      await unlink(filePath).catch(() => {});
    }
  });
});
