import { Types } from 'mongoose';
import { RedisService, redisService } from '../../DB/redis';
import { SecurityService, securityService } from './securtiy.service';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  TooManyRequestsException,
  UnauthorizedException,
} from '../utils/exception.util';
import { generateOTP } from '../utils/otp.util';

export class OtpService {
  constructor(
    private readonly redisService: RedisService,
    private readonly securityService: SecurityService,
  ) {}

  async send(userId: Types.ObjectId, subject: string) {
    const blockTll = await this.redisService.getTTL(
      this.redisService.otpKeyBlock({ userId, subject }),
    );

    if (blockTll > 0) {
      throw new TooManyRequestsException(
        `Too many requests. Please try again in ${Math.ceil(blockTll / 60)} minutes`,
      );
    }

    const currentOtpTtl = await this.redisService.getTTL(
      this.redisService.otpKey({ userId, subject }),
    );

    if (currentOtpTtl > 0) {
      throw new TooManyRequestsException(
        `Please wait ${Math.ceil(currentOtpTtl / 60)} minutes before requesting a new code`,
      );
    }

    const otp = await generateOTP();

    const otpKey = this.redisService.otpKey({ userId, subject });

    await this.redisService.set({
      key: otpKey,
      value: { hashedOtp: await this.securityService.hash(otp), attempts: 1 },
      ttl: 2 * 60,
    });

    return otp;
  }

  async verify(userId: Types.ObjectId, subject: string, otp: string) {
    const blockTll = await this.redisService.getTTL(
      this.redisService.otpKeyBlock({ userId, subject }),
    );

    if (blockTll > 0) {
      throw new TooManyRequestsException(
        `Too many requests. Please try again in ${Math.ceil(blockTll / 60)} minutes`,
      );
    }

    const otpKey = this.redisService.otpKey({ userId, subject });
    const otpRaw = await this.redisService.get(otpKey);

    if (!otpRaw)
      throw new NotFoundException('No OTP found or code has expired');

    if ((JSON.parse(otpRaw as string) as { verified: boolean }).verified) {
      throw new ConflictException('OTP has been verified ');
    }
    const { hashedOtp, attempts } = JSON.parse(otpRaw as string) as {
      hashedOtp: string;
      attempts: number;
    };

    if (!(await this.securityService.verify(hashedOtp, otp))) {
      const newAttempts = attempts + 1;
      if (newAttempts >= 5) {
        await Promise.all([
          this.redisService.set({
            key: this.redisService.otpKeyBlock({ userId, subject }),
            value: 1,
            ttl: 7 * 60,
          }),
          this.redisService.del(otpKey),
        ]);
        throw new TooManyRequestsException(
          'Too many failed attempts. Please request a new code',
        );
      }
      await this.redisService.set({
        key: otpKey,
        value: { hashedOtp, attempts: newAttempts },
        ttl: await this.redisService.getTTL(otpKey),
      });
      throw new UnauthorizedException(
        `Invalid verification code. Only ${5 - newAttempts} attempts left`,
      );
    }
    await this.redisService.set({
      key: otpKey,
      value: { verified: true },
      ttl: 10 * 60,
    });
    return true;
  }

  async consume(userId: Types.ObjectId, subject: string) {
    const otpKey = this.redisService.otpKey({ userId, subject });

    const otpRaw = await this.redisService.get(otpKey);

    if (!otpRaw)
      throw new NotFoundException('No OTP found or code has expired');

    if (!JSON.parse(otpRaw as string).verified) {
      throw new ForbiddenException('OTP has not been verified yet');
    }

    await this.redisService.del(otpKey);
    return true;
  }
}

export const otpService = new OtpService(redisService, securityService);
