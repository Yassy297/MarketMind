import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ACCESS_TOKEN_COOKIE } from '../utils/cookies';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
  const header = req.headers.authorization;
  const headerToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  const token = cookieToken ?? headerToken;

  if (!token) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as {
      id: string;
      email: string;
      name: string;
      role: 'user' | 'admin';
    };

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

declare global {
  // Express request augmentation requires declaration merging.
  // eslint-disable-next-line @typescript-eslint/no-namespace
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
