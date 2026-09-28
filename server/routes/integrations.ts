import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { db } from '../db/database';
import { gmailService } from '../services/gmailService';
import { encryptSensitiveData } from '../services/cryptoUtils';

export const integrationsRouter = Router();

// GET /api/integrations/google/start - Initiates Google OAuth 2.0 flow
integrationsRouter.get('/google/start', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/integrations/google/callback';

  if (!clientId || !clientSecret) {
    // If OAuth credentials not yet added in environment, return informative config status
    return res.json({
      configured: false,
      message: 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured in .env for live OAuth.',
      authUrl: null,
    });
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: scopes,
  });

  res.json({ configured: true, authUrl });
});

// GET /api/integrations/google/callback - OAuth 2.0 authorization code exchange
integrationsRouter.get('/google/callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('<h3>Authorization code missing.</h3>');
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/integrations/google/callback';

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      const encrypted = encryptSensitiveData(tokens.refresh_token);

      // Fetch user profile email
      oauth2Client.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userinfo = await oauth2.userinfo.get();

      db.saveOAuthAccount({
        provider: 'google',
        provider_account_id: userinfo.data.email || 'authorized-officer@navy.mil.in',
        encrypted_refresh_token: encrypted,
        scope: tokens.scope || 'https://www.googleapis.com/auth/gmail.send',
      });
    }

    res.send(`
      <html>
        <body style="background: #0B1B3A; color: white; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh;">
          <div style="background: #071329; border: 1px solid #1E2E4E; border-radius: 12px; padding: 32px; text-align: center;">
            <h2 style="color: #10B981; margin: 0 0 12px;">Google OAuth Connected Successfully</h2>
            <p style="color: #94A3B8; font-size: 14px;">Gmail API access has been authorized for NAV-TRAC X.</p>
            <a href="http://localhost:5173/authorization" style="display: inline-block; margin-top: 16px; background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 13px;">Return to NAV-TRAC X</a>
          </div>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('[OAuth Callback Error]:', err);
    res.status(500).send(`<h3>OAuth Exchange Failed: ${err.message}</h3>`);
  }
});

// GET /api/integrations/gmail/status
integrationsRouter.get('/gmail/status', async (_req: Request, res: Response) => {
  try {
    const status = await gmailService.getStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/gmail/test - Sends test verification email
integrationsRouter.post('/gmail/test', async (req: Request, res: Response) => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || 'naval-sec-officer@navy.mil.in';

    const result = await gmailService.dispatchNotification({
      to: recipient,
      subject: 'NAV-TRAC X | Verification Test Notification',
      html: `
        <div style="font-family: sans-serif; background: #0B1B3A; color: white; padding: 20px; border-radius: 8px;">
          <h3 style="color: #38BDF8; margin-top: 0;">NAV-TRAC X Tactical Integration Test</h3>
          <p style="color: #CBD5E1; font-size: 13px;">This email verifies that your Google OAuth / Gmail integration is actively communicating with the Indian Navy Secure Provenance Backend.</p>
          <p style="color: #94A3B8; font-size: 11px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      type: 'TEST_VERIFICATION',
      relatedEntity: 'system',
      relatedEntityId: 'TEST-001',
    });

    res.json({
      success: result.status === 'SENT' || result.status === 'QUEUED',
      result,
      message: result.status === 'QUEUED'
        ? 'EMCON Posture is ACTIVE. Notification queued in local air-gap storage.'
        : `Email dispatched successfully via ${result.provider} (ID: ${result.messageId}).`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/gmail/disconnect
integrationsRouter.post('/gmail/disconnect', (_req: Request, res: Response) => {
  try {
    db.deleteOAuthAccount('google');
    res.json({ success: true, message: 'Google OAuth integration disconnected.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/integrations/gmail/notifications - Notification logs
integrationsRouter.get('/gmail/notifications', (_req: Request, res: Response) => {
  try {
    const logs = db.getEmailNotifications();
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/gmail/flush-queue - Flushes queued notifications
integrationsRouter.post('/gmail/flush-queue', async (_req: Request, res: Response) => {
  try {
    const summary = await gmailService.flushEmconQueue();
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
