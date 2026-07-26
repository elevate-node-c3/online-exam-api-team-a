import { app } from './app.js';
import { serverLogger } from './common/utils/pino.util.js';

try {
  await app();
} catch (err) {
  serverLogger.error({ err }, 'Fatal error during server startup');
  process.exit(1);
}
