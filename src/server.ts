import { app } from './app.js';
import { serverLogger } from './utils/pino.util.js';

try {
  await app();
} catch (err) {
  serverLogger.error({ err }, 'Fatal error during server bootstrap');
  process.exit(1);
}
