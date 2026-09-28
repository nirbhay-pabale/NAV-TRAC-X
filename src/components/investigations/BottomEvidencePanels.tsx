import React, { useState } from 'react';
import {
  Copy,
  Check,
  Fingerprint,
  Sparkles,
  Layers,
  Flame
} from 'lucide-react';
import type { ForensicResult } from '../../api/forensicApi';

interface BottomEvidencePanelsProps {
  result: ForensicResult | null;
  caseId: string;
  filename: string;
  onOpenEvidenceModal: (evidenceType: string) => void;
}

export const BottomEvidencePanels: React.FC<BottomEvidencePanelsProps> = ({
  result,
  caseId,
  filename,
  onOpenEvidenceModal,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedTx, setCopiedTx] = useState(false);

  if (!result) return null;

  const copyToClipboard = async (text: string, type: 'hash' | 'tx') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'hash') {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 1500);
      } else {
        setCopiedTx(true);
        setTimeout(() => setCopiedTx(false), 1500);
      }
    } catch {
      // fallback
    }
  };

  const isVerified = result.outcome === 'Verified';
  const recipient = isVerified ? result.recipient : null;
  const doc = result.document;
  const evt = result.decryption_event;
  const ledger = result.ledger_block;
  const vis = result.visual_evidence;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 animate-fadeIn">
      {/* 1. Case Summary */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
            Case Summary
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Case ID:</span>
              <span className="text-blue-700 font-bold">{caseId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">File Name:</span>
              <span className="text-slate-900 font-medium truncate max-w-[130px]">{filename}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">SHA3-256:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(doc?.sha3_hash || 'SHA3-CALCULATED', 'hash')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono focus:outline-none rounded px-1 cursor-pointer"
                title="Copy SHA3-256 Hash"
              >
                <span>{(doc?.sha3_hash || 'SHA3-HASH').substring(0, 10)}…</span>
                {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Confidence:</span>
              <span className="text-slate-800 font-bold">{result.confidence}%</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10.5px]">Verdict:</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
            isVerified
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : result.outcome === 'Unresolved'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            ● {result.outcome}
          </span>
        </div>
      </div>

      {/* 2. Extracted Evidence (4 Aligned Views) */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2.5">
            Extracted Evidence Matrix
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {/* 1. Heatmap */}
            <div
              onClick={() => onOpenEvidenceModal('heatmap')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 cursor-pointer transition-all flex flex-col items-center justify-between aspect-[1.3] overflow-hidden group"
              role="button"
              tabIndex={0}
            >
              {vis?.heatmap_url ? (
                <img src={vis.heatmap_url} alt="Heatmap" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <Flame className="w-6 h-6 text-amber-500 my-auto" />
              )}
              <span className="text-[9px] font-mono text-amber-400 font-bold">Heatmap (SVD)</span>
            </div>

            {/* 2. Spectral FFT */}
            <div
              onClick={() => onOpenEvidenceModal('spectral')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-purple-400 cursor-pointer transition-all flex flex-col items-center justify-between aspect-[1.3] overflow-hidden group"
              role="button"
              tabIndex={0}
            >
              {vis?.spectral_url ? (
                <img src={vis.spectral_url} alt="Spectral FFT" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <Sparkles className="w-6 h-6 text-purple-400 my-auto" />
              )}
              <span className="text-[9px] font-mono text-purple-300 font-bold">Spectral (FFT)</span>
            </div>

            {/* 3. Fingerprint Map */}
            <div
              onClick={() => onOpenEvidenceModal('fingerprint')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-blue-400 cursor-pointer transition-all flex flex-col items-center justify-between aspect-[1.3] overflow-hidden group"
              role="button"
              tabIndex={0}
            >
              {vis?.fingerprint_map_url ? (
                <img src={vis.fingerprint_map_url} alt="Fingerprint" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <Fingerprint className="w-6 h-6 text-blue-400 my-auto" />
              )}
              <span className="text-[9px] font-mono text-blue-300 font-bold">Fingerprint Map</span>
            </div>

            {/* 4. Processed Image */}
            <div
              onClick={() => onOpenEvidenceModal('processed')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-400 cursor-pointer transition-all flex flex-col items-center justify-between aspect-[1.3] overflow-hidden group"
              role="button"
              tabIndex={0}
            >
              {vis?.processed_url ? (
                <img src={vis.processed_url} alt="Processed" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <Layers className="w-6 h-6 text-emerald-400 my-auto" />
              )}
              <span className="text-[9px] font-mono text-emerald-300 font-bold">Processed Matrix</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Watermark Details */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
            Watermark Details
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Algorithm:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[130px]">2D DWT-DCT SVD</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Codec:</span>
              <span className="text-slate-800">RS(32,24) Parity ECC</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500">Merkle Root:</span>
              <button
                type="button"
                onClick={() => copyToClipboard(ledger?.merkle_root || '0xMerkleRoot', 'tx')}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-mono focus:outline-none rounded px-1 cursor-pointer"
                title="Copy Merkle Root"
              >
                <span>{(ledger?.merkle_root || '0xMerkleRoot').substring(0, 10)}…</span>
                {copiedTx ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Signature:</span>
              <span className="text-slate-700 truncate max-w-[120px]">
                {evt?.signature_scheme || 'Demo signature scheme'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10.5px]">Ledger Status:</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
            ledger && !ledger.is_tampered
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {ledger && !ledger.is_tampered ? '● Anchored on Chain' : '● Mismatch / Tampered'}
          </span>
        </div>
      </div>

      {/* 4. Source Context */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-3">
            Source Context
          </h3>

          <div className="space-y-2 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Classification:</span>
              <span className="text-rose-700 font-bold">{doc?.classification || 'CLASSIFIED'}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Vessel / Unit:</span>
              <span className="text-slate-900 font-semibold truncate max-w-[130px]">
                {recipient ? recipient.unit_vessel : 'Attribution Pending'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Station:</span>
              <span className="text-slate-700 truncate max-w-[130px]">
                {recipient ? recipient.station : 'Unattributed'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Event Nonce:</span>
              <span className="text-slate-800">{evt?.event_id || 'EVT-XXXXX'}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[10.5px]">Legal Integrity:</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
            Section 63 BSA Compliant
          </span>
        </div>
      </div>
    </div>
  );
};

export default BottomEvidencePanels;
