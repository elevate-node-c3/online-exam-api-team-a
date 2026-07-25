import { RedisClientType, createClient } from 'redis';
import { REDIS_URL } from '../common/configs/env.config.js';
import { Types } from 'mongoose';
import { serverLogger } from '../common/utils/pino.util.js';
export class RedisService {
  private readonly client: RedisClientType;
  constructor() {
    this.client = createClient({
      url: REDIS_URL,
    });
    this.handleEvents();
  }
  private handleEvents() {
    this.client.on('error', (err) =>
      serverLogger.error({ err }, 'Redis Error'),
    );
    this.client.on('ready', () => serverLogger.info('Redis Is Connected'));
  }
  public async connect() {
    try {
      await this.client.connect();
      serverLogger.info('Redis Service is ready');
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
    }
  }
  public revokedTokenPrefix(userId: string | Types.ObjectId) {
    return `user:${userId}:REVOKED_TOKEN`;
  }

  public revokedTokenKey({
    jti,
    userId,
  }: {
    jti: string;
    userId: string | Types.ObjectId;
  }) {
    return `${this.revokedTokenPrefix(userId)}:${jti}`;
  }

  public otpKey({
    userId,
    subject,
  }: {
    userId: Types.ObjectId | string;
    subject: string;
  }) {
    return `user:${userId}:OTP:${subject}`;
  }

  public otpKeyPenalty({
    userId,
    subject,
  }: {
    userId: Types.ObjectId | string;
    subject: string;
  }) {
    return `user:${userId}:OTP:${subject}:penalty`;
  }

  public otpKeyBlock({
    userId,
    subject,
  }: {
    userId: Types.ObjectId | string;
    subject: string;
  }) {
    return `user:${userId}:OTP:${subject}:block`;
  }

  public async set({
    key,
    value,
    ttl = null,
  }: {
    key: string;
    value: string | number | object;
    ttl?: number | null;
  }): Promise<string | null> {
    try {
      const data = typeof value == 'object' ? JSON.stringify(value) : value;
      const options = ttl ? { EX: ttl } : {};
      return await this.client.set(key, data, options);
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return null;
    }
  }
  public async get(key: string): Promise<string | object | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return null;
    }
  }

  public async del(key: string | string[]): Promise<number> {
    try {
      if (!key.length) return 0;
      return this.client.del(key);
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return 0;
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return false;
    }
  }

  public async getTTL(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return -2;
    }
  }

  public async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (err) {
      serverLogger.error({ err }, 'Redis Error');
      return null;
    }
  }
}

export const redisService = new RedisService();
