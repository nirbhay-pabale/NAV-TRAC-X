import { useQuery } from '@tanstack/react-query';
import { centralStore } from '../data/centralStore';
import { apiClient } from '../api/client';
import type {
  DocumentItem,
  DocumentStats,
  DocumentFilters,
  DocumentVersionEntry,
  DocumentRecipientEntry,
  LeakMonitoringResult
} from '../types/document';

export const useDocumentStats = () => {
  return useQuery<DocumentStats>({
    queryKey: ['document-stats'],
    queryFn: async () => {
      try {
        const stats = await apiClient.get<any>('/documents/stats');
        if (stats && stats.totalDocuments !== undefined) {
          return {
            totalDocuments: stats.totalDocuments,
            activeDistributions: stats.activeDistributions,
            metadataSanitizedPercentage: stats.metadataSanitizedPercentage,
            externalLeakAlerts: stats.externalLeakAlerts,
          };
        }
      } catch (err) {
        console.warn('Backend documents/stats unreachable, fallback to store:', err);
      }
      const state = centralStore.getState();
      const total = state.documents.length;
      const activeDist = state.documents.filter((d) => d.status === 'Distributed').length;
      const sanitized = state.documents.filter((d) => d.metadataSanitized).length;
      const leakAlerts = state.leakCandidates.length;

      return {
        totalDocuments: total,
        activeDistributions: activeDist,
        metadataSanitizedPercentage: total > 0 ? Number(((sanitized / total) * 100).toFixed(1)) : 100,
        externalLeakAlerts: leakAlerts,
      };
    },
    staleTime: 1000 * 5,
  });
};

