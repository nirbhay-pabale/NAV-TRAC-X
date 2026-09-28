export type ClassificationLevel =
  | 'TOP SECRET (CODEWORD)'
  | 'TOP SECRET'
  | 'SECRET'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'
  | 'UNCLASSIFIED';

export type DocumentStatus = 'Draft' | 'Approved' | 'Encrypted' | 'Distributed' | 'Revoked' | 'Archived';

export type AccessType = 'View Only' | 'Full Access' | 'Download' | 'Print';

export type ClearanceLevel =
  | 'Level 4 (Top Secret Codeword)'
  | 'Level 3 (Secret)'
  | 'Level 2 (Confidential)'
  | 'Level 1 (Restricted)';

export interface DocumentVersion {
  versionId: string;
  documentId: string;
  version: string;
  fileHash: string; // SHA3-256 / SHA-256
  author: string;
  changeNotes: string;
  releasedAt: string;
  isLeakedMatch?: boolean;
  linkedDecryptionEvents: {
    eventId: string;
    recipientName: string;
    decryptedAt: string;
    matchedLeakArtifact: boolean;
  }[];
}

export interface DocumentRecord {
  id: string; // e.g. NAV-DOC-2026-0042
  name: string;
  masterDocId: string;
  version: string;
  classification: ClassificationLevel;
  documentType: string;
  sizeBytes: number;
  status: DocumentStatus;
  sha3Hash: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
  metadataSanitized: boolean;
  watermarkCoveragePct: number;
  tags: string[];
  securityCaveats: string;
  encryptionKeyId?: string;
  pqcEncapsulationStatus?: 'ML-KEM-768 Encapsulated (Local Demo)' | 'Pending';
  versions?: DocumentVersion[];
}

export interface Recipient {
  id: string; // e.g. REC-01
  name: string;
  rank: string;
  pno: string; // Personnel Number e.g. 04821-K
  unit: string;
  email: string;
  clearanceLevel: ClearanceLevel;
  activeKeys: number;
  documentsReceived: number;
  lastActive: string;
  status: 'Active' | 'Revoked' | 'Suspended';
  hardwareDeviceId: string;
  pkiCertificateFingerprint: string;
  publicKeyMLKEM: string;
  publicKeyMLDSA: string;
  revocationReason?: string;
  revokedAt?: string;
}

export interface AuthorizationPolicy {
  id: string;
  name: string;
  description: string;
  scopeType: 'ROLE' | 'UNIT' | 'CLASSIFICATION' | 'CLEARANCE';
  appliesTo: string;
  classificationScope: ClassificationLevel;
  allowedAccessTypes: AccessType[];
  expiryRule: string;
  activeRecipientsCount: number;
  status: 'Active' | 'Deprecated';
  createdAt: string;
  updatedAt: string;
  requiresDualCustody: boolean;
  deviceRestrictions: string;
}

