import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const distributionRouter = Router();

// GET /api/distributions
distributionRouter.get('/', (_req: Request, res: Response) => {
  try {
    const dists = db.getDistributions();
    res.json(dists);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/distributions/:id
distributionRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const dist = db.getDistributionById(req.params.id);
    if (!dist) {
      return res.status(404).json({ error: 'Distribution not found' });
    }
    res.json(dist);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/distributions - Full tactical distribution workflow
distributionRouter.post('/', (req: Request, res: Response) => {
  try {
    const { documentId, recipients, classification, encryptionAlgorithm, distributedBy } = req.body;

    if (!documentId) {
      return res.status(400).json({ error: 'documentId is required' });
    }
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'At least one recipient must be specified' });
    }

    const doc = db.getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ error: `Document ${documentId} not found in registry` });
    }

    const newDist = db.createDistribution({
      documentId,
      documentName: doc.name,
      version: doc.version,
      recipients,
      classification: classification || doc.classification,
      encryptionAlgorithm: encryptionAlgorithm || 'ML-KEM-768 + AES-256-GCM',
      distributedBy: distributedBy || 'Lt. Cdr. S. Rao',
    });

    res.status(201).json({
      success: true,
      message: `Document distributed successfully to ${recipients.length} naval units.`,
      distribution: newDist,
      status: 'COMMITTED',
      ledgerEventId: newDist.ledgerEventId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
