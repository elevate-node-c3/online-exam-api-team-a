import { CookieOptions } from 'express';

export const accessTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 10 * 24 * 60 * 60 * 1000,
};