export const useDocuments = (filters: DocumentFilters) => {
  return useQuery<{
    documents: DocumentItem[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>({
    queryKey: ['documents', filters],
    queryFn: async () => {
      try {
        const res = await apiClient.get<any>('/documents', {
          searchQuery: filters.searchQuery,
          classification: filters.classification,
          status: filters.status,
          page: filters.page,
          pageSize: filters.pageSize,
        });
        if (res && Array.isArray(res.documents) && res.documents.length > 0) {
          const list: DocumentItem[] = res.documents.map((d: any) => ({
            id: d.id,
            name: d.name,
            version: d.version,
            classification: d.classification as any,
            recipientsCount: d.recipientCount || 0,
            status: d.status as any,
            createdAt: d.createdAt,
            updatedAt: d.updatedAt,
            fileSize: `${((d.sizeBytes || 12400000) / 1024 / 1024).toFixed(1)} MB`,
            pageCount: Math.max(12, Math.round((d.sizeBytes || 12400000) / 500000)),
            format: (d.name.split('.').pop() || 'PDF').toUpperCase() as any,
            sha3Fingerprint: d.sha3Hash,
            metadataSanitized: Boolean(d.metadataSanitized),
            watermarkCoverage: d.watermarkCoveragePct || 100,
            distributedBy: 'Directorate of Naval Operations',
            leakAlertCount: d.leakAlertCount || (d.id === 'NAV-DOC-2026-0042' ? 1 : 0),
            description: `${d.documentType || 'Classified'} • ${d.securityCaveats || 'NOFORN'} • ${d.tags ? d.tags.join(', ') : 'Naval Op'}`,
          }));

          return {
            documents: list,
            totalCount: res.totalCount || list.length,
            page: res.page || filters.page,
            pageSize: res.pageSize || filters.pageSize,
            totalPages: res.totalPages || Math.ceil((res.totalCount || list.length) / filters.pageSize) || 1,
          };
        }
      } catch (err) {
        console.warn('Backend documents unreachable, fallback to store:', err);
      }

      const state = centralStore.getState();
      let list: DocumentItem[] = state.documents.map((d) => ({
        id: d.id,
        name: d.name,
        version: d.version,
        classification: d.classification as any,
        recipientsCount: d.recipientCount,
        status: d.status as any,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        fileSize: `${(d.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
        pageCount: Math.max(12, Math.round(d.sizeBytes / 500000)),
        format: (d.name.split('.').pop() || 'PDF').toUpperCase() as any,
        sha3Fingerprint: d.sha3Hash,
        metadataSanitized: d.metadataSanitized,
        watermarkCoverage: d.watermarkCoveragePct,
        distributedBy: 'Directorate of Naval Operations',
        leakAlertCount: d.id === 'NAV-DOC-2026-0042' ? 1 : 0,
        description: `${d.documentType} • ${d.securityCaveats} • ${d.tags.join(', ')}`,
      }));

      if (filters.classification && filters.classification !== 'All Classifications') {
        list = list.filter((doc) => doc.classification === filters.classification);
      }
      if (filters.documentType && filters.documentType !== 'All Types') {
        list = list.filter((doc) => doc.format.toUpperCase() === filters.documentType.toUpperCase());
      }
      if (filters.status && filters.status !== 'All Statuses') {
        list = list.filter((doc) => doc.status === filters.status);
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.toLowerCase();
        list = list.filter(
          (doc) =>
            doc.name.toLowerCase().includes(q) ||
            doc.id.toLowerCase().includes(q) ||
            doc.description.toLowerCase().includes(q)
        );
      }

      const startIndex = (filters.page - 1) * filters.pageSize;
      const paginated = list.slice(startIndex, startIndex + filters.pageSize);

      return {
        documents: paginated,
        totalCount: list.length,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(list.length / filters.pageSize) || 1,
      };
    },
    staleTime: 1000 * 5,
  });
};

export const useDocumentDetail = (documentId: string | null) => {
  return useQuery<DocumentItem | null>({
    queryKey: ['document-detail', documentId],
    queryFn: async () => {
      if (!documentId) return null;
      try {
        const doc = await apiClient.get<any>(`/documents/${documentId}`);
        if (doc) {
          return {
            id: doc.id,
            name: doc.name,
            version: doc.version,
            classification: doc.classification as any,
            recipientsCount: doc.recipientCount || 0,
            status: doc.status as any,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            fileSize: `${((doc.sizeBytes || 12400000) / 1024 / 1024).toFixed(1)} MB`,
            pageCount: 32,
            format: (doc.name.split('.').pop() || 'PDF').toUpperCase() as any,
            sha3Fingerprint: doc.sha3Hash,
            metadataSanitized: Boolean(doc.metadataSanitized),
            watermarkCoverage: doc.watermarkCoveragePct || 100,
            distributedBy: 'Western Naval Command (FOC-in-C)',
            leakAlertCount: doc.id === 'NAV-DOC-2026-0042' ? 1 : 0,
            description: `${doc.documentType || 'Classified'} • ${doc.securityCaveats || 'NOFORN'} • ${doc.tags ? doc.tags.join(', ') : ''}`,
          };
        }
      } catch (err) {
        console.warn('Backend document detail unreachable, fallback to store:', err);
      }
      const doc = centralStore.getState().documents.find((d) => d.id === documentId || d.masterDocId === documentId);
      if (!doc) return null;

      return {
        id: doc.id,
        name: doc.name,
        version: doc.version,
        classification: doc.classification as any,
        recipientsCount: doc.recipientCount,
        status: doc.status as any,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        fileSize: `${(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB`,
        pageCount: 32,
        format: (doc.name.split('.').pop() || 'PDF').toUpperCase() as any,
        sha3Fingerprint: doc.sha3Hash,
        metadataSanitized: doc.metadataSanitized,
        watermarkCoverage: doc.watermarkCoveragePct,
        distributedBy: 'Western Naval Command (FOC-in-C)',
        leakAlertCount: doc.id === 'NAV-DOC-2026-0042' ? 1 : 0,
        description: `${doc.documentType} • ${doc.securityCaveats} • ${doc.tags.join(', ')}`,
      };
    },
    enabled: !!documentId,
    staleTime: 1000 * 10,
  });
};

export const useDocumentVersions = (documentId: string | null) => {
  return useQuery<DocumentVersionEntry[]>({
    queryKey: ['document-versions', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const doc = centralStore.getState().documents.find((d) => d.id === documentId);
      if (doc?.versions && doc.versions.length > 0) {
        return doc.versions.map((v) => ({
          version: v.version,
          releasedAt: v.releasedAt,
          author: v.author,
          changeNotes: v.changeNotes,
          fileHash: v.fileHash,
          isLeakedMatch: v.isLeakedMatch,
          linkedDecryptionEvents: v.linkedDecryptionEvents.map((e) => ({
            eventId: e.eventId,
            recipientName: e.recipientName,
            decryptedAt: e.decryptedAt,
            matchedLeakArtifact: e.matchedLeakArtifact ? 'LEAK-ART-0042' : undefined,
          })),
        }));
      }

      return [
        {
          version: doc?.version || 'v1.0',
          releasedAt: doc?.createdAt || '25 Sep 2026 08:30Z',
          author: 'Directorate of Naval Operations',
          changeNotes: 'Initial cryptographic release.',
          fileHash: doc?.sha3Hash ? `SHA256: ${doc.sha3Hash.slice(0, 32)}` : 'SHA256: 88f21ac0...',
          isLeakedMatch: false,
          linkedDecryptionEvents: [],
        },
      ];
    },
    enabled: !!documentId,
    staleTime: 1000 * 10,
  });
};

export const useDocumentRecipients = (documentId: string | null) => {
  return useQuery<DocumentRecipientEntry[]>({
    queryKey: ['document-recipients', documentId],
    queryFn: async () => {
      if (!documentId) return [];
      const state = centralStore.getState();
      const decryptions = state.decryptions.filter((d) => d.documentId === documentId);
      const allRecipients = state.recipients;

      return allRecipients.slice(0, 3).map((r, idx) => {
        const dec = decryptions.find((d) => d.recipientId === r.id);
        return {
          id: r.id,
          recipientName: r.name,
          rank: r.rank,
          pno: r.pno,
          unitVessel: r.unit,
          accessType: idx === 1 ? 'Full Access' : 'View Only',
          deviceId: r.hardwareDeviceId,
          status: dec ? 'Decrypted' : 'Pending',
          decryptedAt: dec ? dec.timestamp : undefined,
          signatureVerified: r.status !== 'Revoked',
        };
      });
    },
    enabled: !!documentId,
    staleTime: 1000 * 10,
  });
};

export const useLeakMonitoring = (documentId: string | null) => {
  return useQuery<LeakMonitoringResult>({
    queryKey: ['leak-monitoring', documentId],
    queryFn: async () => {
      if (!documentId) {
        return {
          documentId: '',
          isClean: true,
          statusText: 'Not Detected Externally',
          lastScannedAt: new Date().toISOString(),
        };
      }

      const state = centralStore.getState();
      const candidate = state.leakCandidates.find((c) => c.matchedDocumentId === documentId);

      if (candidate) {
        return {
          documentId,
          isClean: false,
          statusText: 'Potential Match Found (1 Source)',
          lastScannedAt: candidate.discoveredAt,
          matchedIncident: {
            caseId: 'NAVX-0042',
            sourceName: candidate.sourceName,
            detectedAt: candidate.discoveredAt,
            confidence: candidate.similarityScore,
            matchMethod: 'Steganographic Micro-Dot Pattern Extract',
            matchedVersion: candidate.matchedVersion,
            suspectUnit: 'INS Vikramaditya (R33)',
          },
        };
      }

      return {
        documentId,
        isClean: true,
        statusText: 'Not Detected Externally',
        lastScannedAt: new Date().toISOString(),
      };
    },
    enabled: !!documentId,
    staleTime: 1000 * 10,
  });
};
