import pino from 'pino';
import { resolve } from 'node:path';

const activityStreams: pino.StreamEntry[] = [];

const serverStreams: pino.StreamEntry[] = [
  {
    level: 'error',
    stream: process.stdout,
  },
];

if (process.env.NODE_ENV == 'development') {
  activityStreams.push(
    {
      level: 'debug',
      stream: pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, ignore: 'pid,hostname' },
      }),
    },
    {
      level: 'debug',
      stream: pino.transport({
        target: 'pino/file',
        options: { destination: resolve('./src/logs/app.log'), mkdir: true },
      }),
    },
  );

  serverStreams.push(
    {
      level: 'debug',
      stream: pino.transport({
        target: 'pino-pretty',
        options: { colorize: true, ignore: 'pid,hostname' },
      }),
    },
    {
      level: 'error',
      stream: pino.transport({
        target: 'pino/file',
        options: { destination: resolve('./src/logs/server.log'), mkdir: true },
      }),
    },
  );
}

export const activityLogger = pino(
  { level: process.env.NODE_ENV == 'development' ? 'debug' : 'info' },
  pino.multistream(activityStreams),
);

export const serverLogger = pino(
  { level: process.env.NODE_ENV == 'development' ? 'debug' : 'error' },
  pino.multistream(serverStreams),
);
