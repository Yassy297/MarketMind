import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const token = header.replace('Bearer ', '');

  try {
    const secret = env.jwtSecret;
    if (!secret) {
      throw new Error('Authentication secret is not configured.');
    }
    const payload = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';
    };

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid authentication token.' });
  }
};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: 'user' | 'admin';
      };
    }
  }
}
