# NAV-TRAC X — Secure Provenance & Forensic Architecture API Reference
Indian Navy Classified Information Security Protocol

## 1. System Overview & Architecture

NAV-TRAC X provides zero-trust document encapsulation, post-quantum cryptography (ML-KEM-768 / ML-DSA-65), steganographic forensic watermarking, Merkle ledger provenance tracing, and Google OAuth 2.0 / Gmail security bulletin integration.

All endpoints adhere to JSON REST conventions under `/api/*` and support offline EMCON air-gap queuing.

---

## 2. Authentication & Authorization

### Google OAuth 2.0 Flow
NAV-TRAC X utilizes least-privilege Google OAuth 2.0 (`gmail.send`, `gmail.readonly`, `userinfo.email`) to authenticate and dispatch operational security bulletins.

- `GET /api/integrations/google/start`
  - Initiates the OAuth 2.0 authorization code flow with offline access.
  - Redirects or returns `{ authUrl: string, mode: 'oauth2' }`.
- `GET /api/integrations/google/callback?code=...`
  - Exchanges the authorization code for encrypted tokens stored in database `oauth_accounts`.
  - Tokens are encrypted at rest using AES-256-GCM (`ENCRYPTION_KEY`). Client secrets are never returned to the frontend.

---

## 3. Documents Registry

### `GET /api/documents`
Retrieves classified documents with pagination, classification filters, and keyword search.
- **Query Parameters**: `classification`, `status`, `searchQuery`, `page`, `pageSize`
- **Response**: `{ documents: DocumentItem[], totalCount: number, page: number, pageSize: number, totalPages: number }`

### `GET /api/documents/stats`
Returns live calculated registry statistics:
- `totalDocuments`
- `activeDistributions`
- `metadataSanitizedPercentage`
- `externalLeakAlerts`

### `POST /api/documents/upload`
Multipart upload endpoint for military operational dossiers. Extracts SHA3-256 digests, sanitizes EXIF/metadata, creates version `v1.0`, commits audit logs, and stores file securely.

### `GET /api/documents/:id/versions`
Retrieves all cryptographic versions, author signatures, and linked decryption events for the specified document ID.

---

## 4. Recipients & Key Management

### `GET /api/recipients`
Retrieves the authorized naval personnel directory, including rank, service number (PNo), unit/vessel, active hardware token fingerprint, and clearance status.

### `GET /api/recipients/stats`
Returns total recipients, active cryptographic keys, distributed documents count, and active hardware security modules.

### `POST /api/recipients/:id/revoke`
Revokes an officer's access keys, invalidates session keys across naval nodes, and triggers an automated Gmail revocation bulletin.
- **Body**: `{ reason: string, revokedBy: string }`

---

## 5. Authorization & Clearance Policies

### `GET /api/authorization/policies`
Returns list of active clearance policies, scope types, classification thresholds, and dual-custody rules.

### `POST /api/authorization/policies`
Registers a new clearance rule and creates audit log.

### `GET /api/authorization/requests`
Returns pending and historical clearance requests awaiting command decision.

### `POST /api/authorization/requests`
Submits an access request and triggers an immediate Gmail alert to approvers.

### `POST /api/authorization/requests/:id/approve`
Approves clearance request, activates session key pair, and dispatches approval confirmation email.

### `POST /api/authorization/requests/:id/deny`
Denies access request, logs security event to Access Denied ledger, and notifies requester.

---

## 6. Distribution & Decryption

### `POST /api/distributions`
Transactional distribution workflow:
1. Validates document classification and recipient clearances.
2. Derives session keys using ML-KEM-768 encapsulation.
3. Generates recipient-specific steganographic micro-dots.
4. Generates decryption records and provenance capsules.
5. Commits event leaf into an immutable Merkle Ledger block.
6. Emits audit trail and dispatches recipient notifications.

### `POST /api/decryption`
Simulates or logs client-side hardware decryption, generating a cryptographic `ProvenanceCapsule`.

---

## 7. Provenance Capsules & Cryptography

