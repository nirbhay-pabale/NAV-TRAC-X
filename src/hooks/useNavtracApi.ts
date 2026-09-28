import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface DocumentItem {
  id: string;
  name: string;
  masterDocId: string;
  version: string;
  classification: string;
  documentType: string;
  sizeBytes: number;
  status: string;
  sha3Hash: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
  metadataSanitized: boolean;
  watermarkCoveragePct: number;
  tags: string[];
  securityCaveats?: string;
}

export interface RecipientItem {
  id: string;
  name: string;
  rank: string;
  pno: string;
  unit: string;
  email: string;
  clearanceLevel: string;
  activeKeys: number;
  documentsReceived: number;
  lastActive: string;
  status: string;
  hardwareDeviceId: string;
  pkiCertificateFingerprint: string;
}

export interface DashboardStats {
  documents: number;
  activeDistributions: number;
  recipients: number;
  decryptionEvents: number;
  ledgerBlocks: number;
  investigations: number;
  alerts: number;
  leaks: number;
  pendingNotifications: number;
  isLedgerTampered: boolean;
  systemHealth: {
    database: string;
    backendApi: string;
    gmail: string;
    ledger: string;
    storage: string;
    forensicEngine: string;
  };
}

export interface GmailIntegrationStatus {
  connected: boolean;
  account: string | null;
  scopes: string[];
  lastSuccessfulRequest: string | null;
  lastEmailSent: string | null;
  lastError: string | null;
  emconActive: boolean;
  queuedNotificationsCount: number;
  mode: string;
}

// 1. DASHBOARD STATS
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiClient.get<DashboardStats>('/dashboard/stats'),
    refetchInterval: 30000,
    staleTime: 15000,
    refetchOnWindowFocus: false,
  });
}

// 2. DOCUMENTS
export function useDocuments(filters?: Record<string, any>) {
  return useQuery<{ documents: DocumentItem[]; totalCount: number }>({
    queryKey: ['documents', filters],
    queryFn: () => apiClient.get('/documents', filters),
  });
}

export function useDocument(id: string) {
  return useQuery<DocumentItem>({
    queryKey: ['document', id],
    queryFn: () => apiClient.get<DocumentItem>(`/documents/${id}`),
    enabled: Boolean(id),
  });
}

export function useDocumentVersions(documentId: string) {
  return useQuery<any[]>({
    queryKey: ['document-versions', documentId],
    queryFn: () => apiClient.get<any[]>(`/documents/${documentId}/versions`),
    enabled: Boolean(documentId),
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      classification: string;
      documentType: string;
      author?: string;
      sanitizeMetadata?: boolean;
      fileContent?: string;
    }) => apiClient.post('/documents/upload', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['audit-events'] });
    },
  });
}

// 3. RECIPIENTS
export function useRecipients() {
  return useQuery<RecipientItem[]>({
    queryKey: ['recipients'],
    queryFn: () => apiClient.get<RecipientItem[]>('/recipients'),
  });
}

