import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const dashboardRouter = Router();

// GET /api/dashboard/stats - Returns live calculated statistics from database
dashboardRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const stats = db.getDashboardStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/search - Dynamic global search across all backend entities
dashboardRouter.get('/search', (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const results = db.globalSearch(query || '');
    res.json(results);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit - Audit trail of all actions
dashboardRouter.get('/audit', (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const events = db.getAuditEvents(limit);
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