### `GET /api/provenance/:id`
Retrieves full provenance capsule including `capsuleId`, `documentHash`, `watermarkId`, `signatureAlgorithm`, `sessionId`, and Merkle leaf verification path.

### `POST /api/provenance/:id/verify`
Performs cryptographic verification of the digital signature and Merkle inclusion proof.

---

## 8. Immutable Merkle Ledger & Tamper Detection

### `GET /api/ledger/blocks`
Retrieves chained Merkle ledger blocks with hash pointers, validating nodes, and event leaves.

### `POST /api/ledger/verify`
Traverses the blockchain from genesis to head block, recalculating SHA-256 block digests deterministically.
- Returns `{ valid: true, totalBlocksVerified: number }` on success.
- Returns `{ valid: false, failedBlockNumber: number, expectedHash: string, actualHash: string, reason: string }` on failure, and automatically fires a critical Gmail alert to naval cyber command.

### `POST /api/ledger/tamper-demo`
Simulates deliberate forensic tampering on Block #4188 to demonstrate tamper-evidence in military inspection drills.

### `POST /api/ledger/reset-demo`
Restores the ledger to a clean, validated cryptographic state.

---

## 9. Forensic Investigations & Leak Analysis

### `GET /api/investigations`
Returns active forensic leak cases, matched artifacts, and convergence scores.

### `POST /api/artifacts`
Uploads leaked screenshots, photographic scans, or extracted pages for forensic comparison.

### `POST /api/artifacts/:id/analyze`
Executes forensic convergence analysis across 8 independent checks:
1. `watermarkMatch`
2. `fingerprintMatch`
3. `documentHashMatch`
4. `versionMatch`
5. `recipientMatch`
6. `signatureValid`
7. `ledgerValid`
8. `provenanceValid`

Derives one of 5 Attribution States:
- `PROVENANCE VERIFIED`
- `UNRESOLVED`
- `CONTRADICTORY EVIDENCE`
- `MANIPULATION SUSPECTED`
- `NO MATCH`

### `POST /api/investigations/:id/notify-security`
Dispatches standardized forensic security bulletin to designated security authorities via Gmail integration.

---

## 10. Gmail Integration & Security Triggers

### `GET /api/integrations/gmail/status`
Returns live integration health:
- `connected`: boolean
- `account`: string
- `scopes`: string[]
- `lastSuccessfulRequest`: ISO date
- `queuedNotificationsCount`: number (EMCON buffer)
- `mode`: `'oauth2'` or `'simulated'`

### `POST /api/integrations/gmail/test`
Dispatches a live verification test email through Google Workspace / Gmail API.

### `POST /api/integrations/gmail/disconnect`
Disconnects active OAuth account and removes session tokens.

### `GET /api/integrations/gmail/notifications`
Retrieves log of all security dispatches, recipient addresses, provider message IDs, delivery statuses, and timestamps.

### `POST /api/integrations/gmail/flush-queue`
Flushes any notifications queued during EMCON silent posture once normal comms are restored.

---

## 11. EMCON (Emission Control & Air-Gap Mode)

### `GET /api/emcon/status`
Returns current emission control posture (`NORMAL`, `BRAVO`, `ALPHA`), vessel connectivity, and offline buffer count.

### `POST /api/emcon/posture`
Changes fleet posture:
- `ALPHA` (Silent): All external RF & satellite uplinks severed. Outgoing Gmail notifications are automatically placed in `notification_queue`.
- `BRAVO` (Restricted): Priority operational traffic only.
- `NORMAL`: Full connectivity. Automatically flushes and transmits pending `notification_queue` items.

### `POST /api/emcon/reconcile`
Ingests offline vessel packages, verifies air-gap optical signatures, and appends new reconciled blocks to the ledger.

---

## 12. Security & Environment Specifications

- **Server-side Secrets Only**: Client IDs, client secrets, API keys, and session secrets are stored strictly on the backend (`.env`).
- **Git Hygiene**: Real `.env` files are ignored by git; `.env.example` provides template configurations.
- **Least Privilege Scopes**: Access is restricted to `gmail.send` and `gmail.readonly`.
