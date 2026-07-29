jest.mock('../../common/services/smtp.service', () => ({
  smtpService: { sendMail: jest.fn() },
}));

import { describe, expect, it, jest } from '@jest/globals';
import { NextFunction, Request, Response } from 'express';
import { Types } from 'mongoose';
import { UserRepo } from '../../common/repositories/user.repo';
import { SecurityService } from '../../common/services/securtiy.service';
import { OtpService } from '../../common/services/otp.service';
import { TokenService } from '../../common/services/token.service';
import { RedisService } from '../../DB';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '../../common/utils/exception.util';
import { smtpService } from '../../common/services/smtp.service';
import { forgetPasswordOTPTemplate } from '../../common/templates/forget-password-otp.template';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';



let mockedSendMail: jest.SpiedFunction<typeof smtpService.sendMail>;

beforeEach(() => {
  mockedSendMail = jest
    .spyOn(smtpService, 'sendMail')
    .mockResolvedValue(undefined as any);
});

afterEach(() => {
  mockedSendMail.mockRestore();
});
const userId = new Types.ObjectId('507f191e810c19729de860ea');

beforeAll(() => {
  delete process.env.USER_ACCESS_SECRET_EXPIRATION;
});

const dbUser = {
  _id: userId,
  email: 'jane.doe@example.com',
  firstName: 'Jane',
  password: 'hashed-old-password',
  oldPasswords: [] as string[],
  role: 'user',
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

type MockedService<T> = {
  [K in keyof T]?: jest.Mock<(...args: any[]) => any>;
};

const createService = (overrides: {
  userRepo?: MockedService<UserRepo>;
  securityService?: MockedService<SecurityService>;
  otpService?: MockedService<OtpService>;
  tokenService?: MockedService<TokenService>;
  redisService?: MockedService<RedisService>;
}) =>
  new AuthService(
    (overrides.userRepo ?? {}) as unknown as UserRepo,
    (overrides.securityService ?? {}) as unknown as SecurityService,
    (overrides.otpService ?? {}) as unknown as OtpService,
    (overrides.tokenService ?? {}) as unknown as TokenService,
    (overrides.redisService ?? {}) as unknown as RedisService,
  );

beforeEach(() => {
  mockedSendMail.mockClear();
});

describe('AuthService', () => {
  describe('login', () => {
    it('returns a token for valid credentials', async () => {
      const findOne = jest.fn(async (_input: unknown) => dbUser);
      const verify = jest.fn(async (_hash: string, _plain: string) => true);
      const generateToken = jest.fn((_input: unknown) => 'signed-token');
      const service = createService({
        userRepo: { findOne },
        securityService: { verify },
        tokenService: { generateToken },
      });

      const result = await service.login({
        email: dbUser.email,
        password: 'plain-password',
      });

      expect(findOne).toHaveBeenCalledWith({
        filter: { email: dbUser.email },
        projection: {
          email: 1,
          _id: 1,
          firstName: 1,
          password: 1,
          oldPasswords: 1,
          role: 1,
        },
        options: { lean: false },
      });
      expect(verify).toHaveBeenCalledWith(dbUser.password, 'plain-password');
      expect(generateToken).toHaveBeenCalledWith({
        payload: {
          _id: String(dbUser._id),
          email: dbUser.email,
          role: dbUser.role,
        },
        options: { expiresIn: '1h' },
      });
      expect(result).toEqual({
        success: true,
        message: 'User logged in successfully',
        token: 'signed-token',
      });
    });

    it('throws NotFoundException when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const service = createService({ userRepo: { findOne } });

      await expect(
        service.login({ email: dbUser.email, password: 'plain-password' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException for an invalid password', async () => {
      const findOne = jest.fn(async (_input: unknown) => dbUser);
      const verify = jest.fn(async (_hash: string, _plain: string) => false);
      const service = createService({
        userRepo: { findOne },
        securityService: { verify },
      });

      await expect(
        service.login({ email: dbUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    const registerDto = {
      email: dbUser.email,
      password: 'plain-password',
      confirmPassword: 'plain-password',
      firstName: 'Jane',
      lastName: 'Doe',
    };

    it('creates a user with a hashed password', async () => {
      const create = jest.fn(async (_input: unknown) => undefined);
      const hash = jest.fn(async (_password: string) => 'hashed-password');
      const service = createService({
        userRepo: { create },
        securityService: { hash },
      });

      const result = await service.register(registerDto);

      expect(hash).toHaveBeenCalledWith(registerDto.password);
      expect(create).toHaveBeenCalledWith({
        data: {
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
          email: registerDto.email,
          password: 'hashed-password',
        },
      });
      expect(result).toEqual({
        success: true,
        message: 'User registered successfully',
      });
    });

    it('throws ConflictException when the email is already taken', async () => {
      const duplicateKeyError = Object.assign(new Error('duplicate'), {
        code: 11000,
      });
      const create = jest.fn(async (_input: unknown) => {
        throw duplicateKeyError;
      });
      const service = createService({
        userRepo: { create },
        securityService: { hash: jest.fn(async () => 'hashed-password') },
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('throws InternalServerErrorException for unexpected errors', async () => {
      const create = jest.fn(async (_input: unknown) => {
        throw new Error('connection lost');
      });
      const service = createService({
        userRepo: { create },
        securityService: { hash: jest.fn(async () => 'hashed-password') },
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('logout', () => {
    it('revokes the token and marks it as revoked in redis', async () => {
      const revokeToken = jest.fn(async (_input: unknown) => undefined);
      const set = jest.fn(async (_input: unknown) => undefined);
      const revokedTokenKey = jest.fn(
        (_input: unknown) => 'revoked-token-key',
      );
      const service = createService({
        tokenService: { revokeToken },
        redisService: { set, revokedTokenKey },
      });

      const result = await service.logout({ jti: 'jti-123', userId });

      expect(revokeToken).toHaveBeenCalledWith({ jti: 'jti-123', userId });
      expect(revokedTokenKey).toHaveBeenCalledWith({
        jti: 'jti-123',
        userId,
      });
      expect(set).toHaveBeenCalledWith({
        key: 'revoked-token-key',
        value: 1,
      });
      expect(result).toEqual({
        success: true,
        message: 'User logged out successfully',
      });
    });
  });

  describe('sendForgetPasswordOTP', () => {
    it('sends an OTP email when the user exists', async () => {
      const findOne = jest.fn(async (_input: unknown) => dbUser);
      const send = jest.fn(async (_userId: unknown, _type: string) => '654321');
      const service = createService({
        userRepo: { findOne },
        otpService: { send },
      });

      await service.sendForgetPasswordOTP({ email: dbUser.email });

      expect(send).toHaveBeenCalledWith(dbUser._id, 'FORGET-PASSWORD');
      expect(mockedSendMail).toHaveBeenCalledWith({
        to: dbUser.email,
        subject: 'Your password reset code',
        html: forgetPasswordOTPTemplate({
          otp: '654321',
          firstName: dbUser.firstName,
        }),
      });
    });

    it('does nothing when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const send = jest.fn(async (_userId: unknown, _type: string) => '654321');
      const service = createService({
        userRepo: { findOne },
        otpService: { send },
      });

      await service.sendForgetPasswordOTP({ email: 'missing@example.com' });

      expect(send).not.toHaveBeenCalled();
      expect(mockedSendMail).not.toHaveBeenCalled();
    });
  });

  describe('verifyForgotPasswordOTP', () => {
    it('verifies the OTP when the user exists', async () => {
      const findOne = jest.fn(async (_input: unknown) => dbUser);
      const verify = jest.fn(
        async (_userId: unknown, _type: string, _otp: string) => undefined,
      );
      const service = createService({
        userRepo: { findOne },
        otpService: { verify },
      });

      await service.verifyForgotPasswordOTP({
        email: dbUser.email,
        otp: '654321',
      });

      expect(verify).toHaveBeenCalledWith(
        dbUser._id,
        'FORGET-PASSWORD',
        '654321',
      );
    });

    it('does nothing when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const verify = jest.fn(
        async (_userId: unknown, _type: string, _otp: string) => undefined,
      );
      const service = createService({
        userRepo: { findOne },
        otpService: { verify },
      });

      await service.verifyForgotPasswordOTP({
        email: 'missing@example.com',
        otp: '654321',
      });

      expect(verify).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('throws NotFoundException when the user does not exist', async () => {
      const findOne = jest.fn(async (_input: unknown) => null);
      const service = createService({ userRepo: { findOne } });

      await expect(
        service.resetPassword({
          email: 'missing@example.com',
          newPassword: 'new-password',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('consumes the OTP and updates the password when the user exists', async () => {
      const findOne = jest.fn(async (_input: unknown) => dbUser);
      const updateOne = jest.fn(async (_input: unknown) => undefined);
      const consume = jest.fn(
        async (_userId: unknown, _type: string) => undefined,
      );
      const hash = jest.fn(async (_password: string) => 'hashed-new-password');
      const service = createService({
        userRepo: { findOne, updateOne },
        otpService: { consume },
        securityService: { hash },
      });

      await service.resetPassword({
        email: dbUser.email,
        newPassword: 'new-password',
      });

      expect(consume).toHaveBeenCalledWith(dbUser._id, 'FORGET-PASSWORD');
      expect(hash).toHaveBeenCalledWith('new-password');
      expect(updateOne).toHaveBeenCalledWith({
        filter: { _id: dbUser._id, email: dbUser.email },
        update: {
          $set: {
            password: 'hashed-new-password',
            credentialsChangedAt: expect.any(Date),
          },
          $push: { oldPasswords: dbUser.password },
        },
      });
    });
  });
});

describe('AuthController', () => {
  describe('registerController', () => {
    it('returns the project response envelope on success', async () => {
      const registerResult = {
        success: true,
        message: 'User registered successfully',
      };
      const register = jest.fn(async (_dto: unknown) => registerResult);
      const controller = new AuthController({
        register,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.registerController(
        { body: {} } as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith({
        statusCode: 201,
        message: 'User registered successfully',
        data: registerResult,
      });
    });

    it('forwards errors to next', async () => {
      const error = new ConflictException('User with this email already exists');
      const register = jest.fn(async (_dto: unknown) => {
        throw error;
      });
      const controller = new AuthController({
        register,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.registerController(
        { body: {} } as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('loginController', () => {
    it('returns only the token in the response data', async () => {
      const login = jest.fn(async (_dto: unknown) => ({
        success: true,
        message: 'User logged in successfully',
        token: 'signed-token',
      }));
      const controller = new AuthController({
        login,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.loginController(
        { body: {} } as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'User logged in successfully',
        data: { token: 'signed-token' },
      });
    });

    it('forwards errors to next', async () => {
      const error = new UnauthorizedException('Invalid credentials');
      const login = jest.fn(async (_dto: unknown) => {
        throw error;
      });
      const controller = new AuthController({
        login,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.loginController(
        { body: {} } as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logoutController', () => {
    it('revokes the session using the request credentials', async () => {
      const logout = jest.fn(
        async (_input: { jti: string; userId: Types.ObjectId }) => ({
          success: true,
          message: 'User logged out successfully',
        }),
      );
      const controller = new AuthController({
        logout,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.logoutController(
        { credentials: { jti: 'jti-123', user: { _id: userId } } },
        res,
        jest.fn() as NextFunction,
      );

      expect(logout).toHaveBeenCalledWith({ jti: 'jti-123', userId });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'User logged out successfully',
      });
    });

    it('forwards errors to next', async () => {
      const error = new Error('revoke failed');
      const logout = jest.fn(
        async (_input: { jti: string; userId: Types.ObjectId }) => {
          throw error;
        },
      );
      const controller = new AuthController({
        logout,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.logoutController(
        { credentials: { jti: 'jti-123', user: { _id: userId } } },
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('sendForgotPasswordOTPController', () => {
    it('returns the project response envelope with no data', async () => {
      const sendForgetPasswordOTP = jest.fn(async (_dto: unknown) => undefined);
      const controller = new AuthController({
        sendForgetPasswordOTP,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.sendForgotPasswordOTPController(
        { body: { email: dbUser.email } } as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(sendForgetPasswordOTP).toHaveBeenCalledWith({
        email: dbUser.email,
      });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Password reset code sent successfully',
      });
    });

    it('forwards errors to next', async () => {
      const error = new Error('smtp failure');
      const sendForgetPasswordOTP = jest.fn(async (_dto: unknown) => {
        throw error;
      });
      const controller = new AuthController({
        sendForgetPasswordOTP,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.sendForgotPasswordOTPController(
        { body: { email: dbUser.email } } as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('verfiyForgotPasswordOTPController', () => {
    it('returns the project response envelope with no data', async () => {
      const verifyForgotPasswordOTP = jest.fn(async (_dto: unknown) => undefined);
      const controller = new AuthController({
        verifyForgotPasswordOTP,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.verfiyForgotPasswordOTPController(
        { body: { email: dbUser.email, otp: '654321' } } as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(verifyForgotPasswordOTP).toHaveBeenCalledWith({
        email: dbUser.email,
        otp: '654321',
      });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'OTP verified',
      });
    });

    it('forwards errors to next', async () => {
      const error = new Error('otp invalid');
      const verifyForgotPasswordOTP = jest.fn(async (_dto: unknown) => {
        throw error;
      });
      const controller = new AuthController({
        verifyForgotPasswordOTP,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.verfiyForgotPasswordOTPController(
        { body: { email: dbUser.email, otp: '654321' } } as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('resetPasswordController', () => {
    it('returns the project response envelope with no data', async () => {
      const resetPassword = jest.fn(async (_dto: unknown) => undefined);
      const controller = new AuthController({
        resetPassword,
      } as unknown as AuthService);
      const { res, status, json } = createMockResponse();

      await controller.resetPasswordController(
        {
          body: { email: dbUser.email, newPassword: 'new-password' },
        } as Request,
        res,
        jest.fn() as NextFunction,
      );

      expect(resetPassword).toHaveBeenCalledWith({
        email: dbUser.email,
        newPassword: 'new-password',
      });
      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        statusCode: 200,
        message: 'Password reset successfully',
      });
    });

    it('forwards errors to next', async () => {
      const error = new NotFoundException('User not found');
      const resetPassword = jest.fn(async (_dto: unknown) => {
        throw error;
      });
      const controller = new AuthController({
        resetPassword,
      } as unknown as AuthService);
      const next = jest.fn((_error?: unknown) => undefined);

      await controller.resetPasswordController(
        {
          body: { email: dbUser.email, newPassword: 'new-password' },
        } as Request,
        createMockResponse().res,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});