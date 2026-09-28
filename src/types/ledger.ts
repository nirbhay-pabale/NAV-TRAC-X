export interface LedgerEvent {
  eventId: string; // e.g. "EVT-XXXXX"
  recipientPseudonym: string; // e.g. "Authorized Officer (04821-K)"
  documentId: string; // e.g. "NAV-DOC-2026-0042"
  documentName: string; // e.g. "Mission_Plan_Bravo.pdf"
  timestamp: string; // e.g. "27 Sep 2026 04:54:12Z"
  signatureStatus: 'ML-DSA-65 Valid' | 'Signature Invalid' | 'Pending Verification' | string;
  channel: string;
  accessType: string;
  nonce: string;
  merkleLeaf: string;
}

export interface LedgerBlock {
  blockNumber: number; // e.g. 4192
  timestamp: string;
  merkleRootHash: string;
  previousBlockHash: string;
  eventCount: number;
  validatingNode: string;
  status: 'Sealed' | 'Verified' | 'Tampered';
  events: LedgerEvent[];
  isTampered?: boolean;
  tamperDetail?: string;
}

export interface ChainVerificationResult {
  isSuccess: boolean;
  totalBlocksVerified: number;
  failedBlockNumber?: number;
  errorReason?: string;
  verifiedAt: string;
  rootIntegrityScore: number;
}

export interface DisconnectedUnit {
  id: string;
  name: string;
  callsign: string;
  offlineSince: string;
  pendingEventCount: number;
  emconState: string;
  sector: string;
}

export interface ReconciliationResult {
  unitId: string;
  unitName: string;
  reconciledAt: string;
  eventsMergedCount: number;
  newBlocksAppended: number;
  events: LedgerEvent[];
}
