import { UserRepo, userRepo } from '../../common/repositories/user.repo';
import { OtpService, otpService } from '../../common/services/otp.service';
import {
  SecurityService,
  securityService,
} from '../../common/services/securtiy.service';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '../../common/utils/exception.util';
import { smtpService } from '../../common/services/smtp.service';
import { forgetPasswordOTPTemplate } from '../../common/templates/forget-password-otp.template';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';
import {
  TokenService,
  tokenService,
} from '../../common/services/token.service';
import { SignOptions } from 'jsonwebtoken';
import { redisService, RedisService } from '../../DB';
import { Types } from 'mongoose';

export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly securityService: SecurityService,
    private readonly otpService: OtpService,
    private readonly tokenService: TokenService,
    private readonly redisService: RedisService,
  ) {}

  private async findUser(email: string) {
    const user = await this.userRepo.findOne({
      filter: { email: email },
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
    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.findUser(loginDto.email);
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await this.securityService.verify(
      user.password,
      loginDto.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    return {
      success: true,
      message: 'User logged in successfully',
      token: this.tokenService.generateToken({
        payload: { _id: String(user._id), email: user.email, role: user.role },
        options: {
          expiresIn: (process.env.USER_ACCESS_SECRET_EXPIRATION ||
            '1h') as NonNullable<SignOptions['expiresIn']>,
        },
      }),
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;
    const hashedPassword = await this.securityService.hash(password);

    try {
      await this.userRepo.create({
        data: { firstName, lastName, email, password: hashedPassword },
      });

      return {
        success: true,
        message: 'User registered successfully',
      };
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        (error as any).code === 11000
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Error creating user', {
        cause: error,
      });
    }
  }

  async logout({ jti, userId }: { jti: string; userId: Types.ObjectId }) {
    await this.tokenService.revokeToken({ jti, userId });
    await this.redisService.set({
      key: this.redisService.revokedTokenKey({ jti, userId }),
      value: 1,
    });
    return {
      success: true,
      message: 'User logged out successfully',
    };
  }

  async sendForgetPasswordOTP({ email }: { email: string }) {
    const user = await this.findUser(email);
    if (!user) return;

    const otp = await this.otpService.send(user._id, 'FORGET-PASSWORD');

    await smtpService.sendMail({
      to: email,
      subject: 'Your password reset code',
      html: forgetPasswordOTPTemplate({ otp, firstName: user.firstName }),
    });
  }

  async verifyForgotPasswordOTP({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }) {
    const user = await this.findUser(email);
    if (!user) return;
    await this.otpService.verify(user._id, 'FORGET-PASSWORD', otp);
  }

  async resetPassword({
    email,
    newPassword,
  }: {
    email: string;
    newPassword: string;
  }) {
    const user = await this.findUser(email);
    if (!user) throw new NotFoundException('User not found');

    await this.otpService.consume(user._id, 'FORGET-PASSWORD');

    await this.userRepo.updateOne({
      filter: { _id: user._id, email: email },
      update: {
        $set: {
          password: await this.securityService.hash(newPassword),
          credentialsChangedAt: new Date(),
        },
        $push: { oldPasswords: user.password },
      },
    });
  }
}

export const authService = new AuthService(
  userRepo,
  securityService,
  otpService,
  tokenService,
  redisService,
);
