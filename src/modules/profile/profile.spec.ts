import { describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { UserRepo } from '../../common/repositories/user.repo';
import { NotFoundException } from '../../common/utils/exception.util';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

const userId = new Types.ObjectId('507f1f77bcf86cd799439011');
const userIdString = userId.toHexString();

const baseUser = {
  _id: userId,
  firstName: 'Jane',
  lastName: 'Doe',
  quizzesPassed: 12,
  fastestTime: 42,
  email: 'jane.doe@example.com',
  role: 'user',
  correctAnswers: 87,
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

describe('ProfileService', () => {
  describe('getProfile', () => {
    it('returns the mapped profile for an existing user', async () => {
      const findOne = jest.fn(async (_input: unknown) => baseUser);
      const service = new ProfileService({ findOne } as unknown as UserRepo);

      const result = await service.getProfile(userId);

      expect(findOne).toHaveBeenCalledWith({
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
      expect(result).toEqual({
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        quizzesPassed: baseUser.quizzesPassed,
        fastestTime: baseUser.fastestTime,
        correctAnswers: baseUser.correctAnswers,
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const service = new ProfileService({ findOne } as unknown as UserRepo);

      await expect(service.getProfile(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getProfile(userId)).rejects.toThrow(
        'User not found',
      );
    });
  });

  describe('getProfileById', () => {
    it('returns the full mapped profile for an existing user', async () => {
      const findOne = jest.fn(async (_input: unknown) => baseUser);
      const service = new ProfileService({ findOne } as unknown as UserRepo);

      const result = await service.getProfileById(userIdString);

      expect(findOne).toHaveBeenCalledWith({
        filter: { _id: userIdString },
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
      expect(result).toEqual({
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        quizzesPassed: baseUser.quizzesPassed,
        fastestTime: baseUser.fastestTime,
        email: baseUser.email,
        role: baseUser.role,
        correctAnswers: baseUser.correctAnswers,
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const service = new ProfileService({ findOne } as unknown as UserRepo);

      await expect(service.getProfileById(userIdString)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('updates and returns the mapped user when the user exists', async () => {
      const updateData = { firstName: 'Janet' };
      const updatedUser = {
        firstName: 'Janet',
        lastName: baseUser.lastName,
        email: baseUser.email,
      };
      const findOne = jest
        .fn<
          (
            _input: unknown,
          ) => Promise<typeof baseUser | typeof updatedUser | null>
        >()
        .mockResolvedValueOnce(baseUser)
        .mockResolvedValueOnce(updatedUser);
      const updateOne = jest.fn(async (_input: unknown) => undefined);
      const service = new ProfileService({
        findOne,
        updateOne,
      } as unknown as UserRepo);

      const result = await service.updateProfile(userIdString, updateData);

      expect(updateOne).toHaveBeenCalledWith({
        filter: { _id: userIdString },
        update: { $set: updateData },
      });
      expect(findOne).toHaveBeenNthCalledWith(2, {
        filter: { _id: userIdString },
        projection: { firstName: 1, lastName: 1, email: 1 },
        options: { lean: true },
      });
      expect(result).toEqual(updatedUser);
    });

    it('throws NotFoundException without updating when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const updateOne = jest.fn(async (_input: unknown) => undefined);
      const service = new ProfileService({
        findOne,
        updateOne,
      } as unknown as UserRepo);

      await expect(
        service.updateProfile(userIdString, { firstName: 'Janet' }),
      ).rejects.toThrow(NotFoundException);
      expect(updateOne).not.toHaveBeenCalled();
    });
  });
});

describe('ProfileController', () => {
  describe('getProfileController', () => {
    it('returns the project response envelope for the authenticated user', async () => {
      const profile = {
        firstName: baseUser.firstName,
        lastName: baseUser.lastName,
        quizzesPassed: baseUser.quizzesPassed,
        fastestTime: baseUser.fastestTime,
      };
      const getProfile = jest.fn(async (_id: Types.ObjectId) => profile);
      const controller = new ProfileController({
        getProfile,
      } as unknown as ProfileService);
      const { res, status, json } = createMockResponse();

      await controller.getProfileController(
        { credentials: { user: { _id: userId } } } as unknown as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(getProfile).toHaveBeenCalledWith(userId);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Profile fetched successfully',
        data: profile,
      });
    });

    it('forwards errors to next', async () => {
      const error = new NotFoundException('User not found');
      const getProfile = jest.fn(async (_id: Types.ObjectId) => {
        throw error;
      });
      const controller = new ProfileController({
        getProfile,
      } as unknown as ProfileService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.getProfileController(
        { credentials: { user: { _id: userId } } } as unknown as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getProfileByIdController', () => {
    it('returns 400 when no id param is provided', async () => {
      const getProfileById = jest.fn(async (_id: string) => baseUser);
      const controller = new ProfileController({
        getProfileById,
      } as unknown as ProfileService);
      const { res, status, json } = createMockResponse();

      await controller.getProfileByIdController(
        { params: {} } as unknown as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(getProfileById).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        statusCode: 400,
        message: 'User id is required',
      });
    });

    it('returns the project response envelope when an id is provided', async () => {
      const getProfileById = jest.fn(async (_id: string) => baseUser);
      const controller = new ProfileController({
        getProfileById,
      } as unknown as ProfileService);
      const { res, status, json } = createMockResponse();

      await controller.getProfileByIdController(
        { params: { id: userIdString } } as unknown as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(getProfileById).toHaveBeenCalledWith(userIdString);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Profile fetched successfully',
        data: baseUser,
      });
    });

    it('forwards errors to next', async () => {
      const error = new NotFoundException('User not found');
      const getProfileById = jest.fn(async (_id: string) => {
        throw error;
      });
      const controller = new ProfileController({
        getProfileById,
      } as unknown as ProfileService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.getProfileByIdController(
        { params: { id: userIdString } } as unknown as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateProfileController', () => {
    it('returns the project response envelope for the authenticated user', async () => {
      const updateData = { firstName: 'Janet' };
      const updatedUser = {
        firstName: 'Janet',
        lastName: baseUser.lastName,
        email: baseUser.email,
      };
      const updateProfile = jest.fn(
        async (_id: Types.ObjectId, _data: unknown) => updatedUser,
      );
      const controller = new ProfileController({
        updateProfile,
      } as unknown as ProfileService);
      const { res, status, json } = createMockResponse();

      await controller.updateProfileController(
        {
          credentials: { user: { _id: userId } },
          body: updateData,
        } as unknown as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(updateProfile).toHaveBeenCalledWith(userId, updateData);
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    });

    it('forwards errors to next', async () => {
      const error = new NotFoundException('User not found');
      const updateProfile = jest.fn(
        async (_id: Types.ObjectId, _data: unknown) => {
          throw error;
        },
      );
      const controller = new ProfileController({
        updateProfile,
      } as unknown as ProfileService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.updateProfileController(
        {
          credentials: { user: { _id: userId } },
          body: { firstName: 'Janet' },
        } as unknown as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
