
import argon2 from 'argon2';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ENCRYPTION_ALGORITHM, ENCRYPTION_IV_LENGTH, ENCRYPTION_SECRET } from '../configs/env.config.js';

export class SecurityService {
  constructor() {}

  encrypt(text: string): string {
    const KEY = Buffer.from(ENCRYPTION_SECRET!, 'hex');

    const iv = randomBytes(ENCRYPTION_IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM!, KEY, iv);
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final(),
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  decrypt(payload: string): string {
    const KEY = Buffer.from(ENCRYPTION_SECRET!, 'hex');
    const [ivHex, encryptedHex] = payload.split(':');
    const iv = Buffer.from(ivHex!, 'hex');
    const encrypted = Buffer.from(encryptedHex!, 'hex');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM!, KEY, iv);
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  async hash(text: string | Buffer): Promise<string> {
    try {
      const payload = await argon2.hash(text);
      return payload;
    } catch (err) {
      throw err;
    }
  }

  async verify(digest: string, password: string | Buffer): Promise<boolean> {
    try {
      return await argon2.verify(digest, password);
    } catch (err) {
      throw err;
    }
  }
}

export const securityService = new SecurityService();
