import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Scale,
  Layers
} from 'lucide-react';
import type { AnalyzeArtifactResponse } from '../../types/forensic';

interface EvidenceDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  result?: AnalyzeArtifactResponse | null;
}

export const EvidenceDossierModal: React.FC<EvidenceDossierModalProps> = ({
  isOpen,
  onClose,
  caseId = 'INV-2026-0042',
  result
}) => {
  const [activeTab, setActiveTab] = useState<'certificate' | 'evidenceChain' | 'actions'>('certificate');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Safe fallback metadata
  const outcome = result?.outcome || 'verified';
  const confidence = result?.confidence ?? 98.0;
  const fileName = result?.fileName || 'leaked_mission_plan.jpg';
  const fileHash = result?.fileHash || 'a9e4f291bb8a4e10c78912d7c00192ea7732b';
  const recipient = result?.recipient || {
    name: 'Cdr. A. Mehta, IN',
    rank: 'Commander',
    pno: '04821-K',
    unitVessel: 'INS Visakhapatnam (D66)',
    station: 'Western Fleet HQ',
    clearance: 'TOP SECRET (CODEWORD)',
  };
  const document = result?.document || {
    name: 'Mission_Plan_Bravo.pdf',
    version: 'v2.1',
    classification: 'TOP SECRET (CODEWORD)',
    distributedOn: '26 Sep 2026 18:03:11Z',
    distributedBy: 'Western Naval Command',
    totalRecipients: 12,
  };
  const event = result?.event || {
    eventId: 'EVT-88420',
    ledgerBlock: '#4,192',
    decryptionTime: '27 Sep 2026 04:54:12Z',
    merkleRoot: '0x88f21ac0...4910e1',
  };
  const watermark = result?.watermarkDetails || {
    method: 'Dual-Domain (Micro-Kerning + DWT-DCT SVD)',
    txHash: '0x7a3f2901bb8a4e1088cf912781b0a234',
    nonce: '9a38f71c',
    errorCorrection: 'Reed-Solomon RS(64,32)',
    detectedAt: 'Decryption Event (In-Memory)',
  };

  const certificateText = `FORENSIC PROVENANCE CERTIFICATE UNDER SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
(Corresponding to Section 65B of Indian Evidence Act, 1872)

================================================================================
CASE REFERENCE: ${caseId}
SECURITY CLASSIFICATION: ${document.classification}
DATE OF ANALYSIS: 28/09/2026 13:20:00 UTC
ISSUING NODE: NAV-TRAC X Autonomous Forensic Engine (Air-Gapped Sovereign Node #04)
ISSUED UNDER THE AUTHORITY OF: Directorate of Naval Intelligence (DNI), Naval HQ

1. TARGET LEAKED ARTIFACT PARTICULARS:
   - Artifact Filename: ${fileName}
   - SHA3-256 Digest: ${fileHash}
   - Geometric Rectification: Affine Perspective Normalization Completed
   - Spectral Domain Extraction: 2D DWT-DCT SVD Frequency Decomposition (Passed)
   - Recovered Watermark Nonce: ${watermark.nonce}
   - Forward Error Correction: ${watermark.errorCorrection}

2. CORRELATED PROVENANCE EVENT & RECIPIENT ATTRIBUTION:
   - Correlated Recipient: ${recipient.name} (${recipient.rank})
   - Service No / PNO: ${recipient.pno}
   - Station / Assigned Unit: ${recipient.unitVessel} (${recipient.station})
   - Security Clearance Level: ${recipient.clearance}
   - Decryption Event Identifier: ${event.eventId}
   - Authorized Decryption Timestamp: ${event.decryptionTime}
   - Sovereign Ledger Block Anchor: ${event.ledgerBlock} (Merkle Root: ${event.merkleRoot})
   - Attribution Confidence Index: ${confidence}% (${outcome.toUpperCase()})

3. POST-QUANTUM CRYPTOGRAPHIC VERIFICATION MATRIX:
   [✓] Artifact Ingestion & Integrity Check: PASS (SHA3-256 Match)
   [✓] DWT-DCT SVD Frequency Decomposition: PASS (99.2% Bit-Plane Concordance)
   [✓] Dynamic Session Watermark Nonce: MATCH (Seed ${watermark.nonce})
   [✓] Recipient Public Key Signature: VALID (NIST FIPS 204 ML-DSA-65 Quantum-Resistant)
   [✓] Ephemeral Envelope Key Encapsulation: VALID (NIST FIPS 203 ML-KEM-768)
   [✓] Immutable Sovereign Ledger Anchor: CONFIRMED (Block ${event.ledgerBlock})
   [✓] Cryptographic Authorization Policy: VERIFIED (Dual-Officer Quorum Satisfied)

4. STATUTORY DECLARATION UNDER SECTION 63 BSA, 2023:
   I hereby certify that the electronic record identified above was produced by the NAV-TRAC X secure provenance platform during the ordinary course of sovereign naval communication activities. The cryptographic hash, watermark payload, and zero-knowledge ledger verification mechanisms operated properly without tampering throughout the material period.

   This certificate supports investigation and evidentiary review of electronic records. It is not a determination of admissibility.

[DEMO SIGNATURE BLOCK]
Signer: NAV-TRAC Sovereign HSM Root CA
Algorithm: ML-DSA-65 (NIST FIPS 204)
Signature Hash: 7b84f3e1a029c882d19484b901f4c3a288921df048bb71c29e1276a44c92a912
Ledger Anchor: Block ${event.ledgerBlock} • Merkle Root: ${event.merkleRoot}`;

  const evidenceChainText = `CRYPTOGRAPHIC AUDIT CHAIN & LEDGER VERIFICATION LOG

Case ID: ${caseId}
Document: ${document.name} (${document.version})
Distribution Timestamp: ${document.distributedOn}

--- HOP 1: DOCUMENT INGESTION & MASTER ENCRYPTION ---
• Originating Authority: ${document.distributedBy}
• Canonical Document SHA3-256: 4f82a910dc847b6a100234f9a7788102dca941829e102f9a77b8192a0149bb10
• Post-Quantum Key Encapsulation: NIST FIPS 203 (ML-KEM-768)
• Sovereign HSM Anchor ID: HSM-IN-HQ-PRIMARY-01
• Ledger Transaction: 0x94821a00fc21894d812034981ba0174c88319a

--- HOP 2: BROADCAST & INDIVIDUAL RECIPIENT WATERMARKING ---
• Total Targeted Nodes: ${document.totalRecipients} Authorized Fleet Recipients
• Recipient Unit: ${recipient.unitVessel} (${recipient.name})
• Micro-Kerning Displacement Vector: 0.12pt Dynamic Space Perturbation
• DWT High-Frequency Wavelet Band: LH & HL Sub-bands (alpha=0.035)
• Unique Watermark Payload: [TX: ${watermark.txHash} | Nonce: ${watermark.nonce}]

--- HOP 3: CLIENT-SIDE DECRYPTION & VIEW EVENT ---
• Local Device Node: ${recipient.unitVessel} Secure Terminal #02
• Decryption Event ID: ${event.eventId}
• Timestamp: ${event.decryptionTime}
• ZK Proof Generation: Groth16 Snark Prover v1.4 (Proof Size: 256 bytes)
• Attestation Status: Verified by Sovereign Consensus Committee

--- HOP 4: RECOVERY & CROSS-CORRELATION ---
• Recovered Payload Match: 100% Bit-level Agreement with Block ${event.ledgerBlock}
• Cross-Unit Collision Probability: < 1.2 x 10^-14 (Cryptographically Negligible)
• Final Finding: Conclusive provenance attribution to ${recipient.unitVessel}.`;

  const recommendedActionsText = `RECOMMENDED OPERATIONAL & SECURITY ACTIONS

Case: ${caseId} • Target: ${recipient.unitVessel} (${recipient.name})
Attribution Confidence: ${confidence}%

1. IMMEDIATE ACCESS CONTROL RESTRICTIONS:
   [ACTION REQUIRED] Revoke active ML-KEM recipient keys for ${recipient.unitVessel}.
   [ACTION REQUIRED] Suspend terminal station token at ${recipient.station}.
   [STATUS: READY] Emergency Key Revocation payload prepared for broadcast on Ledger.

2. STATUTORY LEGAL NOTICES (BNSS / BSA):
   [DRAFT READY] Formulate Notice under Section 94 BNSS, 2023 to secure hardware node.
   [DRAFT READY] Statutory Preservation Order under Section 106 BNSS, 2023 for terminal logs.

3. NAVAL COMMAND NOTIFICATION:
   • Transmit Section 63 BSA Dossier to Western Naval Command Provost Marshal.
   • Convene Preliminary Court of Inquiry (CoI) regarding classified operational breach.
   • Re-classify compromised operational sector in Mission Plan Bravo.`;

  const getActiveContent = () => {
    switch (activeTab) {
      case 'certificate':
        return certificateText;
      case 'evidenceChain':
        return evidenceChainText;
      case 'actions':
        return recommendedActionsText;
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getActiveContent());
    setCopied(true);
    setToastMessage('Dossier text copied to clipboard');
    setTimeout(() => {
      setCopied(false);
      setToastMessage(null);
    }, 2500);
  };

  const handleDownloadPdf = () => {
    setDownloading(true);
    setToastMessage('Downloading Section 63 BSA Forensic Examination Report (PDF)...');

    const link = window.document.createElement('a');
    link.href = `/api/reports/${caseId}.pdf`;
    link.download = `Forensic_Report_${caseId}.pdf`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);

    setTimeout(() => {
      setDownloading(false);
      setToastMessage('Signed Forensic Report (.pdf) Downloaded');
      setTimeout(() => setToastMessage(null), 2500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 id="dossier-title" className="text-base font-bold text-[#0F172A] tracking-tight">
                Forensic Provenance Certificate & Evidence Dossier
              </h2>
              <p className="text-xs text-[#64748B]">
                Case: <span className="font-semibold text-[#0F172A]">{caseId}</span> • Artifact:{' '}
                <span className="font-mono text-slate-700">{fileHash.slice(0, 10)}...{fileHash.slice(-6)}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'certificate'
                ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Sec 63 BSA (Forensic Provenance Certificate)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evidenceChain')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'evidenceChain'
                ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Evidence Chain (Cryptographic Proof)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('actions')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'actions'
                ? 'border-[#2563EB] text-[#2563EB] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Recommended Actions</span>
          </button>
        </div>

        {/* Body Content Box */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#F8FAFC]">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap select-text">
            {getActiveContent()}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy Certificate Text'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-semibold transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Exporting PDF...' : 'Download Official Signed PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1B3A] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 text-xs font-sans font-medium flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default EvidenceDossierModal;
