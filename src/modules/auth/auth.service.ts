import { UserRepo, userRepo } from '../../common/repositories/user.repo';
import { OtpService, otpService } from '../../common/services/otp.service';
import {
  SecurityService,
  securityService,
} from '../../common/services/securtiy.service';
import { NotFoundException, UnauthorizedException } from '../../common/utils/exception.util';
import { smtpService } from '../../common/services/smtp.service';
import { forgetPasswordOTPTemplate } from '../../common/templates/forget-password-otp.template';
import { LoginDto } from './dto/login.dto';
import { IUser } from '../../common/types/user.types';
import * as jwt from "jsonwebtoken";

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

  private async createToken(user: IUser) {
    const payload = { id: user._id, email: user.email, name: `${user.firstName} ${user.lastName}` };
    // TODO: Use the expiration from the environment variable, but ensure it's a valid string or number
    return jwt.sign(payload, process.env.USER_ACCESS_SECRET!, { expiresIn: Number(process.env.USER_ACCESS_SECRET_EXPIRATION)  ?? '1h' });
  }

  async login(loginDto: LoginDto) {
    const user = await this.findUser(loginDto.email);
    // Handle the case where the user is not found
    if (!user) throw new NotFoundException('User not found');

    const isPasswordValid = await this.securityService.verify(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) throw new UnauthorizedException('Invalid credentials');

    return { success: true, message: 'Logged in successfully', token: await this.createToken(user) };
  }

  async register() {}

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
