export type ForensicOutcome = 
  | 'Verified' 
  | 'Manipulation Suspected' 
  | 'Contradictory' 
  | 'Unresolved' 
  | 'No Match' 
  | 'verified' 
  | 'unresolved' 
  | 'contradictory';

export interface ForensicArtifactFile {
  id: string;
  name: string;
  size: string;
  format: 'JPG' | 'PDF' | 'PNG' | 'DOCX' | 'PPTX' | 'WEBP' | 'TIFF' | string;
  type: 'document' | 'image' | 'screenshot';
  status: 'Uploading' | 'Uploaded' | 'Queued' | 'Analyzing' | 'Analyzed' | 'Failed' | 'Processing';
  previewUrl: string;
  hash: string;
  uploadProgress?: number;
  outcomeType?: ForensicOutcome;
  benchmarkId?: string;
  expectedOutcome?: string;
  isBenchmark?: boolean;
  hasBeenAnalyzed?: boolean;
}

export interface RecipientMatch {
  id: string;
  name: string;
  pno: string;
  rank: string;
  unitVessel: string;
  station: string;
  clearance: string;
  initials: string;
  avatarColor: string;
  status: string;
}

export interface MatchedDocument {
  name: string;
  version: string;
  date: string;
  classification: string;
  distributedOn: string;
  distributedBy: string;
  totalRecipients: number;
  accessType: string;
  status: string;
  originalUrl?: string;
}

export interface DecryptionEventMatch {
  eventId: string;
  ledgerBlock: string;
  decryptionTime: string;
  accessType: string;
  status: string;
  merkleRoot: string;
}

export interface ForensicChecksState {
  artifactDetected: boolean;
  fingerprintRecovered: boolean;
  candidateEventFound: boolean;
  documentHash: boolean;
  signature: boolean;
  ledger: boolean;
  authorization: boolean;
}

export interface WatermarkDetails {
  method: string;
  txHash: string;
  nonce: string;
  errorCorrection: string;
  detectedAt: string;
  visibility: string;
  integrity: string;
  integrityValid: boolean;
}

export interface AnalyzeArtifactResponse {
  outcome: ForensicOutcome;
  confidence: number;
  caseId: string;
  fileName: string;
  fileType: string;
  fileHash: string;
  analyzedAt: string;
  statusLabel: string;
  statusColor: 'green' | 'amber' | 'red';
  recipient?: RecipientMatch;
  document?: MatchedDocument;
  event?: DecryptionEventMatch;
  checks: ForensicChecksState;
  failedStepIndex?: number; // index 0..6 if a check failed
  watermarkDetails: WatermarkDetails;
  guidance?: string;
  explanation?: string;
  aiAssessment?: AiForensicAssessment;
}

export interface AiForensicAssessment {
  provider: string;
  isLiveAi: boolean;
  model: string;
  threatLevel: 'CRITICAL' | 'HIGH' | 'ELEVATED' | 'LOW';
  operationalRisk: string;
  attributionAnalysis: string;
  recommendedCountermeasures: string[];
  legalAdmissibilityBSA63: string;
  generatedAt: string;
}

export interface LeakPathChainStep {
  step: string;
  entity: string;
  id: string;
  status: string;
  timestamp: string;
}

export interface LeakPathAnalysis {
  suspectedMethod: 'DIRECT FILE EXPORT' | 'SCREENSHOT' | 'PHOTOGRAPH OF SCREEN' | 'DOCUMENT COPY' | 'PRINT / SCAN' | 'SCREEN CAPTURE' | 'UNKNOWN';
  confidence: number;
  chain: LeakPathChainStep[];
  evidenceSummary: string[];
  explanation: string;
  deviceId?: string;
  sessionId?: string;
}

export interface WhyThisMatchItem {
  label: string;
  verified: boolean;
  isWarning?: boolean;
}

export interface EvidenceConvergenceItem {
  checkType: string;
  label: string;
  status: 'VERIFIED' | 'PARTIAL' | 'FAILED' | 'NOT AVAILABLE' | 'CONTRADICTORY';
  evidenceId: string;
  source: string;
  timestamp?: string;
  details: string;
}

export interface LeakTimelineEvent {
  title: string;
  timestamp: string;
  description: string;
  type: string;
}

export interface DeviceCorrelationInfo {
  device: string;
  session: string;
  lastAccess: string;
  network?: string;
  location?: string;
  correlation: 'MATCHED' | 'INSUFFICIENT DATA' | 'MISMATCH';
}

export interface FileIntegrityInfo {
  uploadedSha256: string;
  originalSha256: string;
  perceptualHash: string;
  contentSimilarity: number;
  result: 'MATCH' | 'DIFFERENT' | 'UNVERIFIED';
}

export interface AnalystAssessmentInfo {
  systemAssessment: 'HIGH CONFIDENCE' | 'MEDIUM CONFIDENCE' | 'LOW CONFIDENCE' | 'UNRESOLVED' | 'CONTRADICTORY';
  analystStatus: 'PENDING REVIEW' | 'CONFIRMED' | 'UNRESOLVED' | 'REJECTED';
  reviewer?: string;
  reviewedAt?: string;
  reason?: string;
}

export interface IdentificationCandidate {
  id: string;
  name: string;
  pno: string;
  rank: string;
  unitVessel: string;
  station: string;
  clearance: string;
  confidence: number;
  distributionId?: string;
  fingerprintId?: string;
  watermarkId?: string;
  decryptionEventId?: string;
}

export interface IdentificationPayload {
  status: 'MATCH_FOUND' | 'UNRESOLVED' | 'NO_MATCH' | 'CONTRADICTORY';
  statusLabel: string;
  confidence: number;
  recipient?: RecipientMatch;
  candidates?: IdentificationCandidate[];
  possibleCount?: number;
  strongestCandidate?: {
    id: string;
    name: string;
    pno: string;
    rank: string;
    confidence: number;
  };
  requiredEvidence?: string;
  explanation?: string;
}

export interface LeakIntelligencePayload {
  artifact: any;
  identification: IdentificationPayload;
  document: {
    id: string;
    name: string;
    version: string;
    date: string;
    classification: string;
    sha256?: string;
    fingerprintId?: string;
    watermarkId?: string;
    distributedOn?: string;
    distributedBy?: string;
    totalRecipients?: number;
    accessType?: string;
    status?: string;
  };
  distribution?: any;
  decryptionEvent?: DecryptionEventMatch;
  provenance?: any;
  fingerprint?: any;
  watermark?: any;
  ledger?: {
    blockHeight: number;
    merkleRoot: string;
    blockHash: string;
    previousHash: string;
    isTampered: boolean;
  };
  leakPath: LeakPathAnalysis;
  whyThisMatch: WhyThisMatchItem[];
  evidence: EvidenceConvergenceItem[];
  timeline: LeakTimelineEvent[];
  deviceCorrelation: DeviceCorrelationInfo;
  fileIntegrity: FileIntegrityInfo;
  analystAssessment: AnalystAssessmentInfo;
  aiAssessment?: AiForensicAssessment;
  investigation?: any;
}

export interface AnalysisPipelineStep {
  id: number;
  name: string;
  label: string;
  sublabel?: string;
  checkKey: keyof ForensicChecksState;
  status: 'pending' | 'active' | 'done' | 'failed';
  errorMsg?: string;
}

