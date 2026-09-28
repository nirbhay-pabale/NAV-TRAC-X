import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { centralStore } from '../data/centralStore';
import { ledgerEngine } from '../services/ledgerService';
import { apiClient } from '../api/client';
import type {
  LedgerBlock,
  ChainVerificationResult,
  DisconnectedUnit,
  ReconciliationResult
} from '../types/ledger';

export const useLedgerBlocks = (searchQuery: string = '') => {
  return useQuery<LedgerBlock[]>({
    queryKey: ['ledger-blocks', searchQuery],
    queryFn: async () => {
      try {
        const apiBlocks = await apiClient.get<any[]>('/ledger/blocks');
        if (Array.isArray(apiBlocks) && apiBlocks.length > 0) {
          let list: LedgerBlock[] = apiBlocks.map((b: any) => ({
            blockNumber: b.blockNumber,
            timestamp: b.timestamp,
            merkleRootHash: b.currentHash || b.merkleRootHash,
            previousBlockHash: b.previousHash || b.previousBlockHash,
            validatingNode: b.validatingNode || 'INS Vikrant Central Root Node',
            status: b.status as any || (b.isTampered ? 'Tampered' : 'Finalized'),
            eventCount: b.events?.length || b.eventCount || 1,
            isTampered: Boolean(b.isTampered),
            tamperDetail: b.tamperDetail,
            events: b.events || [],
          }));

          if (searchQuery && searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            list = list.filter(
              (b) =>
                b.blockNumber.toString().includes(q) ||
                b.merkleRootHash.toLowerCase().includes(q) ||
                b.validatingNode.toLowerCase().includes(q) ||
                (b.events && b.events.some((e: any) => (e.eventId && e.eventId.toLowerCase().includes(q)) || (e.recipientPseudonym && e.recipientPseudonym.toLowerCase().includes(q))))
            );
          }
          return list;
        }
      } catch (err) {
        console.warn('Backend ledger blocks unreachable, fallback to store:', err);
      }

      const state = centralStore.getState();
      let blocks: LedgerBlock[] = state.ledgerBlocks.map((b) => {
        if (state.isLedgerTampered && b.blockNumber === state.tamperedBlockNumber) {
          return {
            ...b,
            merkleRootHash: '0xDEADBEEF9910aa112349bc981244dff98012TAMPER',
            status: 'Tampered' as const,
            isTampered: true,
            tamperDetail: 'Merkle root hash does not match block event leaf syndrome. Historical record corruption detected at leaf #2.',
            events: b.events as any,
          };
        }
        return {
          ...b,
          isTampered: false,
          events: b.events as any,
        };
      }) as any;

      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        blocks = blocks.filter(
          (b) =>
            b.blockNumber.toString().includes(q) ||
            b.merkleRootHash.toLowerCase().includes(q) ||
            b.validatingNode.toLowerCase().includes(q) ||
            b.events.some((e) => e.eventId.toLowerCase().includes(q) || e.recipientPseudonym.toLowerCase().includes(q))
        );
      }
      return blocks;
    },
    staleTime: 1000 * 5,
  });
};

export const useVerifyChain = () => {
  const queryClient = useQueryClient();
  return useMutation<ChainVerificationResult, Error, void>({
    mutationFn: async () => {
      try {
        const res = await apiClient.post<any>('/ledger/verify');
        if (res) {
          return {
            isSuccess: Boolean(res.valid),
            totalBlocksVerified: res.totalBlocksVerified || 10,
            failedBlockNumber: res.failedBlockNumber || res.invalidBlock,
            errorReason: res.reason,
            verifiedAt: res.verifiedAt || new Date().toISOString(),
            rootIntegrityScore: res.valid ? 100 : 0,
          };
        }
      } catch (err) {
        console.warn('Backend ledger verify fallback:', err);
      }

      const state = centralStore.getState();
      const result = ledgerEngine.verifyLedgerChain(state.ledgerBlocks);

      return {
        isSuccess: result.isSuccess,
        totalBlocksVerified: result.totalBlocksVerified,
        failedBlockNumber: result.failedBlockNumber,
        errorReason: result.errorReason,
        verifiedAt: result.verifiedAt,
        rootIntegrityScore: result.rootIntegrityScore,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['gmail-notifications'] });
    },
  });
};

