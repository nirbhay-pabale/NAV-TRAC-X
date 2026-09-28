import { useQuery } from '@tanstack/react-query';
import { centralStore } from '../data/centralStore';
import type { RecipientRecord, RecipientFilters, PaginatedRecipientsResponse } from '../types/recipient';

export const useRecipients = (filters: RecipientFilters) => {
  return useQuery({
    queryKey: ['recipients-list', filters],
    queryFn: async (): Promise<PaginatedRecipientsResponse> => {
      const state = centralStore.getState();

      const transformed: RecipientRecord[] = state.recipients.map((r, idx) => {
        const decryptions = state.decryptions.filter((d) => d.recipientId === r.id);
        const latestDec = decryptions[0];

        return {
          id: r.id,
          name: r.name,
          pno: r.pno,
          rank: r.rank,
          unitVessel: r.unit,
          fleet: r.unit.includes('Western') ? 'Western Fleet' : r.unit.includes('Eastern') ? 'Eastern Fleet' : 'Carrier Strike Group',
          documentsCount: r.documentsReceived,
          latestDecryptionId: latestDec ? `DID-${latestDec.nonce.toUpperCase()}` : 'DID-NONE',
          status: r.status as any,
          initials: r.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2),
          avatarColor:
            r.status === 'Revoked'
              ? 'bg-red-800 text-red-200 border-red-600'
              : idx % 3 === 0
              ? 'bg-sky-800 text-sky-200 border-sky-600'
              : idx % 3 === 1
              ? 'bg-indigo-800 text-indigo-200 border-indigo-600'
              : 'bg-teal-800 text-teal-200 border-teal-600',
          serviceNetworkStation: `NAVNET-${r.hardwareDeviceId} / ${r.unit}`,
          clearanceLevel: r.status === 'Revoked' ? 'REVOKED (AUDIT PRESERVED)' : r.clearanceLevel,
          pqcTokenStatus: r.status === 'Revoked' ? 'Clearance Revoked (Inactive)' : 'SoftHSMx2 (PKCS#11) Active',
          signatureStatus: r.status === 'Revoked' ? 'Revoked (Historical Valid)' : 'Verified (ML-DSA-65)',
          recentDocuments: decryptions.map((d) => ({
            id: d.eventId,
            documentName: d.documentName,
            decryptionId: `DID-${d.nonce.toUpperCase()}`,
            accessType: d.accessType as any,
            status: r.status === 'Revoked' ? 'Revoked' : 'Active',
            accessedZ: d.timestamp,
            merkleLeaf: d.merkleLeaf,
          })),
          forensicWatermark: {
            decryptionId: latestDec ? `DID-${latestDec.nonce.toUpperCase()}` : 'DID-7A3F-2901',
            generatedAt: latestDec ? latestDec.timestamp : '27 Sep 2026 04:54:12Z',
            onChainReceiptBlock: `Block #${latestDec?.ledgerBlockNumber || 4192}`,
            onChainReceiptHash: latestDec ? latestDec.merkleLeaf : '0x7a3f...2901',
            embeddingMethod: 'Dual-Domain (Micro-Kerning + 2D DWT-DCT SVD)',
            errorCorrection: 'Reed-Solomon RS(64,32)',
            payloadHashed: {
              txHash: latestDec ? `0x${latestDec.nonce}` : '0x4a9e68...',
              nonce: latestDec ? latestDec.nonce : '9a38f71c',
              pno: r.pno,
            },
          },
        };
      });

      let results = [...transformed];

      if (filters.accessStatus && filters.accessStatus !== 'All Status') {
        results = results.filter((r) => r.status === filters.accessStatus);
      }

      if (filters.unitVessel && filters.unitVessel !== 'All Units') {
        results = results.filter((r) => r.unitVessel.includes(filters.unitVessel) || filters.unitVessel.includes(r.unitVessel));
      }

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        results = results.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.pno.toLowerCase().includes(q) ||
            r.rank.toLowerCase().includes(q) ||
            r.unitVessel.toLowerCase().includes(q) ||
            r.latestDecryptionId.toLowerCase().includes(q)
        );
      }

      return {
        recipients: results,
        totalCount: results.length,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(results.length / filters.pageSize) || 1,
      };
    },
    staleTime: 1000 * 5,
  });
};
