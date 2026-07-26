import { UserRepo, userRepo } from '../../common/repositories/user.repo.js';
import { OtpService, otpService } from '../../common/services/otp.service.js';
import {
  SecurityService,
  securityService,
} from '../../common/services/securtiy.service.js';
import { NotFoundException } from '../../common/utils/exception.util.js';
import { smtpService } from '../../common/services/smtp.service.js';
import { forgetPasswordOTPTemplate } from '../../common/templates/forget-password-otp.template.js';

export class AuthService {
  constructor(
    private readonly userRepo: UserRepo,
    private readonly securityService: SecurityService,
    private readonly otpService: OtpService,
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
      },
      options: { lean: false },
    });
    return user;
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

export const authService = new AuthService(userRepo, securityService, otpService);
