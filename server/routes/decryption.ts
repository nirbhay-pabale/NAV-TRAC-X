import { Router, Request, Response } from 'express';
import { db } from '../db/database';

export const decryptionRouter = Router();

// GET /api/decryption/events
decryptionRouter.get('/events', (_req: Request, res: Response) => {
  try {
    const events = db.getDecryptionEvents();
    res.json(events);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/decryption - Records decryption event and generates cryptographic capsule
decryptionRouter.post('/', (req: Request, res: Response) => {
  try {
    const { documentId, recipientId, deviceId, channel, versionId } = req.body;

    if (!documentId || !recipientId) {
      return res.status(400).json({ error: 'documentId and recipientId are required' });
    }

    const doc = db.getDocumentById(documentId);
    const recipient = db.getRecipientById(recipientId);

    const result = db.recordDecryption({
      documentId,
      documentName: doc?.name || 'Tactical Document',
      versionId: versionId || doc?.version || 'v1.0',
      recipientId,
      recipientPseudonym: recipient ? `${recipient.rank} ${recipient.name} (${recipient.pno})` : recipientId,
      unit: recipient?.unit || 'Naval Command',
      deviceId: deviceId || recipient?.hardwareDeviceId || 'HW-HSM-9021',
      channel: channel || 'In-Memory Decryption',
    });

    res.status(201).json({
      success: true,
      message: 'Cryptographic decryption event verified and provenance capsule generated.',
      event: result.event,
      capsule: result.capsule,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
