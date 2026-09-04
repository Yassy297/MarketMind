import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { REFRESH_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from '../utils/cookies';

export const register = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account.';
    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await authService.login(req.body);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    res.status(401).json({ message });
  }
};

export const refresh = async (req: Request, res: Response) => {
  const existingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (!existingRefreshToken) {
    res.status(401).json({ message: 'No active session found.' });
    return;
  }

  try {
    const { accessToken, refreshToken, user } = await authService.refresh(existingRefreshToken);
    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user });
  } catch (error) {
    clearAuthCookies(res);
    const message = error instanceof Error ? error.message : 'Unable to refresh session.';
    res.status(401).json({ message });
  }
};

export const logout = async (req: Request, res: Response) => {
  const existingRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];

  if (existingRefreshToken) {
    await authService.revokeRefreshToken(existingRefreshToken);
  }

  clearAuthCookies(res);
  res.status(204).send();
};

export const getMe = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load your profile.';
    res.status(401).json({ message });
  }
};

export const updateAppearance = async (req: Request, res: Response) => {
  if (!req.user?.id) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }
  try {
    const user = await authService.updateAppearance(req.user.id, req.body.appearance);
    res.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save appearance.';
    res.status(400).json({ message });
  }
};
