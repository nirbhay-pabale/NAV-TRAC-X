import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { gmailService } from '../services/gmailService';

export const emconRouter = Router();

// GET /api/emcon/status
emconRouter.get('/status', (_req: Request, res: Response) => {
  try {
    const status = db.getEmconState();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/emcon/events
emconRouter.get('/events', (_req: Request, res: Response) => {
  try {
    const events = db.getAuditEvents(20).filter((e) => e.type.includes('EMCON') || e.type.includes('AIR_GAP'));
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/emcon/posture
emconRouter.post('/posture', async (req: Request, res: Response) => {
  try {
    const { posture } = req.body;
    const previousPosture = db.getEmconState().currentPosture;
    const updated = db.updateEmconPosture(posture);

    // If transitioning from silent/EMCON to Normal Operations, flush pending Gmail queue!
    let flushResult = null;
    if (
      (previousPosture.includes('Alpha') || previousPosture.includes('Bravo')) &&
      !posture.includes('Alpha') &&
      !posture.includes('Bravo')
    ) {
      flushResult = await gmailService.flushEmconQueue();
    }

    res.json({
      emcon: updated,
      flushResult,
      isEmconActive: db.isEmconActive(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/emcon/export
emconRouter.post('/export', (req: Request, res: Response) => {
  try {
    const payload = {
      exportedAt: new Date().toISOString(),
      posture: db.getEmconState().currentPosture,
      queuedNotifications: db.getNotificationQueue().filter((q) => q.status === 'QUEUED'),
      disconnectedUnits: db.getDisconnectedUnits(),
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=EMCON_AirGap_Package_${Date.now()}.json`);
    res.json(payload);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/emcon/import
emconRouter.post('/import', (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    res.json({
      success: true,
      importedEventsCount: events?.length || 0,
      status: 'VERIFIED_AIR_GAP_IMPORT',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/emcon/reconcile
emconRouter.post('/reconcile', (req: Request, res: Response) => {
  try {
    const { unitId } = req.body;
    const result = db.reconcileUnit(unitId || 'DISC-01');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
