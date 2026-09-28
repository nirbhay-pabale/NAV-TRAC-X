import { google } from 'googleapis';
import { db } from '../db/database';
import { decryptSensitiveData } from './cryptoUtils';

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
  type?: string;
}

export interface SendEmailResult {
  messageId: string;
  status: 'SENT' | 'QUEUED' | 'ERROR';
  error?: string;
  provider: 'GMAIL_API' | 'MOCK_PROVIDER';
  timestamp: string;
}

export interface GmailProvider {
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
  getProfile(): Promise<{ email: string; messagesTotal?: number }>;
  isConfigured(): boolean;
}

/**
 * Real Gmail API Provider using official googleapis library and OAuth 2.0
 */
export class RealGmailProvider implements GmailProvider {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/integrations/google/callback';
  }

  isConfigured(): boolean {
    const oauthAccount = db.getOAuthAccount('google');
    return Boolean(this.clientId && this.clientSecret && oauthAccount?.encrypted_refresh_token);
  }

  private getOAuth2Client() {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    const oauthAccount = db.getOAuthAccount('google');
    if (oauthAccount?.encrypted_refresh_token) {
      try {
        const refreshToken = decryptSensitiveData(oauthAccount.encrypted_refresh_token);
        oauth2Client.setCredentials({
          refresh_token: refreshToken,
          scope: oauthAccount.scope,
        });
      } catch (err) {
        console.error('[GmailService] Failed to decrypt refresh token:', err);
      }
    }

    return oauth2Client;
  }

  async getProfile(): Promise<{ email: string; messagesTotal?: number }> {
    const auth = this.getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    return {
      email: profile.data.emailAddress || 'authorized-navy-officer@navy.mil.in',
      messagesTotal: profile.data.messagesTotal || 0,
    };
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const auth = this.getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    // Format RFC 2822 email message
    const utf8Subject = `=?utf-8?B?${Buffer.from(options.subject).toString('base64')}?=`;
    const messageParts = [
      `To: ${options.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      options.html,
    ];
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      messageId: res.data.id || `GMAIL-${Date.now()}`,
      status: 'SENT',
      provider: 'GMAIL_API',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Mock Gmail Provider for automated test suites and initial development
 */
export class MockGmailProvider implements GmailProvider {
  isConfigured(): boolean {
    return true;
  }

  async getProfile(): Promise<{ email: string; messagesTotal?: number }> {
    const oauthAccount = db.getOAuthAccount('google');
    return {
      email: oauthAccount?.provider_account_id || 'naval-intel-ops@navy.mil.in',
      messagesTotal: 142,
    };
  }

  async sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
    const messageId = `MOCK-GMAIL-MSG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    console.log(`[MockGmailProvider] Simulating email delivery to ${options.to} | Subject: "${options.subject}" (MsgID: ${messageId})`);
    
    return {
      messageId,
      status: 'SENT',
      provider: 'MOCK_PROVIDER',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Main Notification & Gmail Integration Service
 */
class GmailService {
  private realProvider = new RealGmailProvider();
  private mockProvider = new MockGmailProvider();

  public getActiveProvider(): GmailProvider {
    return this.realProvider.isConfigured() ? this.realProvider : this.mockProvider;
  }

  public isOAuthConnected(): boolean {
    const account = db.getOAuthAccount('google');
    return Boolean(account && account.encrypted_refresh_token);
  }

  public async getStatus() {
    const account = db.getOAuthAccount('google');
    const isEmconActive = db.isEmconActive();
    const pendingQueue = db.getNotificationQueue().filter((q) => q.status === 'QUEUED');

    let profileEmail: string | null = null;
    let providerError: string | null = null;

    if (this.isOAuthConnected()) {
      try {
        const profile = await this.getActiveProvider().getProfile();
        profileEmail = profile.email;
      } catch (err: any) {
        providerError = err.message || 'Failed to authenticate with Google API';
      }
    }

    const lastNotification = db.getEmailNotifications()[0];

    return {
      connected: this.isOAuthConnected(),
      account: profileEmail || account?.provider_account_id || null,
      scopes: account?.scope?.split(' ') || [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly',
      ],
      lastSuccessfulRequest: account?.updated_at || lastNotification?.sentAt || null,
      lastEmailSent: lastNotification?.sentAt || null,
      lastError: providerError,
      emconActive: isEmconActive,
      queuedNotificationsCount: pendingQueue.length,
      mode: this.realProvider.isConfigured() ? 'GMAIL_OAUTH_LIVE' : 'SIMULATED_INTEGRATION',
    };
  }

  /**
   * Sends an email, respecting EMCON air-gap posture by queuing if EMCON is active.
   */
  public async dispatchNotification(options: SendEmailOptions): Promise<SendEmailResult> {
    const isEmconActive = db.isEmconActive();

    // EMCON Air-gap condition: queue locally
    if (isEmconActive) {
      const queueItem = db.queueNotification({
        type: options.type || 'SYSTEM_NOTIFICATION',
        recipientEmail: options.to,
        subject: options.subject,
        html: options.html,
        relatedEntity: options.relatedEntity,
        relatedEntityId: options.relatedEntityId,
      });

      // Record in email notifications table as QUEUED
      db.recordEmailNotification({
        id: `EMAIL-Q-${Date.now()}`,
        type: options.type || 'EMCON_QUEUED',
        recipientEmail: options.to,
        subject: options.subject,
        relatedEntity: options.relatedEntity || 'EMCON_QUEUE',
        relatedEntityId: options.relatedEntityId || queueItem.id,
        status: 'QUEUED',
        providerMessageId: queueItem.id,
        error: 'EMCON Active: Transmission deferred to preserve acoustic & RF silence',
        sentAt: new Date().toISOString(),
      });

      return {
        messageId: queueItem.id,
        status: 'QUEUED',
        provider: 'MOCK_PROVIDER',
        timestamp: new Date().toISOString(),
      };
    }

    // Normal operations: send via active provider
    try {
      const result = await this.getActiveProvider().sendEmail(options);

      // Record successful dispatch
      db.recordEmailNotification({
        id: `EMAIL-${Date.now()}`,
        type: options.type || 'GENERAL_NOTIFICATION',
        recipientEmail: options.to,
        subject: options.subject,
        relatedEntity: options.relatedEntity || 'SYSTEM',
        relatedEntityId: options.relatedEntityId || '',
        status: 'SENT',
        providerMessageId: result.messageId,
        sentAt: result.timestamp,
      });

      return result;
    } catch (err: any) {
      console.error('[GmailService] Failed to send email:', err);

      db.recordEmailNotification({
        id: `EMAIL-ERR-${Date.now()}`,
        type: options.type || 'GENERAL_NOTIFICATION',
        recipientEmail: options.to,
        subject: options.subject,
        relatedEntity: options.relatedEntity || 'SYSTEM',
        relatedEntityId: options.relatedEntityId || '',
        status: 'FAILED',
        providerMessageId: '',
        error: err.message || 'Transmission error',
        sentAt: new Date().toISOString(),
      });

      return {
        messageId: '',
        status: 'ERROR',
        error: err.message,
        provider: 'GMAIL_API',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Flushes and delivers any queued notifications once EMCON posture is deactivated.
   */
  public async flushEmconQueue(): Promise<{ deliveredCount: number; failedCount: number }> {
    const queue = db.getNotificationQueue().filter((q) => q.status === 'QUEUED');
    let deliveredCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      try {
        const result = await this.getActiveProvider().sendEmail({
          to: item.recipientEmail,
          subject: item.subject,
          html: item.html,
          relatedEntity: item.relatedEntity,
          relatedEntityId: item.relatedEntityId,
        });

        db.markQueueItemSent(item.id, result.messageId);
        deliveredCount++;
      } catch (err: any) {
        db.markQueueItemFailed(item.id, err.message);
        failedCount++;
      }
    }

    return { deliveredCount, failedCount };
  }

  // --- HTML EMAIL TEMPLATES ---

  public securityAlertTemplate(data: {
    documentName: string;
    documentId: string;
    matchedRecipient: string;
    investigationId: string;
    confidenceScore: number;
    severity?: string;
    timestamp?: string;
  }): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1B3A; color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #1E2E4E;">
        <div style="background-color: #071329; padding: 20px; border-bottom: 2px solid #EF4444; display: flex; align-items: center; justify-content: space-between;">
          <h2 style="margin: 0; font-size: 18px; color: #EF4444; letter-spacing: 1px; font-weight: 800;">
            ⚠️ NAV-TRAC X | SECURITY ALERT: POTENTIAL DOCUMENT LEAK
          </h2>
        </div>
        <div style="padding: 24px; background-color: #0B1B3A;">
          <p style="font-size: 14px; color: #94A3B8; margin-top: 0;">
            A cryptographic steganographic anomaly has been intercepted and analyzed by the NAV-TRAC X Forensic Engine.
          </p>
          <div style="background-color: #071329; border: 1px solid #1E2E4E; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">SEVERITY:</td>
                <td style="color: #EF4444; font-weight: 700;">${data.severity || 'CRITICAL'}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">DOCUMENT:</td>
                <td style="color: #F8FAFC; font-weight: 600;">${data.documentName} (${data.documentId})</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">MATCHED RECIPIENT:</td>
                <td style="color: #38BDF8; font-weight: 600;">${data.matchedRecipient}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">INVESTIGATION ID:</td>
                <td style="color: #F2B134; font-family: monospace;">${data.investigationId}</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">CONFIDENCE:</td>
                <td style="color: #10B981; font-weight: 700;">${data.confidenceScore}% MATCH</td>
              </tr>
              <tr>
                <td style="color: #64748B; padding: 6px 0; font-weight: 600;">TIMESTAMP:</td>
                <td style="color: #CBD5E1;">${data.timestamp || new Date().toUTCString()}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 12px; color: #64748B; margin-bottom: 0;">
            Classified Indian Navy Operational Intel. Handled under Post-Quantum Cryptographic Protocol ML-DSA-65.
          </p>
        </div>
      </div>
    `;
  }

  public ledgerIntegrityTemplate(data: {
    blockNumber: number;
    expectedHash: string;
    actualHash: string;
    tamperedAt?: string;
  }): string {
    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; background-color: #071329; color: #FFFFFF; border-radius: 12px; border: 1px solid #EF4444; padding: 24px;">
        <h2 style="color: #EF4444; margin-top: 0; font-size: 18px; font-weight: 800;">
          🚨 CRITICAL: LEDGER INTEGRITY FAILURE
        </h2>
        <p style="font-size: 13px; color: #CBD5E1;">
          NAV-TRAC X local Merkle hash-chain verification detected historical cryptographic tampering at Block #${data.blockNumber}.
        </p>
        <div style="background-color: #0B1B3A; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; margin: 16px 0;">
          <p style="color: #64748B; margin: 4px 0;">Expected Root Hash:</p>
          <p style="color: #10B981; word-break: break-all; margin: 4px 0 12px;">${data.expectedHash}</p>
          <p style="color: #64748B; margin: 4px 0;">Observed Root Hash:</p>
          <p style="color: #EF4444; word-break: break-all; margin: 4px 0;">${data.actualHash}</p>
        </div>
        <p style="font-size: 12px; color: #94A3B8;">Immediate root authority audit required.</p>
      </div>
    `;
  }

  public authorizationTemplate(data: {
    requestId: string;
    documentRef: string;
    officerName: string;
    rank: string;
    unit: string;
    status: 'REQUESTED' | 'APPROVED' | 'DENIED';
    approverName?: string;
    note?: string;
  }): string {
    const isApproved = data.status === 'APPROVED';
    const isDenied = data.status === 'DENIED';
    const accentColor = isApproved ? '#10B981' : isDenied ? '#EF4444' : '#38BDF8';

    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1B3A; color: #FFFFFF; border-radius: 12px; border: 1px solid #1E2E4E; padding: 24px;">
        <h2 style="color: ${accentColor}; margin-top: 0; font-size: 17px;">
          ACCESS AUTHORIZATION ${data.status} — ${data.documentRef}
        </h2>
        <p style="font-size: 13px; color: #94A3B8;">
          Clearance event processed for ${data.rank} ${data.officerName} (${data.unit}).
        </p>
        <div style="background-color: #071329; border-radius: 8px; padding: 14px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Request ID:</strong> ${data.requestId}</p>
          <p style="margin: 4px 0;"><strong>Document:</strong> ${data.documentRef}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${accentColor}; font-weight: bold;">${data.status}</span></p>
          ${data.approverName ? `<p style="margin: 4px 0;"><strong>Decision By:</strong> ${data.approverName}</p>` : ''}
          ${data.note ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${data.note}</p>` : ''}
        </div>
      </div>
    `;
  }

  public revocationTemplate(data: {
    recipientId: string;
    recipientName: string;
    rank: string;
    unit: string;
    reason: string;
    revokedBy: string;
  }): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #071329; color: #FFFFFF; border-radius: 12px; border: 1px solid #EF4444; padding: 24px;">
        <h2 style="color: #EF4444; margin-top: 0; font-size: 17px;">
          🔒 RECIPIENT ACCESS REVOKED — ${data.rank} ${data.recipientName}
        </h2>
        <p style="font-size: 13px; color: #CBD5E1;">
          Cryptographic keys and provenance access have been revoked for ${data.recipientId} (${data.unit}).
        </p>
        <div style="background-color: #0B1B3A; border-radius: 8px; padding: 14px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Reason:</strong> ${data.reason}</p>
          <p style="margin: 4px 0;"><strong>Authorized By:</strong> ${data.revokedBy}</p>
          <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toUTCString()}</p>
        </div>
      </div>
    `;
  }

  public investigationTemplate(data: {
    investigationId: string;
    title: string;
    documentId: string;
    attributionStatus: string;
    confidenceScore: number;
    investigator: string;
  }): string {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1B3A; color: #FFFFFF; border-radius: 12px; border: 1px solid #1E2E4E; padding: 24px;">
        <h2 style="color: #38BDF8; margin-top: 0; font-size: 17px;">
          📄 INVESTIGATION REPORT AVAILABLE — ${data.investigationId}
        </h2>
        <p style="font-size: 13px; color: #94A3B8;">
          Forensic dossier ${data.title} has completed evidence convergence.
        </p>
        <div style="background-color: #071329; border-radius: 8px; padding: 14px; font-size: 13px;">
          <p style="margin: 4px 0;"><strong>Attribution Status:</strong> <span style="color: #10B981; font-weight: bold;">${data.attributionStatus}</span></p>
          <p style="margin: 4px 0;"><strong>Document:</strong> ${data.documentId}</p>
          <p style="margin: 4px 0;"><strong>Confidence:</strong> ${data.confidenceScore}%</p>
          <p style="margin: 4px 0;"><strong>Lead Investigator:</strong> ${data.investigator}</p>
        </div>
      </div>
    `;
  }
}

export const gmailService = new GmailService();
