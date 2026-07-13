import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

export const validateBody = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const firstIssue = result.error.issues[0];
    res.status(422).json({
      message: firstIssue?.message ?? 'Invalid request body.',
      errors: result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
    return;
  }

  req.body = result.data;
  next();
};
