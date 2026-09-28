export type PolicyScopeType = 'ROLE' | 'UNIT' | 'CLASSIFICATION' | 'MISSION';

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  scopeType: PolicyScopeType;
  appliesTo: string; // e.g. "Commanding Officers (CO/XO) • Western Fleet"
  classificationScope: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)';
  allowedAccessTypes: ('View' | 'Download' | 'Print' | 'Export')[];
  expiryRule: string; // e.g. "24 Hours from Decryption"
  activeRecipientsCount: number;
  status: 'Active' | 'Under Review' | 'Archived';
  createdAt: string;
  updatedAt: string;
  requiresDualCustody: boolean;
}

export interface AccessRequest {
  id: string;
  requesterName: string;
  requesterRank: string;
  requesterPno: string;
  requesterUnit: string;
  documentId: string;
  documentName: string;
  documentClassification: 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)';
  reasonGiven: string;
  requestedOn: string;
  status: 'Pending' | 'Approved' | 'Denied';
  requiredApproverRole: string;
  escalatedTo?: string;
  decidedBy?: string;
  decidedAt?: string;
  decisionNote?: string;
}

export type AccessDeniedEntry = AccessDeniedLogEntry;

export interface AccessDeniedLogEntry {
  id: string;
  timeZ: string;
  timeLocal: string;
  requester: string;
  rank: string;
  unit: string;
  deviceId: string;
  documentId: string;
  documentName: string;
  reasonForDenial: 'Expired Certificate' | 'Not Authorized' | 'Revoked PKI' | 'Wrong Hardware Token' | 'EMCON Restriction' | 'Security Policy Mismatch';
  alertFired: boolean;
  ipAddress: string;
  terminalNode: string;
}

export interface AlertRule {
  id: string;
  name: string;
  denialThreshold: number; // e.g. 3
  groupingKey: 'Same Document' | 'Same Unit' | 'Same Terminal/Device' | 'Same Officer PNo';
  timeWindow: '15 Minutes' | '1 Hour' | '6 Hours' | '24 Hours';
  action: 'Notify Security Desk' | 'Quarantine Device Token' | 'Lockdown EMCON Sector' | 'Flag High-Priority Investigation';
  isActive: boolean;
}
