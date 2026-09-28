import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const provenanceRouter = Router();

// GET /api/provenance - Lists all capsules
provenanceRouter.get('/', (_req: Request, res: Response) => {
  try {
    const capsules = db.getProvenanceCapsules();
    res.json(capsules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/provenance/:id - Returns specific capsule
provenanceRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const capsule = db.getProvenanceCapsuleById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ error: 'Provenance capsule not found' });
    }
    res.json(capsule);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/provenance/:id/verify - Cryptographically verifies a provenance capsule
provenanceRouter.post('/:id/verify', (req: Request, res: Response) => {
  try {
    const verification = db.verifyProvenanceCapsule(req.params.id);
    if (!verification.valid) {
      return res.status(404).json(verification);
    }
    res.json(verification);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
