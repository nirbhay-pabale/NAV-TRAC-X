import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { documentsRouter } from './routes/documents';
import { ledgerRouter } from './routes/ledger';
import { authorizationRouter } from './routes/authorization';
import { recipientsRouter } from './routes/recipients';
import { distributionRouter } from './routes/distribution';
import { decryptionRouter } from './routes/decryption';
import { provenanceRouter } from './routes/provenance';
import { fingerprintsRouter } from './routes/fingerprints';
import { investigationsRouter } from './routes/investigations';
import { artifactsRouter } from './routes/artifacts';
import { alertsRouter } from './routes/alerts';
import { emconRouter } from './routes/emcon';
import { activityRouter } from './routes/activity';
import { reportsRouter } from './routes/reports';
import { dashboardRouter } from './routes/dashboard';
import { integrationsRouter } from './routes/integrations';
import { db } from './db/database';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logger for local security telemetry (sanitizes sensitive tokens)
app.use((req, _res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[NAV-TRAC-X BACKEND] ${timestamp} | ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  const stats = db.getDashboardStats();
  res.json({
    status: 'ONLINE',
    system: 'NAV-TRAC X Naval Tactical Backend',
    pqcValidationEngine: 'ML-DSA-65 NIST FIPS 204 Active',
    airGappedMode: db.isEmconActive(),
    timestamp: new Date().toISOString(),
    systemHealth: stats.systemHealth,
  });
});

// Database Seed endpoint
app.post('/api/db/seed', (_req, res) => {
  db.resetToSeed();
  res.json({
    success: true,
    message: 'Tactical database reset to initial seed data',
    stats: db.getDashboardStats(),
  });
});

// Mount Subsystem API Routes
app.use('/api/documents', documentsRouter);
app.use('/api/ledger', ledgerRouter);
app.use('/api/authorization', authorizationRouter);
app.use('/api/recipients', recipientsRouter);
app.use('/api/distributions', distributionRouter);
app.use('/api/decryption', decryptionRouter);
app.use('/api/provenance', provenanceRouter);
app.use('/api/fingerprints', fingerprintsRouter);
app.use('/api/investigations', investigationsRouter);
app.use('/api/artifacts', artifactsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/emcon', emconRouter);
app.use('/api/activity', activityRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/integrations', integrationsRouter);

// Global Search alias
app.get('/api/search', (req, res) => {
  const query = req.query.q as string;
  res.json(db.globalSearch(query || ''));
});

// Global Audit alias
app.get('/api/audit', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json(db.getAuditEvents(limit));
});

// Centralized Backend Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[NAV-TRAC-X ERROR]:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Tactical Server Error',
    code: err.code || 'TACTICAL_FAULT',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 NAV-TRAC X Tactical Backend Server is listening on port ${PORT}`);
  console.log(`🔒 Zero-Trust Cryptographic Engine & Local Database: READY`);
  console.log(`📡 Local API Endpoints mounted at http://localhost:${PORT}/api/*`);
  console.log(`✉️ Gmail Integration & Event Notification Engine: READY`);
  console.log('================================================================');
});

// Keep process alive
setInterval(() => {}, 60000);
