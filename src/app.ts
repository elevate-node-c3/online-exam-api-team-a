import express, { Express, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import './models/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { NotFoundException } from './common/utils/exception.utils.js';
import { serverLogger } from './common/utils/pino.util.js';
import { globalErrorHandler } from './common/middlewares/middleware.js';
import { PORT } from './configs/env.config.js';
import { DBService } from './DB/db.js';
import { redisService } from './DB/redis.js';
import { smtpService } from './services/smtp.service.js';

config({
  path: resolve(`./.env.${process.env.NODE_ENV && 'development'}`),
});
export const app = async () => {
  const APP: Express = express();

  APP.use(helmet());
  APP.use(cors({ origin: '*', credentials: true }));
  APP.use(express.json());
  APP.use(cookieParser());

  try {
    await DBService.connectDB();
    await smtpService.checkSMTP();
    await redisService.connect();
  } catch (error) {
    serverLogger.error({ err: error }, 'Startup failed');
    process.exit(1);
  }
  console.log('done');

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
