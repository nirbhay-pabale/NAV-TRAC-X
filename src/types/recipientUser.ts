export type UserRole = 'investigator' | 'normal_user' | 'recipient';

export type ClearanceLevel = 'Level 1 (Restricted)' | 'Level 2 (Confidential)' | 'Level 3 (Secret)' | 'Level 4 (Top Secret Codeword)';

export interface UserSession {
  userId: string;
  name: string;
  rank: string;
  pno: string;
  unit: string;
  email: string;
  clearanceLevel: ClearanceLevel;
  role: 'investigator' | 'normal_user';
  deviceId: string;
  deviceName: string;
  isDeviceRegistered: boolean;
  keyFingerprint: string;
  keyStatus: 'Active' | 'Revoked' | 'Expiring Soon';
  lastLoginTime: string;
  token: string;
}

export type AllowedAccessType = 'View Only' | 'Print' | 'Download';
export type RecipientDocumentStatus = 'New' | 'Opened' | 'Expiring' | 'Expired' | 'Revoked';

export interface RecipientDocument {
  id: string;
  documentNumber: string;
  title: string;
  filename: string;
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)';
  version: string;
  sentByUnit: string;
  sentByAuthority: string;
  receivedDate: string;
  receivedTimestamp: string;
  expiryTimestamp: string;
  expiryCountdownText: string;
  isExpiringSoon: boolean; // under 48 hours
  isExpired: boolean;
  status: RecipientDocumentStatus;
  allowedAccessType: AllowedAccessType;
  fileSizeBytes: number;
  totalPages: number;
  description: string;
  deviceLockedTo?: string;
  accessCount: number;
  lastOpenedAt?: string;
  canOpen: boolean;
  disabledReason?: string;
  sampleContentText?: string[];
}

export interface MyDashboardStats {
  documentsSharedWithMe: number;
  awaitingMyReview: number;
  expiringWithin48h: number;
  pendingAccessRequests: number;
}

export interface RecipientActivityEvent {
  id: string;
  receiptId: string;
  timestamp: string;
  timeLocal: string;
  action: 'Opened' | 'Access Denied' | 'Request Submitted' | 'Request Approved' | 'Key Rotated' | 'Concern Reported';
  documentId?: string;
  documentTitle?: string;
  status: 'SUCCESS' | 'DENIED' | 'PENDING' | 'LOGGED';
  signatureStatus: 'ML-DSA-65 Valid' | 'N/A' | 'Failed';
  ledgerStatus: 'Recorded on Ledger' | 'Queued (EMCON)' | 'N/A';
  deviceId: string;
  details: string;
}

export interface RecipientKeyInfo {
  keyId: string;
  kemAlgorithm: string;
  dsaAlgorithm: string;
  createdDate: string;
  validUntil: string;
  status: 'Active' | 'Revoked' | 'Expiring Soon';
  registeredDevice: {
    id: string;
    name: string;
    type: string;
    macAddress: string;
    lastAttestation: string;
    status: 'Verified' | 'Revoked' | 'Unregistered';
  };
  keyHistory: Array<{
    id: string;
    rotatedOn: string;
    action: string;
    reason: string;
    actor: string;
  }>;
}

export interface RecipientAccessRequest {
  id: string;
  documentReferenceId: string;
  documentName?: string;
  reason: string;
  submittedOn: string;
  status: 'Pending' | 'Approved' | 'Denied';
  reviewingAuthority: string;
  decidedAt?: string;
  decisionNote?: string;
  linkedDocumentId?: string;
}

export interface SecurityNotice {
  id: string;
  title: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  date: string;
  summary: string;
}

export interface SecurityConcernReport {
  id: string;
  subject: string;
  details: string;
  submittedAt: string;
  status: 'Submitted' | 'Under Review';
}
