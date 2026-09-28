import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { gmailService } from '../services/gmailService';

export const ledgerRouter = Router();

// GET /api/ledger/blocks
ledgerRouter.get('/blocks', (req: Request, res: Response) => {
  try {
    const { searchQuery } = req.query;
    const blocks = db.getLedgerBlocks(searchQuery as string);
    res.json(blocks);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ledger/blocks/:id
ledgerRouter.get('/blocks/:id', (req: Request, res: Response) => {
  try {
    const blockNum = Number(req.params.id);
    const block = db.getLedgerBlocks().find((b) => b.blockNumber === blockNum);
    if (!block) {
      return res.status(404).json({ error: `Ledger block #${req.params.id} not found` });
    }
    res.json(block);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/verify - Cryptographically verifies the Merkle hash chain
ledgerRouter.post('/verify', async (_req: Request, res: Response) => {
  try {
    const result = db.verifyChain();

    // If chain failed, trigger critical alert and Gmail notification
    if (!result.valid && !result.isSuccess) {
      const emailHtml = gmailService.ledgerIntegrityTemplate({
        blockNumber: result.failedBlockNumber || 4188,
        expectedHash: result.expectedHash || '0x11bb001923bc9910aa112349bc981244dff98012',
        actualHash: result.actualHash || '0xDEADBEEF9910aa112349bc981244dff98012TAMPER',
      });

      await gmailService.dispatchNotification({
        to: 'cyberwarfare-ops@navy.mil.in',
        subject: `CRITICAL — LEDGER INTEGRITY FAILURE (Block #${result.failedBlockNumber || 4188})`,
        html: emailHtml,
        type: 'LEDGER_INTEGRITY_FAILURE',
        relatedEntity: 'ledger_block',
        relatedEntityId: String(result.failedBlockNumber || 4188),
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/tamper-demo and /tamper-simulate
const handleTamper = (_req: Request, res: Response) => {
  try {
    const result = db.simulateTamper();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

ledgerRouter.post('/tamper-demo', handleTamper);
ledgerRouter.post('/tamper-simulate', handleTamper);

// POST /api/ledger/reset-demo
ledgerRouter.post('/reset-demo', (_req: Request, res: Response) => {
  try {
    const result = db.resetDemo();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ledger/disconnected-units
ledgerRouter.get('/disconnected-units', (_req: Request, res: Response) => {
  try {
    const units = db.getDisconnectedUnits();
    res.json(units);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/reconcile
ledgerRouter.post('/reconcile', (req: Request, res: Response) => {
  try {
    const { unitId } = req.body;
    const result = db.reconcileUnit(unitId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ledger/export
ledgerRouter.post('/export', (req: Request, res: Response) => {
  try {
    const { startBlock = 4188, endBlock = 4192 } = req.body;
    const blocks = db.getLedgerBlocks().filter((b) => b.blockNumber >= startBlock && b.blockNumber <= endBlock);

    const segmentData = {
      title: 'NAV-TRAC X - Immutable Merkle Ledger Segment Evidence Package',
      exportedAt: new Date().toISOString(),
      validatingAuthority: 'Indian Naval PKI Root CA-01',
      blockRange: `${startBlock} to ${endBlock}`,
      pqcAlgorithm: 'ML-DSA-65 / NIST FIPS 204 Validated',
      blocks,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=NAVTRAC_Ledger_Blocks_${startBlock}_${endBlock}_${Date.now()}.json`
    );
    res.json(segmentData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
