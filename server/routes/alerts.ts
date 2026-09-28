import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const alertsRouter = Router();

// GET /api/alerts
alertsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const alerts = db.getAlerts();
    res.json(alerts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/:id/acknowledge
alertsRouter.post('/:id/acknowledge', (req: Request, res: Response) => {
  try {
    const { acknowledgedBy } = req.body;
    const alert = db.acknowledgeAlert(req.params.id, acknowledgedBy || 'Duty Officer');
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/alerts/:id/resolve
alertsRouter.post('/:id/resolve', (req: Request, res: Response) => {
  try {
    const { resolvedBy } = req.body;
    const alert = db.resolveAlert(req.params.id, resolvedBy || 'Duty Officer');
    if (!alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }
    res.json(alert);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