export function useRevokeRecipient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      apiClient.post(`/recipients/${id}/revoke`, { reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recipients'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
}

// 4. AUTHORIZATIONS
export function useAuthorizations() {
  return useQuery<{ policies: any[]; requests: any[] }>({
    queryKey: ['authorizations'],
    queryFn: async () => {
      const [policies, requests] = await Promise.all([
        apiClient.get<any[]>('/authorization/policies'),
        apiClient.get<any[]>('/authorization/requests'),
      ]);
      return { policies, requests };
    },
  });
}

export function useApproveAccessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approverName, note }: { id: string; approverName?: string; note?: string }) =>
      apiClient.post(`/authorization/requests/${id}/approve`, { approverName, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authorizations'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
}

export function useDenyAccessRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, denierName, reason }: { id: string; denierName?: string; reason?: string }) =>
      apiClient.post(`/authorization/requests/${id}/deny`, { denierName, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['authorizations'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
}

// 5. DISTRIBUTIONS
export function useDistributions() {
  return useQuery<any[]>({
    queryKey: ['distributions'],
    queryFn: () => apiClient.get<any[]>('/distributions'),
  });
}

export function useCreateDistribution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      documentId: string;
      recipients: string[];
      classification?: string;
      encryptionAlgorithm?: string;
    }) => apiClient.post('/distributions', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distributions'] });
      qc.invalidateQueries({ queryKey: ['documents'] });
      qc.invalidateQueries({ queryKey: ['recipients'] });
      qc.invalidateQueries({ queryKey: ['ledger-blocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// 6. DECRYPTION EVENTS
export function useDecryptionEvents() {
  return useQuery<any[]>({
    queryKey: ['decryption-events'],
    queryFn: () => apiClient.get<any[]>('/decryption/events'),
  });
}

// 7. PROVENANCE
export function useProvenance(id?: string) {
  return useQuery<any>({
    queryKey: ['provenance', id],
    queryFn: () => (id ? apiClient.get(`/provenance/${id}`) : apiClient.get('/provenance')),
  });
}

// 8. FINGERPRINTS
export function useFingerprints() {
  return useMutation({
    mutationFn: (data: any) => apiClient.post('/fingerprints/generate', data),
  });
}

// 9. LEDGER
export function useLedger(searchQuery?: string) {
  return useQuery<any[]>({
    queryKey: ['ledger-blocks', searchQuery],
    queryFn: () => apiClient.get<any[]>('/ledger/blocks', { searchQuery }),
  });
}

export function useVerifyLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<any>('/ledger/verify'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger-blocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useTamperLedger() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<any>('/ledger/tamper-demo'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger-blocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useResetLedgerDemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post<any>('/ledger/reset-demo'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger-blocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

// 10. INVESTIGATIONS
export function useInvestigations() {
  return useQuery<any[]>({
    queryKey: ['investigations'],
    queryFn: () => apiClient.get<any[]>('/investigations'),
  });
}

export function useInvestigation(id: string) {
  return useQuery<any>({
    queryKey: ['investigation', id],
    queryFn: () => apiClient.get<any>(`/investigations/${id}`),
    enabled: Boolean(id),
  });
}

export function useNotifySecurityTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, recipientEmail, note }: { id: string; recipientEmail?: string; note?: string }) =>
      apiClient.post(`/investigations/${id}/notify-security`, { recipientEmail, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
}

// 11. EVIDENCE
export function useEvidence(caseId: string) {
  return useQuery<any>({
    queryKey: ['evidence', caseId],
    queryFn: () => apiClient.get<any>(`/investigations/${caseId}/evidence`),
    enabled: Boolean(caseId),
  });
}

// 12. ALERTS
export function useAlerts() {
  return useQuery<any[]>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<any[]>('/alerts'),
  });
}

export function useAcknowledgeAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/alerts/${id}/acknowledge`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['alerts'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

// 13. EMCON
export function useEMCON() {
  const qc = useQueryClient();
  const query = useQuery<any>({
    queryKey: ['emcon-status'],
    queryFn: () => apiClient.get('/emcon/status'),
  });

  const updatePosture = useMutation({
    mutationFn: (posture: string) => apiClient.post('/emcon/posture', { posture }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emcon-status'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      qc.invalidateQueries({ queryKey: ['gmail-status'] });
    },
  });

  const reconcileUnit = useMutation({
    mutationFn: (unitId: string) => apiClient.post('/emcon/reconcile', { unitId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['emcon-status'] });
      qc.invalidateQueries({ queryKey: ['ledger-blocks'] });
      qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  return {
    ...query,
    updatePosture,
    reconcileUnit,
  };
}

// 14. REPORTS
export function useReports() {
  return useMutation({
    mutationFn: ({ caseId, sendViaGmail, recipientEmail }: { caseId: string; sendViaGmail?: boolean; recipientEmail?: string }) =>
      apiClient.post(`/reports/investigation/${caseId}`, { sendViaGmail, recipientEmail }),
  });
}

// 15. GMAIL INTEGRATION
export function useGmailIntegration() {
  const qc = useQueryClient();

  const status = useQuery<GmailIntegrationStatus>({
    queryKey: ['gmail-status'],
    queryFn: () => apiClient.get<GmailIntegrationStatus>('/integrations/gmail/status'),
    refetchInterval: 60000,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const notifications = useQuery<any[]>({
    queryKey: ['gmail-notifications'],
    queryFn: () => apiClient.get<any[]>('/integrations/gmail/notifications'),
  });

  const sendTestEmail = useMutation({
    mutationFn: (targetEmail?: string) =>
      apiClient.post('/integrations/gmail/test', { targetEmail }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gmail-status'] });
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });

  const disconnectGoogle = useMutation({
    mutationFn: () => apiClient.post('/integrations/gmail/disconnect'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gmail-status'] });
    },
  });

  const flushQueue = useMutation({
    mutationFn: () => apiClient.post('/integrations/gmail/flush-queue'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gmail-status'] });
      qc.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });

  return {
    status,
    notifications,
    sendTestEmail,
    disconnectGoogle,
    flushQueue,
  };
}
