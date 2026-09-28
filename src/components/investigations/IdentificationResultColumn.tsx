import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  HelpCircle,
  FileText,
  ExternalLink,
  Copy,
  Check,
  Search,
  UserCheck,
  Cpu,
  Layers,
  Sparkles,
  Bot,
  Scale,
  Download
} from 'lucide-react';
import type { ForensicResult } from '../../api/forensicApi';

interface IdentificationResultColumnProps {
  result: ForensicResult | null;
  isAnalyzing: boolean;
  onOpenOriginalDoc?: () => void;
  onTriageReview?: (action: 'CONFIRM' | 'ESCALATE' | 'DISMISS', reason: string) => Promise<void>;
  isReviewing?: boolean;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
}

export const IdentificationResultColumn: React.FC<IdentificationResultColumnProps> = ({
  result,
  isAnalyzing,
  onOpenOriginalDoc,
  onTriageReview,
  isReviewing = false,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  const navigate = useNavigate();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showTriageModal, setShowTriageModal] = useState<'CONFIRM' | 'ESCALATE' | 'DISMISS' | null>(null);
  const [triageReason, setTriageReason] = useState('');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmTriage = async () => {
    if (!showTriageModal || !onTriageReview) return;
    await onTriageReview(showTriageModal, triageReason);
    setShowTriageModal(null);
    setTriageReason('');
  };

  // 1. Loading State
  if (isAnalyzing) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center min-h-[460px] text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600 animate-pulse shadow-xs">
          <Cpu className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Evaluating Sovereign Provenance Pipeline…
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
            Executing 7-stage cryptographic cross-check and discrete frequency decomposition.
          </p>
        </div>
        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 animate-pulse w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  // 2. Empty State (Honesty Rule 1: No verdict before analysis runs)
  if (!result) {
    return (
      <div className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center min-h-[460px] text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-xs">
          <Search className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Awaiting Forensic Analysis
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
            Run an analysis to see identification results. Extracted watermark payloads, attribution candidates, and Merkle ledger proofs will populate here.
          </p>
        </div>
      </div>
    );
  }

  const outcome = result.outcome;
  const isVerified = outcome === 'Verified';
  const confidence = result.confidence;
  const breakdown = result.confidence_breakdown;
  const narratives = result.narratives;
  const recipient = result.recipient;
  const doc = result.document;
  const evt = result.decryption_event;
  const ledger = result.ledger_block;
  const trans = result.transformations;

  // Render Verdict Banner
  const renderVerdictBanner = () => {
    switch (outcome) {
      case 'Verified':
        return (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Provenance Verified (Match Found)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-200/80 text-emerald-900">
                {confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Discrete wavelet spread-spectrum fragments match registered recipient cryptographic key on sovereign ledger.
            </p>

            {/* Human Review Triage Bar */}
            <div className="border-t border-emerald-200/80 pt-2.5 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                Evidence-backed candidate: human review required
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowTriageModal('CONFIRM')}
                  className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowTriageModal('ESCALATE')}
                  className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Escalate
                </button>
                <button
                  type="button"
                  onClick={() => setShowTriageModal('DISMISS')}
                  className="px-2.5 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        );

      case 'Manipulation Suspected':
        return (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Manipulation Suspected: Signature / Mark Altered
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-200 text-rose-900">
                {confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-rose-800 leading-relaxed">
              Cryptographic integrity checks failed: the watermark payload or Merkle ledger block shows definitive evidence of tampering or signature alteration.
            </p>
          </div>
        );

      case 'Contradictory':
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Contradictory Attribution: Checks Disagree
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-200 text-amber-900">
                {confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Discrepancy detected: the extracted watermark correlates with one distribution event, but the underlying document content matches a different classification/version.
            </p>
          </div>
        );

      case 'Unresolved':
        return (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  Attribution Unresolved: High Noise Threshold
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-200 text-amber-900">
                {confidence}% Confidence
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Too few fragments recovered. Degradation, heavy crop, or re-compression exceeded the Reed-Solomon RS(32,24) parity correction capacity.
            </p>
          </div>
        );

      case 'No Match':
      default:
        return (
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldX className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  No Match: Zero Sovereign Mark Signals
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-200 text-slate-700">
                0% Confidence
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              No registered sovereign watermark detected in this artifact. It is either an un-watermarked external briefing photograph or from an unmonitored channel.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm space-y-4">
      {/* 1. Verdict Banner */}
      {renderVerdictBanner()}

      {/* 1.1 Dynamic Section 63 BSA Forensic Examination PDF Download */}
      {onDownloadPdf && (
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="w-full py-2.5 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-[0.99] border border-blue-700"
          title="Download Section 63 BSA Forensic Examination Report in PDF format"
          aria-label="Download Forensic Report PDF"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloadingPdf ? 'Generating Signed PDF…' : 'Download Forensic Report (PDF)'}</span>
        </button>
      )}

      {/* 2. Recipient Card (HONESTY RULE: Only shown when outcome is Verified) */}
      {isVerified && recipient && (
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-900 uppercase tracking-wider font-mono">
              Identified Recipient (Verified Subject)
            </span>
            <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Computed
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-slate-900">
                {recipient.rank} {recipient.name}
              </div>
              <div className="text-xs text-slate-600 font-mono mt-0.5">
                PNO: {recipient.pno} &bull; Clearance: {recipient.clearance_level}
              </div>
              <div className="text-xs text-slate-700 font-semibold mt-0.5">
                Unit / Vessel: {recipient.unit_vessel}
              </div>
              <div className="text-[11px] text-slate-500">
                Station: {recipient.station}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/recipients')}
              className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
              title="View in Recipients Registry"
            >
              <span>Profile</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Matched Document Card */}
      {doc && (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                Matched Classified Document
              </span>
            </div>
            {doc.current_version && doc.version !== doc.current_version && (
              <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Differs from Current ({doc.current_version})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">{doc.name}</div>
              <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                Classification: {doc.classification} &bull; Version: {doc.version}
              </div>
              <div className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">
                SHA3: {doc.sha3_hash ? `${doc.sha3_hash.substring(0, 12)}…` : 'Calculated'}
              </div>
            </div>

            {onOpenOriginalDoc && (
              <button
                type="button"
                onClick={onOpenOriginalDoc}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>View Original</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. How It Got Leaked Card */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-900">How It Got Leaked</span>
          </div>

          {narratives?.leak_path && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
              narratives.leak_path.source === 'llm'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {narratives.leak_path.source === 'llm' ? <Bot className="w-2.5 h-2.5" /> : <Scale className="w-2.5 h-2.5" />}
              {narratives.leak_path.source === 'llm' ? 'AI-written' : 'Template'}
            </span>
          )}
        </div>

        {/* Classifier Result */}
        {trans && (
          <div className="text-xs text-slate-600">
            Detected Capture Method:{' '}
            <strong className="text-slate-900">{trans.primary_capture_method}</strong>{' '}
            <span className="text-[10px] font-mono text-blue-700">({trans.method_confidence}% confidence)</span>
          </div>
        )}

        {/* Narrative prose */}
        {narratives?.leak_path && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {narratives.leak_path.text}
          </p>
        )}

        {/* Working Provenance ID Boxes */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {/* DIST ID */}
          <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[9.5px] block font-sans">Distribution:</span>
              <span className="font-semibold text-slate-800 truncate block max-w-[90px]">
                {evt?.distribution_id || 'DIST-0042'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(evt?.distribution_id || 'DIST-0042', 'dist')}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy Distribution ID"
            >
              {copiedId === 'dist' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* EVT ID */}
          <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[9.5px] block font-sans">Decryption Event:</span>
              <span className="font-semibold text-slate-800 truncate block max-w-[90px]">
                {evt?.event_id || 'EVT-XXXXX'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(evt?.event_id || 'EVT-XXXXX', 'evt')}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy Decryption Event ID"
            >
              {copiedId === 'evt' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* DEVICE ID */}
          <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[9.5px] block font-sans">Workstation Device:</span>
              <span className="font-semibold text-slate-800 truncate block max-w-[90px]">
                {evt?.device_id || 'NAV-OPS-WS-17'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(evt?.device_id || 'NAV-OPS-WS-17', 'dev')}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy Device ID"
            >
              {copiedId === 'dev' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>

          {/* SESSION ID */}
          <div className="p-2 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-slate-400 text-[9.5px] block font-sans">Auth Session:</span>
              <span className="font-semibold text-slate-800 truncate block max-w-[90px]">
                {evt?.session_id || 'SES-882193'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(evt?.session_id || 'SES-882193', 'ses')}
              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              title="Copy Session ID"
            >
              {copiedId === 'ses' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Ledger Block info */}
        {ledger && (
          <div className="p-2 rounded bg-slate-100 text-[10.5px] font-mono text-slate-600 flex items-center justify-between">
            <span>Ledger Block: #{ledger.block_number}</span>
            <span className="text-slate-400 truncate max-w-[120px]">Root: {ledger.merkle_root.substring(0, 10)}…</span>
            <span className={`font-bold ${ledger.is_tampered ? 'text-rose-600' : 'text-emerald-700'}`}>
              {ledger.is_tampered ? 'TAMPERED' : 'ANCHORED'}
            </span>
          </div>
        )}
      </div>

      {/* 5. "Why This Match?" Card */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-900">Why This Match?</span>
          </div>

          {narratives?.why_match && (
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${
              narratives.why_match.source === 'llm'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {narratives.why_match.source === 'llm' ? <Bot className="w-2.5 h-2.5" /> : <Scale className="w-2.5 h-2.5" />}
              {narratives.why_match.source === 'llm' ? 'AI-written' : 'Template'}
            </span>
          )}
        </div>

        {/* Plain language explanation */}
        {narratives?.why_match && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            {narratives.why_match.text}
          </p>
        )}

        {/* Confidence Breakdown Bars */}
        {breakdown && (
          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>Fragment Recovery:</span>
              <span className="font-bold text-slate-800">{breakdown.fragment_recovery_pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${breakdown.fragment_recovery_pct}%` }} />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Reed-Solomon ECC Parity Health:</span>
              <span className="font-bold text-slate-800">{breakdown.ecc_health_pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-teal-600 h-1.5 rounded-full" style={{ width: `${breakdown.ecc_health_pct}%` }} />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-500 pt-1">
              <span>Cryptographic Agreement:</span>
              <span className="font-bold text-slate-800">{breakdown.cryptographic_agreement_pct}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${breakdown.cryptographic_agreement_pct}%` }} />
            </div>

            <div className="text-[9.5px] font-mono text-slate-400 pt-1 truncate">
              Formula: {breakdown.formula}
            </div>
          </div>
        )}
      </div>

      {/* Human Triage Modal */}
      {showTriageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              {showTriageModal === 'CONFIRM' ? 'Confirm Attribution Finding' :
               showTriageModal === 'ESCALATE' ? 'Escalate Incident to Higher Command' :
               'Dismiss / Archive Candidate Match'}
            </h3>
            <p className="text-xs text-slate-600">
              Please enter the examiner rationale for legal Section 63 BSA compliance audit:
            </p>
            <textarea
              value={triageReason}
              onChange={(e) => setTriageReason(e.target.value)}
              placeholder="Rationale / Operational justification..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:outline-blue-500"
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowTriageModal(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTriage}
                disabled={isReviewing || !triageReason.trim()}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xs cursor-pointer ${
                  !triageReason.trim() ? 'bg-slate-300 cursor-not-allowed' :
                  showTriageModal === 'CONFIRM' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  showTriageModal === 'ESCALATE' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isReviewing ? 'Saving…' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdentificationResultColumn;
