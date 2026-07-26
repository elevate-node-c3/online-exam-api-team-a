import mongoose from 'mongoose';
import { InternalServerErrorException } from '../common/utils/exception.util';
import { serverLogger } from '../common/utils/pino.util';
import { MONGO_URI } from '../common/configs/env.config';

export class DatabaseService {
  private handleEvents(): void {
    mongoose.connection.on('error', (err) => {
      serverLogger.error({ err }, 'DB Error');
    });
    mongoose.connection.on('connected', () => {
      serverLogger.info('DB Is Connected');
    });
    mongoose.connection.on('disconnected', () => {
      serverLogger.warn('DB Disconnected');
    });
  }
  public async connectDB(): Promise<void> {
    this.handleEvents();
    try {
      await mongoose.connect(MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      serverLogger.info('Database service is ready');
    } catch (error) {
      serverLogger.error({ err: error }, 'Database Connection Failed');
      throw new InternalServerErrorException(
        `Database Connection Failed: ${error}`,
      );
    }
  }
}

export const DBService = new DatabaseService();
