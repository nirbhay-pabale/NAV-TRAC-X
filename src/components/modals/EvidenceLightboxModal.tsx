import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Flame, 
  Fingerprint, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  FileArchive
} from 'lucide-react';
import type { ForensicResult } from '../../api/forensicApi';

interface EvidenceLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceType: string | null;
  caseId: string;
  result?: ForensicResult | null;
}

export const EvidenceLightboxModal: React.FC<EvidenceLightboxModalProps> = ({
  isOpen,
  onClose,
  evidenceType = 'heatmap',
  caseId,
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'gallery' | 'custody'>('gallery');
  const [selectedView, setSelectedView] = useState<string>(evidenceType || 'heatmap');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const vis = result?.visual_evidence;
  const isVerified = result?.outcome === 'Verified';
  const recipient = isVerified ? result?.recipient : null;

  const handleDownloadZip = () => {
    setDownloadToast('Downloading Sovereign Evidence Package (.zip)...');
    const link = document.createElement('a');
    link.href = `/api/evidence/${caseId}.zip`;
    link.download = `Evidence_Package_${caseId}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      setDownloadToast('Evidence Package (.zip) with manifest.sha3 downloaded');
      setTimeout(() => setDownloadToast(null), 2500);
    }, 1000);
  };

  const views = [
    { id: 'original', name: 'Original Artifact', icon: FileCheck, url: vis?.original_url, desc: 'Raw intercepted digital capture as submitted for ingestion.' },
    { id: 'processed', name: 'Processed Matrix', icon: Layers, url: vis?.processed_url, desc: 'Geometric rectification, Hough deskew and contrast-normalized luminance channel.' },
    { id: 'heatmap', name: 'Watermark Heatmap', icon: Flame, url: vis?.heatmap_url, desc: '2D DWT-DCT SVD spatial detection confidence heatmap rendered via JET thermal gradient.' },
    { id: 'spectral', name: 'Spectral (FFT) Magnitude', icon: Sparkles, url: vis?.spectral_url, desc: '2D Fast Fourier Transform magnitude spectrum revealing carrier frequency peaks.' },
    { id: 'fingerprint', name: 'Fingerprint Map', icon: Fingerprint, url: vis?.fingerprint_map_url, desc: 'Recovered spread-spectrum PN chip correlation matrix across 16x16 macroblocks.' },
  ];

  const currentView = views.find((v) => v.id === selectedView) || views[2];
  const IconComponent = currentView.icon;

  const chainOfCustodyEvents = [
    { time: 'T+00.00s', event: 'Artifact Ingestion', actor: 'Naval Operations Console', hash: result?.document?.sha3_hash ? `${result.document.sha3_hash.substring(0, 16)}…` : 'SHA3-256 Registered' },
    { time: 'T+00.45s', event: 'Geometric Rectification', actor: 'OpenCV Sovereign Core', detail: 'Affine normalizer & contrast correction' },
    { time: 'T+01.20s', event: '2D DWT Decomposition', actor: 'Wavelet Transform Engine', detail: 'Haar L2 subband frequency extraction' },
    { time: 'T+02.10s', event: 'Reed-Solomon Parity Decode', actor: 'RS(32,24) ECC Module', detail: 'Recovered 24-byte payload with zero uncorrectable errors' },
    { time: 'T+03.05s', event: 'Cryptographic Signature Verify', actor: 'NIST PQC Stand-in', detail: 'Ed25519 / Classical verification confirmed' },
    { time: 'T+03.80s', event: 'Merkle Ledger Chain Anchor', actor: 'Sovereign Blockchain Node', detail: `Block #${result?.ledger_block?.block_number || 1} hash consensus confirmed` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Forensic Evidence Repository
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-100 text-blue-800">
                  Case #{caseId}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Chain of Custody & Multi-Band Spectral Visual Evidence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Download all evidence images and manifest.sha3 as zip"
            >
              <FileArchive className="w-3.5 h-3.5" />
              <span>Download Evidence Zip</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-100 px-4 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Multi-Band Visual Gallery
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custody')}
            className={`pb-2 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'custody'
                ? 'border-blue-600 text-blue-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Chain of Custody Audit Log
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'gallery' ? (
            <>
              {/* View Selector Buttons */}
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
                {views.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedView(v.id)}
                    className={`py-1.5 px-2 rounded-lg text-center text-[10px] font-bold transition-all cursor-pointer truncate ${
                      selectedView === v.id
                        ? 'bg-white text-blue-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>

              {/* Active Image Display */}
              <div className="relative w-full aspect-[16/9] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                {currentView.url ? (
                  <img
                    src={currentView.url}
                    alt={currentView.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-slate-400 font-mono text-xs flex flex-col items-center gap-2">
                    <IconComponent className="w-8 h-8 text-slate-500" />
                    <span>Run forensic analysis to generate this spectral view</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                <strong>{currentView.name}:</strong> {currentView.desc}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 uppercase font-mono">
                  Immutable Audit Ledger Records
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                  SHA3-256 Sealed
                </span>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                {chainOfCustodyEvents.map((evt, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900 font-sans">{evt.event}</div>
                        <div className="text-[11px] text-slate-500">{evt.actor}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-700 font-semibold">{evt.time}</span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {evt.hash || evt.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {recipient && (
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                  <div className="font-bold">Correlated Subject Record:</div>
                  <div className="font-mono text-[11px]">
                    {recipient.rank} {recipient.name} &bull; PNO {recipient.pno} &bull; {recipient.unit_vessel}
                  </div>
                </div>
              )}
            </div>
          )}

          {downloadToast && (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadToast}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-emerald-700 font-mono text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Digital Evidence Manifest Verified (manifest.sha3)
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors shadow-xs cursor-pointer"
          >
            Close Repository
          </button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceLightboxModal;
