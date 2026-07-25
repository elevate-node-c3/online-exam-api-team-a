import { createTransport, Transporter } from 'nodemailer';
import {
  SMTP_PASS,
  SMTP_PORT,
  SMTP_SERVICE,
  SMTP_USER,
} from '../configs/env.config.js';
import { serverLogger } from '../common/utils/pino.util.js';

export class SmtpService {
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      port: SMTP_PORT,
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  public async checkSMTP(): Promise<void> {
    try {
      await this.transporter.verify();
      serverLogger.info('SMTP service is ready');
    } catch (error) {
      serverLogger.error(`SMTP Service Error: ${error}`);
    }
  }

  public async sendMail({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: SMTP_USER,
        to,
        html,
        subject,
      });
      serverLogger.info(
        `Email sent successfully to ${to} with subject: ${subject}`,
      );
    } catch (error) {
      serverLogger.error(`SMTP Error: ${error}`);
    }
  }
}

export const smtpService = new SmtpService();
