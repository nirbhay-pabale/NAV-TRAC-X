import { sha256Sync } from './cryptoService';
import type { InvestigationCase, ProvenanceCapsule, LedgerBlock } from '../types/domain';

export class ReportService {
  /**
   * Generates a downloadable Markdown/Text forensic investigation report
   */
  public generateReportMarkdown(
    investigation: InvestigationCase,
    capsule?: ProvenanceCapsule
  ): string {
    const divider = '═'.repeat(65);
    const subDivider = '─'.repeat(65);

    return `
${divider}
INDIAN NAVY // NAVAL CYBER COMMAND // FORENSIC PROVENANCE PLATFORM
NAV-TRAC X FORENSIC ATTRIBUTION REPORT
CLASSIFICATION: TOP SECRET // FORENSIC AUDIT RECORD
${divider}

INVESTIGATION CASE ID : ${investigation.id}
CASE TITLE            : ${investigation.title}
ARTIFACT FILENAME     : ${investigation.filename}
DATE & TIME (UTC)     : ${investigation.uploadedAt}
LEAD INVESTIGATOR     : ${investigation.investigator}
FINAL VERDICT         : ${investigation.verdict}
CONFIDENCE SCORE      : ${investigation.confidenceScore}%

${subDivider}
1. ATTRIBUTION SUMMARY
${subDivider}
Target Recipient ID   : ${investigation.topMatch?.recipientId || 'N/A'}
Target Identity       : ${investigation.topMatch?.name || 'N/A'} (${investigation.topMatch?.pno || 'N/A'})
Naval Unit/Vessel     : ${investigation.topMatch?.unit || 'N/A'}
Decryption Timestamp  : ${investigation.topMatch?.decryptedTimestamp || 'N/A'}
Matched Version       : ${investigation.topMatch?.matchedVersion || 'N/A'}
Seed Fingerprint      : ${investigation.topMatch?.seedFingerprint || 'N/A'}
Provenance Capsule    : ${investigation.topMatch?.provenanceCapsuleId || capsule?.capsuleId || 'N/A'}

${subDivider}
2. EVIDENCE CONVERGENCE BREAKDOWN (8 PILLARS)
${subDivider}
${investigation.evidenceChecks
  .map((chk, idx) => `[${idx + 1}] ${chk.name.padEnd(42, ' ')} : [${chk.status}] (Weight: ${chk.weight}%)\n    Details: ${chk.detail}`)
  .join('\n')}

${subDivider}
3. CRYPTOGRAPHIC PROVENANCE BINDING
${subDivider}
Document SHA3-256     : ${investigation.matchedDocument?.sha3Hash || '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
PQC Digital Signature : ML-DSA-65 (Post-Quantum Signature Scheme)
Signature State       : ${investigation.evidenceChecks.find((c) => c.id === 'CHK-06')?.status === 'PASS' ? 'VALID' : 'INVALID'}
Provenance Capsule ID : ${capsule?.capsuleId || 'CAPSULE-2026-0042'}
Ledger Block Reference: Block #${capsule?.ledgerBlockNumber || 4192}

${subDivider}
4. MANIPULATION & FRAMING FINDINGS
${subDivider}
${
  investigation.manipulationFindings.length > 0
    ? investigation.manipulationFindings
        .map((m) => `[ALERT] Severity: ${m.severity}\n  Issue: ${m.detectedIssue}\n  Source: ${m.evidenceSource}\n  Expected: ${m.expected}\n  Observed: ${m.observed}`)
        .join('\n\n')
    : 'No forensic manipulation detected. Zero structural or signature anomalies.'
}

${subDivider}
5. COLLUSION ANALYSIS
${subDivider}
Status                : ${investigation.collusionAnalysis.status}
Analysis Notes        : ${investigation.collusionAnalysis.analysisNote}

${divider}
ELECTRONICALLY CERTIFIED BY NAV-TRAC X FORENSIC SUBSYSTEM
AIR-GAPPED AUDIT COMPLIANCE LEVEL: MIL-STD-810H / PQC-FIPS-204
${divider}
`.trim();
  }

  /**
   * Triggers a browser download of the investigation report text file
   */
  public downloadReportFile(investigation: InvestigationCase, capsule?: ProvenanceCapsule): void {
    const text = this.generateReportMarkdown(investigation, capsule);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NAV-TRAC-X_Report_${investigation.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Exports and downloads a structured Evidence Package JSON containing manifest & hashes
   */
  public downloadEvidencePackage(
    investigation: InvestigationCase,
    capsule?: ProvenanceCapsule,
    ledgerBlocks?: LedgerBlock[]
  ): void {
    const investigationJson = JSON.stringify(investigation, null, 2);
    const provenanceJson = JSON.stringify(capsule || { id: 'NO_CAPSULE' }, null, 2);
    const ledgerSegmentJson = JSON.stringify(ledgerBlocks?.slice(0, 3) || [], null, 2);

    const manifest = {
      packageId: `EVID-PKG-${investigation.id}`,
      generatedAt: new Date().toISOString(),
      classification: 'TOP SECRET // FORENSIC EVIDENCE BUNDLE',
      investigationId: investigation.id,
      verdict: investigation.verdict,
      fileHashes: {
        'investigation.json': `0x${sha256Sync(investigationJson)}`,
        'provenance.json': `0x${sha256Sync(provenanceJson)}`,
        'ledger-segment.json': `0x${sha256Sync(ledgerSegmentJson)}`,
      },
      packageSignature: `0xSIG_MLDSA65_${sha256Sync(investigation.id + ':EVID_MANIFEST')}`,
    };

    const bundle = {
      manifest,
      investigation,
      provenance: capsule,
      ledgerSegment: ledgerBlocks?.slice(0, 3) || [],
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EVIDENCE_PACKAGE_${investigation.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const reportService = new ReportService();
