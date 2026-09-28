import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { gmailService } from '../services/gmailService';

export const recipientsRouter = Router();

// GET /api/recipients
recipientsRouter.get('/', (_req: Request, res: Response) => {
  try {
    const recipients = db.getRecipients();
    res.json(recipients);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipients/stats
recipientsRouter.get('/stats', (_req: Request, res: Response) => {
  try {
    const recipients = db.getRecipients();
    const total = recipients.length;
    const activeKeys = recipients.reduce((acc, r) => acc + (r.activeKeys || 0), 0);
    const totalDocs = recipients.reduce((acc, r) => acc + (r.documentsReceived || 0), 0);

    res.json({
      totalRecipients: total,
      activeCryptographicKeys: activeKeys,
      totalDocumentsDistributed: totalDocs,
      hardwareSecurityModules: 14,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipients/:id
recipientsRouter.get('/:id', (req: Request, res: Response) => {
  try {
    const recipient = db.getRecipientById(req.params.id);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json(recipient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipients
recipientsRouter.post('/', (req: Request, res: Response) => {
  try {
    const newRecipient = db.createRecipient(req.body);
    res.status(201).json(newRecipient);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/recipients/:id
recipientsRouter.patch('/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updateRecipient(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Recipient not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/recipients/:id/revoke - Revokes recipient keys & sends security notification
recipientsRouter.post('/:id/revoke', async (req: Request, res: Response) => {
  try {
    const { reason, revokedBy } = req.body;
    const recipient = db.revokeRecipient(req.params.id, reason);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Trigger Gmail revocation notification
    const emailHtml = gmailService.revocationTemplate({
      recipientId: recipient.id,
      recipientName: recipient.name,
      rank: recipient.rank,
      unit: recipient.unit,
      reason: reason || 'Immediate operational revocation',
      revokedBy: revokedBy || 'Fleet Security Officer',
    });

    const emailResult = await gmailService.dispatchNotification({
      to: recipient.email || 'cyberwarfare-ops@navy.mil.in',
      subject: `RECIPIENT ACCESS REVOKED — ${recipient.rank} ${recipient.name}`,
      html: emailHtml,
      type: 'RECIPIENT_REVOKED',
      relatedEntity: 'recipient',
      relatedEntityId: recipient.id,
    });

    res.json({
      success: true,
      recipient,
      notification: emailResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
