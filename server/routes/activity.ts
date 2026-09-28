import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const activityRouter = Router();

// GET /api/activity
activityRouter.get('/', (_req: Request, res: Response) => {
  try {
    const logs = db.getActivityLogs();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
