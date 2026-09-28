import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { gmailService } from '../services/gmailService';

export const authorizationRouter = Router();

// GET /api/authorization/policies
authorizationRouter.get('/policies', (_req: Request, res: Response) => {
  try {
    const policies = db.getPolicies();
    res.json(policies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authorization/policies
authorizationRouter.post('/policies', (req: Request, res: Response) => {
  try {
    const newPolicy = db.createPolicy(req.body);
    res.status(201).json(newPolicy);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/authorization/policies/:id
authorizationRouter.patch('/policies/:id', (req: Request, res: Response) => {
  try {
    const updated = db.updatePolicy(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Policy not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/authorization/requests
authorizationRouter.get('/requests', (_req: Request, res: Response) => {
  try {
    const requests = db.getAccessRequests();
    res.json(requests);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authorization/requests - Creates request & sends Gmail notification to approvers
authorizationRouter.post('/requests', async (req: Request, res: Response) => {
  try {
    const newReq = db.createAccessRequest(req.body);

    // Send Gmail notification to approvers
    const emailHtml = gmailService.authorizationTemplate({
      requestId: newReq.id,
      documentRef: newReq.documentName || newReq.documentId,
      officerName: newReq.requesterName,
      rank: newReq.requesterRank,
      unit: newReq.requesterUnit,
      status: 'REQUESTED',
      note: newReq.reasonGiven,
    });

    await gmailService.dispatchNotification({
      to: 'fleet-approvals@navy.mil.in',
      subject: `ACCESS AUTHORIZATION REQUEST — ${newReq.documentName} (${newReq.id})`,
      html: emailHtml,
      type: 'AUTHORIZATION_REQUEST',
      relatedEntity: 'access_request',
      relatedEntityId: newReq.id,
    });

    res.status(201).json(newReq);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authorization/requests/:id/approve - Approves & notifies requester
authorizationRouter.post('/requests/:id/approve', async (req: Request, res: Response) => {
  try {
    const { approverName, note } = req.body;
    const updated = db.approveAccessRequest(req.params.id, approverName || 'Capt. R. Deshmukh', note);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Send Gmail notification
    const emailHtml = gmailService.authorizationTemplate({
      requestId: updated.id,
      documentRef: updated.documentName || updated.documentId,
      officerName: updated.requesterName,
      rank: updated.requesterRank,
      unit: updated.requesterUnit,
      status: 'APPROVED',
      approverName: updated.decidedBy,
      note: updated.decisionNote,
    });

    const notifResult = await gmailService.dispatchNotification({
      to: 'requester-clearance@navy.mil.in',
      subject: `ACCESS REQUEST APPROVED — ${updated.documentName} (${updated.id})`,
      html: emailHtml,
      type: 'AUTHORIZATION_APPROVED',
      relatedEntity: 'access_request',
      relatedEntityId: updated.id,
    });

    res.json({
      request: updated,
      notification: notifResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authorization/requests/:id/deny - Denies & notifies requester
authorizationRouter.post('/requests/:id/deny', async (req: Request, res: Response) => {
  try {
    const { denierName, reason } = req.body;
    const updated = db.denyAccessRequest(req.params.id, denierName || 'Capt. R. Deshmukh', reason);
    if (!updated) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Send Gmail notification
    const emailHtml = gmailService.authorizationTemplate({
      requestId: updated.id,
      documentRef: updated.documentName || updated.documentId,
      officerName: updated.requesterName,
      rank: updated.requesterRank,
      unit: updated.requesterUnit,
      status: 'DENIED',
      approverName: updated.decidedBy,
      note: updated.decisionNote,
    });

    const notifResult = await gmailService.dispatchNotification({
      to: 'requester-clearance@navy.mil.in',
      subject: `ACCESS REQUEST DENIED — ${updated.documentName} (${updated.id})`,
      html: emailHtml,
      type: 'AUTHORIZATION_DENIED',
      relatedEntity: 'access_request',
      relatedEntityId: updated.id,
    });

    res.json({
      request: updated,
      notification: notifResult,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/authorization/denied-log
authorizationRouter.get('/denied-log', (req: Request, res: Response) => {
  try {
    const { reason, documentId } = req.query;
    const logs = db.getAccessDeniedLogs({
      reason: reason as string,
      documentId: documentId as string,
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/authorization/alert-rules
authorizationRouter.get('/alert-rules', (_req: Request, res: Response) => {
  try {
    const rules = db.getAlertRules();
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/authorization/alert-rules
authorizationRouter.post('/alert-rules', (req: Request, res: Response) => {
  try {
    const rules = db.updateAlertRules(req.body);
    res.json(rules);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