export const useTamperSimulation = () => {
  const queryClient = useQueryClient();
  const state = centralStore.getState();
  const [isTampered, setIsTampered] = useState(state.isLedgerTampered);

  const simulateTamper = async () => {
    try {
      await apiClient.post('/ledger/tamper-demo');
    } catch (err) {
      console.warn('Backend tamper-demo fallback:', err);
    }
    centralStore.simulateTamper();
    setIsTampered(true);
    queryClient.invalidateQueries({ queryKey: ['ledger-blocks'] });
    queryClient.invalidateQueries({ queryKey: ['command-center-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  const resetDemo = async () => {
    try {
      await apiClient.post('/ledger/reset-demo');
    } catch (err) {
      console.warn('Backend reset-demo fallback:', err);
    }
    centralStore.resetLedger();
    setIsTampered(false);
    queryClient.invalidateQueries({ queryKey: ['ledger-blocks'] });
    queryClient.invalidateQueries({ queryKey: ['command-center-stats'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
  };

  return {
    isTamperedState: isTampered,
    tamperedBlockNum: state.tamperedBlockNumber,
    simulateTamper,
    resetDemo,
  };
};

export const useDisconnectedUnits = () => {
  return useQuery<DisconnectedUnit[]>({
    queryKey: ['disconnected-units'],
    queryFn: async () => {
      const state = centralStore.getState();
      return state.disconnectedUnits.map((u) => ({
        id: u.id,
        name: u.name,
        callsign: u.callsign,
        offlineSince: u.offlineSince,
        pendingEventCount: u.pendingEventCount,
        emconState: u.emconState,
        sector: u.sector,
      }));
    },
    staleTime: 1000 * 10,
  });
};

export const useReconcileLedger = () => {
  const queryClient = useQueryClient();

  return useMutation<ReconciliationResult, Error, { unitId: string }>({
    mutationFn: async ({ unitId }) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const recon = centralStore.reconcileUnit(unitId);

      return {
        unitId,
        unitName: recon.unitName,
        reconciledAt: new Date().toISOString(),
        eventsMergedCount: recon.eventsMergedCount,
        newBlocksAppended: 1,
        events: [
          {
            eventId: `EVT-REC-${Date.now().toString().slice(-4)}`,
            recipientPseudonym: `${recon.unitName} Terminal`,
            documentId: 'NAV-DOC-2026-0042',
            documentName: 'Mission_Plan_Bravo.pdf',
            timestamp: 'Offline Batch Commit',
            signatureStatus: 'ML-DSA-65 Valid',
            channel: 'Air-Gap Optical Diode Transfer',
            accessType: 'View Only',
            nonce: '88bc12aa',
            merkleLeaf: '0x99aa001923fa...',
          },
        ],
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ledger-blocks'] });
      queryClient.invalidateQueries({ queryKey: ['disconnected-units'] });
    },
  });
};

export const useExportLedgerSegment = () => {
  return useMutation<{ success: boolean; filename: string }, Error, { startBlock: number; endBlock: number }>({
    mutationFn: async ({ startBlock, endBlock }) => {
      const state = centralStore.getState();
      const segmentData = {
        title: 'NAV-TRAC X - Immutable Merkle Ledger Segment Evidence Package',
        exportedAt: new Date().toISOString(),
        validatingAuthority: 'Indian Naval PKI Root CA-01',
        blockRange: `${startBlock} to ${endBlock}`,
        pqcAlgorithm: 'ML-DSA-65 / NIST FIPS 204 Validated',
        blocks: state.ledgerBlocks.filter((b) => b.blockNumber >= startBlock && b.blockNumber <= endBlock),
      };

      const blob = new Blob([JSON.stringify(segmentData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const filename = `NAVTRAC_Ledger_Evidence_Blocks_${startBlock}_${endBlock}_${Date.now()}.json`;

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true, filename };
    },
  });
};