export interface AuthorizationRequest {
  id: string;
  requesterName: string;
  requesterRank: string;
  requesterPno: string;
  requesterUnit: string;
  documentId: string;
  documentName: string;
  documentClassification: ClassificationLevel;
  reasonGiven: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Denied';
  requiredApproverRole: string;
  escalatedTo?: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export interface AccessDeniedLog {
  id: string;
  timeZ: string;
  timeLocal: string;
  requester: string;
  rank: string;
  unit: string;
  deviceId: string;
  documentId: string;
  documentName: string;
  reasonForDenial: 'EMCON Restriction' | 'Not Authorized' | 'Expired Certificate' | 'Revoked Recipient' | 'Wrong Device';
  alertFired: boolean;
  ipAddress: string;
  terminalNode: string;
}

export interface DistributionEvent {
  distributionId: string;
  documentId: string;
  documentName: string;
  documentVersion: string;
  masterDocId: string;
  classification: ClassificationLevel;
  recipients: {
    recipientId: string;
    recipientName: string;
    rank: string;
    unit: string;
    kemCiphertext: string;
    accessType: AccessType;
    status: 'Distributed' | 'Decrypted' | 'Revoked';
  }[];
  timestamp: string;
  encryptionAlgorithm: 'AES-256-GCM + ML-KEM-768 (Local Demo)';
  documentEncryptionKeyHash: string;
  policyId: string;
}

export interface DecryptionEvent {
  eventId: string;
  documentId: string;
  documentName: string;
  documentVersion: string;
  recipientId: string;
  recipientName: string;
  recipientPseudonym: string;
  timestamp: string;
  deviceId: string;
  sessionId: string;
  provenanceCapsuleId: string;
  signatureStatus: 'ML-DSA-65 Valid' | 'Invalid Signature' | 'Unsigned' | string;
  signatureHex: string;
  channel: string;
  accessType: AccessType;
  nonce: string;
  merkleLeaf: string;
  ledgerBlockNumber: number;
}

export interface ProvenanceCapsule {
  capsuleId: string; // e.g. CAPSULE-2026-9042
  documentId: string;
  documentName: string;
  documentVersion: string;
  documentSha3Hash: string;
  recipientId: string;
  recipientName: string;
  recipientPseudonym: string;
  recipientPno: string;
  recipientUnit: string;
  deviceId: string;
  sessionId: string;
  decryptionEventId: string;
  timestamp: string;
  fingerprintId: string;
  watermarkId: string;
  authorizationPolicyId: string;
  ledgerBlockNumber: number;
  ledgerEventId: string;
  signatureAlgorithm: 'ML-DSA-65 (Local Adapter)';
  signatureHex: string;
  signerPublicKeyFingerprint: string;
  verified: boolean;
}

export interface FingerprintLayer {
  layer: 'TEXTUAL' | 'STRUCTURAL' | 'VISUAL' | 'SPECTRAL' | 'CRYPTOGRAPHIC';
  payloadId: string;
  payloadData: string;
  coveragePct: number;
  confidenceScore: number;
  errorCorrectionCode: string; // e.g. Reed-Solomon RS(255,223)
  recoveryStatus: 'Recovered' | 'Partially Recovered' | 'Not Recovered';
  integrityStatus: 'Valid' | 'Degraded' | 'Corrupted';
}

export interface DocumentFingerprint {
  fingerprintId: string;
  documentId: string;
  version: string;
  recipientId: string;
  recipientPseudonym: string;
  sessionId: string;
  createdAt: string;
  layers: FingerprintLayer[];
  overallRecoveryConfidence: number;
}

export interface WatermarkLayer {
  watermarkId: string;
  documentId: string;
  recipientPseudonym: string;
  sessionId: string;
  transformationType: 'Original' | 'JPEG Compressed' | 'Cropped' | 'Screenshot' | 'Photographed' | 'Scanned';
  embeddedRegionCount: number;
  frequencyBand: 'DCT Mid-Frequency + DWT LL2';
  recoveryConfidence: number;
  visualPreviewUrl?: string;
}

export interface LedgerEvent {
  eventId: string;
  recipientPseudonym: string;
  documentId: string;
  documentName: string;
  documentVersion: string;
  timestamp: string;
  signatureStatus: 'ML-DSA-65 Valid' | 'Signature Invalid' | 'Unsigned' | 'Pending Verification' | string;
  channel: string;
  accessType: AccessType;
  nonce: string;
  merkleLeaf: string;
  provenanceCapsuleId?: string;
}

export interface LedgerBlock {
  blockNumber: number;
  timestamp: string;
  merkleRootHash: string;
  previousBlockHash: string;
  currentBlockHash: string;
  eventCount: number;
  validatingNode: string;
  status: 'Verified' | 'Tampered' | 'Pending Sync';
  isTampered?: boolean;
  tamperDetail?: string;
  events: LedgerEvent[];
}

export type AttributionVerdict =
  | 'PROVENANCE VERIFIED'
  | 'UNRESOLVED'
  | 'CONTRADICTORY EVIDENCE'
  | 'MANIPULATION SUSPECTED'
  | 'NO MATCH';

export interface EvidenceCheck {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'UNKNOWN';
  detail: string;
  weight: number;
}

export interface ManipulationFinding {
  detectedIssue: string;
  evidenceSource: string;
  expected: string;
  observed: string;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export interface CollusionFinding {
  status: 'NO COLLUSION INDICATED' | 'POSSIBLE COLLUSION' | 'INSUFFICIENT EVIDENCE';
  candidateMatches: {
    recipientId: string;
    recipientName: string;
    matchedFragmentsPct: number;
    overlapSummary: string;
  }[];
  analysisNote: string;
}

export interface FramingFinding {
  isFramingSuspected: boolean;
  analysisNote: string;
  discrepancyDetails?: {
    watermarkClaimedRecipient: string;
    ledgerRecordedRecipient: string;
    signatureMatch: string;
    authorizationMatch: string;
  };
}

export interface LeakArtifact {
  id: string;
  filename: string;
  artifactType: 'PDF' | 'Image' | 'Screenshot' | 'Photograph' | 'Scan' | 'Partial document';
  fileSizeBytes: number;
  uploadedAt: string;
  investigator: string;
  sourceDescription: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  notes: string;
  transformationMetrics: {
    perspectiveDistortionPct: number;
    jpegCompressionQuality: number;
    noiseLevelPct: number;
    blurRadiusPx: number;
    cropFactorPct: number;
    rotationDegrees: number;
    screenshotCharacteristics: boolean;
  };
  ocrExtractedTextSnippet?: string;
}

export interface InvestigationCase {
  id: string; // e.g. NAVX-0042
  title: string;
  filename: string;
  uploadedAt: string;
  investigator: string;
  status: 'Identified' | 'Analyzing' | 'Pending' | 'Closed';
  progress: number;
  verdict: AttributionVerdict;
  confidenceScore: number;
  artifact: LeakArtifact;
  matchedDocument?: {
    id: string;
    name: string;
    masterDocId: string;
    matchedVersion: string;
    sha3Hash: string;
  };
  topMatch?: {
    recipientId: string;
    name: string;
    rank: string;
    pno: string;
    unit: string;
    confidenceScore: number;
    seedFingerprint: string;
    decryptedTimestamp: string;
    matchedVersion: string;
    provenanceCapsuleId: string;
  };
  evidenceChecks: EvidenceCheck[];
  manipulationFindings: ManipulationFinding[];
  collusionAnalysis: CollusionFinding;
  framingAnalysis: FramingFinding;
  timeline: {
    timestamp: string;
    event: string;
    actor: string;
    status: 'Normal' | 'Alert' | 'Verified';
  }[];
}

export interface AlertRule {
  id: string;
  name: string;
  denialThreshold: number;
  groupingKey: 'Same Document' | 'Same Unit' | 'Same Terminal/Device' | 'Global';
  timeWindow: string;
  action: string;
  isActive: boolean;
}

export interface SecurityAlert {
  id: string;
  type:
    | 'LEAK_DETECTED'
    | 'REPEATED_ACCESS_DENIED'
    | 'LEDGER_TAMPERING'
    | 'SIGNATURE_FAILURE'
    | 'FINGERPRINT_MISMATCH'
    | 'POSSIBLE_MANIPULATION'
    | 'POSSIBLE_COLLUSION'
    | 'UNAUTHORIZED_DEVICE';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  source: string;
  documentId?: string;
  documentName?: string;
  recipientId?: string;
  recipientName?: string;
  investigationId?: string;
  message: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED';
}

export interface DisconnectedUnit {
  id: string;
  name: string;
  callsign: string;
  offlineSince: string;
  pendingEventCount: number;
  emconState: string;
  sector: string;
  localEvents: LedgerEvent[];
}

export interface ReconciliationPackage {
  packageId: string;
  sourceUnitId: string;
  sourceUnitName: string;
  exportedAt: string;
  eventCount: number;
  packageHash: string;
  signatureMLDSA: string;
  status: 'Ready' | 'Imported' | 'Reconciled' | 'Conflict';
  events: LedgerEvent[];
}

export interface MonitoringJob {
  id: string;
  name: string;
  sourceCategory: 'Open Websites' | 'Forums' | 'Social Media' | 'File Sharing' | 'Dark Web';
  lastScannedAt: string;
  artifactsScannedCount: number;
  matchCount: number;
  status: 'Scanning' | 'Idle' | 'Alert';
}

export interface LeakCandidate {
  id: string;
  jobId: string;
  sourceName: string;
  discoveredAt: string;
  artifactFileName: string;
  similarityScore: number;
  matchedDocumentId: string;
  matchedDocumentName: string;
  matchedFingerprintId: string;
  matchedVersion: string;
  extractedRecipientName: string;
  status: 'Pending Review' | 'Investigation Opened' | 'False Positive';
}
