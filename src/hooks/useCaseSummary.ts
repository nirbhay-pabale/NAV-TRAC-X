import { useMemo } from 'react';

export interface CaseSummaryData {
  caseId: string;
  status: 'In Progress' | 'Verified' | 'Unresolved' | 'Contradictory';
  checksPassed: string;
  checksPassedRatio: number; // e.g. 5/7
  matchedRecipientName: string;
  matchedRecipientConfidence: string;
  matchedRecipientUnit: string;
  documentVersion: string;
  documentVersionPill: string;
  timeToAttribution: string;
  timeToAttributionPill: string;
  leakedArtifactHash: string;
  documentName: string;
  classification: string;
  distributionCount: string;
  reviewingOfficer: {
    name: string;
    role: string;
    sla: string;
  };
}

export const useCaseSummary = (caseId: string = 'INV-2026-0042'): CaseSummaryData => {
  return useMemo(() => {
    const isContradictory = caseId.includes('0041') || caseId.includes('0043') || caseId.includes('0038');
    const isUnresolved = caseId.includes('0040') || caseId.includes('0045') || caseId.includes('0039');

    if (isContradictory) {
      return {
        caseId,
        status: 'Contradictory',
        checksPassed: '3 / 7',
        checksPassedRatio: 3 / 7,
        matchedRecipientName: 'Signature Mismatch',
        matchedRecipientConfidence: '48.2%',
        matchedRecipientUnit: 'Tampered Payload Detected',
        documentVersion: 'v1.8',
        documentVersionPill: 'Discrepancy in hash',
        timeToAttribution: '12.4 ms',
        timeToAttributionPill: 'Anomaly Flagged',
        leakedArtifactHash: 'f41c9019aa782e1189ac39b2011239aa8841c',
        documentName: 'Tactical_Intel_Briefing.pdf',
        classification: 'SECRET',
        distributionCount: '8 recipients',
        reviewingOfficer: {
          name: 'Capt. Siddharth Verma',
          role: 'Head of Communications & Cryptography',
          sla: '24 Hr SLA'
        }
      };
    }

    if (isUnresolved) {
      return {
        caseId,
        status: 'Unresolved',
        checksPassed: '1 / 7',
        checksPassedRatio: 1 / 7,
        matchedRecipientName: 'Unassigned Signal',
        matchedRecipientConfidence: 'Low Signal',
        matchedRecipientUnit: 'Insufficient watermark data',
        documentVersion: 'v3.0',
        documentVersionPill: 'Spectral degradation',
        timeToAttribution: '4.80 ms',
        timeToAttributionPill: 'Signal Inconclusive',
        leakedArtifactHash: 'ee091189aa2233b87910aa112349bc981244d',
        documentName: 'Fleet_Logistics_Matrix.docx',
        classification: 'CONFIDENTIAL',
        distributionCount: '24 recipients',
        reviewingOfficer: {
          name: 'Cdr. A. Mehta',
          role: 'Chief Operations Officer',
          sla: '24 Hr SLA'
        }
      };
    }

    // Default: Verified case (e.g. INV-2026-0042)
    return {
      caseId: caseId || 'INV-2026-0042',
      status: 'In Progress',
      checksPassed: '7 / 7',
      checksPassedRatio: 7 / 7,
      matchedRecipientName: 'INS Visakhapatnam',
      matchedRecipientConfidence: '98.2%',
      matchedRecipientUnit: 'D66 (Western Fleet)',
      documentVersion: 'v2.1',
      documentVersionPill: 'Matches leaked copy',
      timeToAttribution: '8.42 ms',
      timeToAttributionPill: 'Verified on ledger',
      leakedArtifactHash: 'a9e4f291bb8a4e10c78912d7c00192ea7732b',
      documentName: 'Mission_Plan_Bravo.pdf',
      classification: 'TOP SECRET (CODEWORD)',
      distributionCount: '12 recipients',
      reviewingOfficer: {
        name: 'Insp. A. Thube / Cdr. Mehta',
        role: 'Naval Cyber Command Liaison Officer',
        sla: '24 Hr SLA'
      }
    };
  }, [caseId]);
};
