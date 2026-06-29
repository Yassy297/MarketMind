import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create account.';
    res.status(400).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to sign in.';
    res.status(401).json({ message });
  }
};
