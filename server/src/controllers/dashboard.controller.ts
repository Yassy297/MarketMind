import type { Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';

export const getDashboard = async (req: Request, res: Response) => {
  try {
    if (!req.user?.id) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const summary = await dashboardService.getSummaryForUser(req.user.id);
    res.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load dashboard.';
    res.status(500).json({ message });
  }
};
