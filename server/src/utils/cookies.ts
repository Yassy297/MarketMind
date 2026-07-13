import type { Response } from 'express';
import { env } from '@/config/env';

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'lax' as const
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...baseCookieOptions,
    maxAge: env.accessTokenTtlMinutes * 60 * 1000,
    path: '/'
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...baseCookieOptions,
    maxAge: env.refreshTokenTtlDays * 24 * 60 * 60 * 1000,
    path: '/auth'
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseCookieOptions, path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseCookieOptions, path: '/auth' });
}
