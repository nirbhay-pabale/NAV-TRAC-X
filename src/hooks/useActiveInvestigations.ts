import { useQuery } from '@tanstack/react-query';
import { centralStore } from '../data/centralStore';
import type { InvestigationCase } from '../types/commandCenter';

export const useActiveInvestigations = () => {
  return useQuery({
    queryKey: ['active-investigations'],
    queryFn: async (): Promise<InvestigationCase[]> => {
      const state = centralStore.getState();
      return state.investigations.map((inv) => ({
        caseId: inv.id,
        artifact: inv.filename,
        artifactSize: `${(inv.artifact.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`,
        progress: inv.progress,
        status: inv.status as any,
        statusType:
          inv.verdict === 'PROVENANCE VERIFIED'
            ? 'teal'
            : inv.verdict === 'MANIPULATION SUSPECTED' || inv.verdict === 'CONTRADICTORY EVIDENCE'
            ? 'red'
            : 'orange',
        openedAt: inv.uploadedAt,
        assignedOfficer: inv.investigator,
        targetUnit: inv.topMatch ? inv.topMatch.unit : 'UNKNOWN / EXTERNAL',
        forensicSteps: [
          {
            step: 'Steganographic Watermark Extraction',
            completed: inv.evidenceChecks.find((c) => c.id === 'CHK-01')?.status === 'PASS',
            result: inv.topMatch ? `Matched Seed ${inv.topMatch.seedFingerprint}` : 'Degraded Signal',
          },
          {
            step: 'Cryptographic Ledger Hash Match',
            completed: inv.evidenceChecks.find((c) => c.id === 'CHK-07')?.status === 'PASS',
            result: inv.topMatch ? 'Block #4192 Verified' : 'No Leaf Correlation',
          },
          {
            step: 'Zero-Knowledge Signature Verification',
            completed: inv.evidenceChecks.find((c) => c.id === 'CHK-06')?.status === 'PASS',
            result: inv.evidenceChecks.find((c) => c.id === 'CHK-06')?.status === 'PASS' ? 'ML-DSA-65 Valid' : 'Signature Failed',
          },
          {
            step: 'Recipient Unit Attribution & Audit Trail',
            completed: inv.status === 'Identified',
            result: inv.topMatch ? `Attributed to ${inv.topMatch.name}` : 'Unresolved',
          },
        ],
      }));
    },
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });
};
