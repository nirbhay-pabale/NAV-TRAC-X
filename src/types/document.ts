export type DocumentClassification = 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)';

export type DocumentStatus = 'Distributed' | 'Draft' | 'Archived' | 'Quarantined';

export interface DocumentItem {
  id: string; // e.g. "NAV-DOC-2026-0042"
  name: string; // e.g. "Fleet Exercise Bravo Deployment Orders.pdf"
  version: string; // e.g. "v2.1"
  classification: DocumentClassification;
  recipientsCount: number;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  fileSize: string;
  pageCount: number;
  format: 'PDF' | 'DOCX' | 'PPTX' | 'JPG';
  sha3Fingerprint: string;
  metadataSanitized: boolean;
  watermarkCoverage: number; // e.g. 100%
  distributedBy: string;
  leakAlertCount: number;
  description: string;
}

export interface DocumentStats {
  totalDocuments: number;
  activeDistributions: number;
  metadataSanitizedPercentage: number;
  externalLeakAlerts: number;
}

export interface DocumentFilters {
  classification: string;
  documentType: string;
  status: string;
  dateRange: string;
  searchQuery: string;
  page: number;
  pageSize: number;
}

export interface DocumentVersionEntry {
  version: string;
  releasedAt: string;
  author: string;
  changeNotes: string;
  fileHash: string;
  linkedDecryptionEvents: {
    eventId: string;
    recipientName: string;
    decryptedAt: string;
    matchedLeakArtifact?: string;
  }[];
  isLeakedMatch?: boolean;
}

export interface DocumentRecipientEntry {
  id: string;
  recipientName: string;
  rank: string;
  pno: string;
  unitVessel: string;
  accessType: 'View Only' | 'Download' | 'Print' | 'Full Access';
  status: 'Decrypted' | 'Pending' | 'Revoked' | 'Quarantined';
  decryptedAt?: string;
  deviceId: string;
  signatureVerified: boolean;
}

export interface LeakMonitoringResult {
  documentId: string;
  isClean: boolean;
  statusText: string;
  lastScannedAt: string;
  matchedIncident?: {
    caseId: string;
    sourceName: string;
    detectedAt: string;
    confidence: number;
    matchMethod: string;
    matchedVersion: string;
    suspectUnit: string;
  };
}
