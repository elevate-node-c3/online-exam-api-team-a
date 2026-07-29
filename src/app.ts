import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import './models/index';
import { NotFoundException } from './common/utils/exception.util';
import { serverLogger } from './common/utils/pino.util';
import { globalErrorHandler } from './common/middlewares/globalError.middleware';
import { initCredentials } from './common/middlewares/credentials.middleware';
import { PORT } from './common/configs/env.config';
import { DBService } from './DB/db';
import { redisService } from './DB/redis';
import { smtpService } from './common/services/smtp.service';
import { ROUTES } from './routes';
import authRouter from './modules/auth/auth.router';
import { quizRouter } from './modules/quiz/quiz.router';
import { diplomaRouter } from './modules/diploma/diploma.router';
import { attemptRouter } from './modules/attempt/attempt.router';
import { UPLOADS_ROOT } from './common/utils/multer.util';
import profileRouter from './modules/profile/profile.router';

export const app = async () => {
  const APP: Express = express();

  APP.use(helmet());
  APP.use(cors({ origin: '*', credentials: true }));
  APP.use(express.json());
  APP.use(cookieParser());
  APP.use('/uploads', express.static(UPLOADS_ROOT));
  APP.use(initCredentials);

  try {
    // Can be done better if used Promise.all([]);
    await DBService.connectDB();
    await smtpService.checkSMTP();
    await redisService.connect();
  } catch (error) {
    serverLogger.error({ err: error }, 'Startup failed');
    process.exit(1);
  }

  APP.use(ROUTES.AUTH.BASE, authRouter);
  APP.use(ROUTES.QUIZ.BASE, quizRouter);
  APP.use(ROUTES.DIPLOMA.BASE, diplomaRouter);
  APP.use(ROUTES.PROFILE.BASE, profileRouter);
  APP.use(ROUTES.ATTEMPT.BASE, attemptRouter);

  // health check route
  APP.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'OK' });
  });

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
