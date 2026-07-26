import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import './models/index';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { NotFoundException } from './common/utils/exception.util';
import { serverLogger } from './common/utils/pino.util';
import { globalErrorHandler } from './common/middlewares/globalError.middleware';
import { PORT } from './common/configs/env.config';
import { DBService } from './DB/db';
import { redisService } from './DB/redis';
import { smtpService } from './common/services/smtp.service';
import { ROUTES } from './routes';
import authRouter from './modules/auth/auth.router';

export const app = async () => {
  const APP: Express = express();

  APP.use(helmet());
  APP.use(cors({ origin: '*', credentials: true }));
  APP.use(express.json());
  APP.use(cookieParser());
  APP.use('/uploads', express.static(resolve(import.meta.dirname, 'uploads')));

  try {
    await DBService.connectDB();
    await smtpService.checkSMTP();
    await redisService.connect();
  } catch (error) {
    serverLogger.error({ err: error }, 'Startup failed');
    process.exit(1);
  }

  APP.use(ROUTES.AUTH.BASE, authRouter);

  APP.all('/{*dummy}', (_req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundException());
  });

  APP.use(globalErrorHandler);

  const server = APP.listen(process.env.PORT, () => {
    serverLogger.info(`Server is running on port ${PORT}`);
  });

  server.on('error', (err) => {
    serverLogger.error({ err }, 'Failed to start HTTP server');
    process.exit(1);
  });
};
function resolve(dirname: string, arg1: string): string {
  throw new Error('Function not implemented.');
}
