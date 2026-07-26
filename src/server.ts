import { app } from './app';
import { serverLogger } from './common/utils/pino.util';

try {
  await app();
} catch (err) {
  serverLogger.error({ err }, 'Fatal error during server startup');
  process.exit(1);
}
