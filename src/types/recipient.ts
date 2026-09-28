export type RecipientStatus = 'Active' | 'Restricted' | 'Revoked';

export interface RecipientDocumentAccess {
  id: string;
  documentName: string;
  decryptionId: string;
  accessType: 'View Only' | 'Download' | 'Print' | 'Edit';
  status: 'Active' | 'Expired' | 'Revoked';
  accessedZ: string;
  merkleLeaf: string;
}

export interface ForensicWatermarkData {
  decryptionId: string;
  generatedAt: string;
  onChainReceiptBlock: string;
  onChainReceiptHash: string;
  embeddingMethod: string;
  errorCorrection: string;
  payloadHashed: {
    txHash: string;
    nonce: string;
    pno: string;
  };
}

export interface RecipientRecord {
  id: string;
  name: string;
  pno: string;
  rank: string;
  unitVessel: string;
  fleet: string;
  documentsCount: number;
  latestDecryptionId: string;
  status: RecipientStatus;
  initials: string;
  avatarColor: string;
  serviceNetworkStation: string;
  clearanceLevel: string;
  pqcTokenStatus: string;
  signatureStatus: string;
  recentDocuments: RecipientDocumentAccess[];
  forensicWatermark: ForensicWatermarkData;
}

export interface RecipientFilters {
  documentId: string;
  recipientType: string;
  unitVessel: string;
  accessStatus: string;
  dateRange: string;
  searchQuery: string;
  page: number;
  pageSize: number;
}

export interface RecipientStats {
  totalRecipients: number;
  totalBreakdown: string;
  documentsShared: number;
  documentsBreakdown: string;
  decryptionIds: number;
  decryptionBreakdown: string;
  watermarkCoverage: string;
  watermarkBreakdown: string;
}

export interface PaginatedRecipientsResponse {
  recipients: RecipientRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
