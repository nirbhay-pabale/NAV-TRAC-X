import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  History, 
  Plus, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  ChevronDown, 
  Cpu, 
  Layers, 
  KeyRound, 
  FileText, 
  X
} from 'lucide-react';
import { fetchEngineHealth, fetchCases } from '../../api/forensicApi';

interface ForensicHeaderProps {
  onResetCase?: () => void;
  hasUnsavedChanges?: boolean;
  caseId?: string;
  isExistingCase?: boolean;
  onSelectCase?: (caseId: string) => void;
}

export const ForensicHeader: React.FC<ForensicHeaderProps> = ({
  onResetCase,
  hasUnsavedChanges = false,
  caseId,
  isExistingCase = false,
  onSelectCase,
}) => {
  const navigate = useNavigate();
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);

  // Live Engine Health Query (refetches every 15s)
  const { data: engineHealth, isError } = useQuery({
    queryKey: ['engine-health'],
    queryFn: fetchEngineHealth,
    refetchInterval: 15000,
  });

  // Recent Cases Query
  const { data: recentCases } = useQuery({
    queryKey: ['investigation-cases'],
    queryFn: fetchCases,
  });

  const handleNewClick = () => {
    if (isExistingCase || hasUnsavedChanges) {
      setShowConfirmReset(true);
      return;
    }
    if (onResetCase) {
      onResetCase();
    }
    navigate('/investigations/new');
  };

  const confirmReset = () => {
    setShowConfirmReset(false);
    if (onResetCase) {
      onResetCase();
    }
    navigate('/investigations/new');
  };

  const healthStatus = isError ? 'offline' : (engineHealth?.status || 'ok');

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left Title & Breadcrumb Block */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
            <span
              onClick={() => navigate('/investigations')}
              className="hover:text-blue-600 cursor-pointer transition-colors"
            >
              Investigations
            </span>
            <span className="text-slate-400">&gt;</span>
            
            {/* Case Selector Dropdown */}
            <div className="relative inline-block">
              <button
                type="button"
                onClick={() => setShowCaseDropdown(!showCaseDropdown)}
                className="text-blue-600 font-mono font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                title="Select case from provenance store"
              >
                <span>{caseId ? `Case #${caseId}` : 'New Case'}</span>
                <ChevronDown className="w-3 h-3 text-blue-500" />
              </button>

              {showCaseDropdown && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs animate-fadeIn">
                  <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                    Active Provenance Cases
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-1">
                    {recentCases && recentCases.length > 0 ? (
                      recentCases.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setShowCaseDropdown(false);
                            if (onSelectCase) onSelectCase(c.id);
                            navigate(`/investigations/${c.id}`);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            c.id === caseId ? 'bg-blue-50 text-blue-800 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-mono font-bold">{c.id}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{c.title || 'Forensic Case'}</div>
                          </div>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            c.outcome === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                            c.outcome === 'Manipulation Suspected' ? 'bg-rose-100 text-rose-800' :
                            c.outcome === 'Contradictory' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {c.outcome || c.status}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="p-3 text-slate-400 text-center">No cases found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </span>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Investigation & Forensic Analysis
          </h1>
          
          {/* Zero-Trust Provenance Engine Live Status Badge */}
          <button
            type="button"
            onClick={() => setShowHealthModal(true)}
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              healthStatus === 'ok'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : healthStatus === 'degraded'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            title="Click to view Zero-Trust Provenance Engine subsystem status"
          >
            {healthStatus === 'ok' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            ) : healthStatus === 'degraded' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
            ) : (
              <ShieldX className="w-3.5 h-3.5 text-rose-600" />
            )}
            <span>Zero-Trust Provenance Engine</span>
            <span className={`w-2 h-2 rounded-full ${
              healthStatus === 'ok' ? 'bg-emerald-500 animate-pulse' :
              healthStatus === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
          </button>
        </div>

        <p className="text-xs text-[#64748B] mt-0.5">
          Analyze leaked documents, images or screenshots to verify sovereign watermark provenance.
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Previous Investigations Button */}
        <button
          type="button"
          onClick={() => navigate('/investigations')}
          className="h-9 px-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
        >
          <History className="w-3.5 h-3.5 text-slate-500" />
          <span>Previous Investigations</span>
        </button>

        {/* + New Investigation Button */}
        <button
          type="button"
          onClick={handleNewClick}
          className="h-9 px-4 rounded-lg bg-[#0F5257] hover:bg-[#0b3e42] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>New Investigation</span>
        </button>
      </div>

      {/* Engine Health Subsystem Details Modal */}
      {showHealthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Zero-Trust Sovereign Engine Status
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Real-time health telemetry across the sovereign cryptographic watermark pipeline, hash-chained ledger, and neural text provider.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Watermark Engine */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span>Watermark Engine</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ONLINE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {engineHealth?.components?.watermark_engine?.name || '2D DWT-DCT SVD Steganography'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Codec: {engineHealth?.components?.watermark_engine?.codec || 'RS(32,24) Parity ECC'}
                </div>
              </div>

              {/* Merkle Ledger */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Cpu className="w-4 h-4 text-purple-600" />
                    <span>Merkle Ledger</span>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    (engineHealth?.components?.ledger?.tampered_blocks || 0) > 0
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {(engineHealth?.components?.ledger?.tampered_blocks || 0) > 0 ? 'ALERT' : 'VERIFIED'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {engineHealth?.components?.ledger?.name || 'SHA3-256 Hash Chain'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Blocks: {engineHealth?.components?.ledger?.total_blocks ?? 1} | Tampered: {engineHealth?.components?.ledger?.tampered_blocks ?? 0}
                </div>
              </div>

              {/* Signature Service */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Signature Service</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {engineHealth?.components?.signature_service?.scheme || 'Demo signature scheme (Classical Stand-in)'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Status: {engineHealth?.components?.signature_service?.status || 'ok'}
                </div>
              </div>

              {/* Text Provider */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <span>Text Provider</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    {engineHealth?.components?.text_provider?.provider?.toUpperCase() || 'GEMINI'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Model: {engineHealth?.components?.text_provider?.model || 'Deterministic Templates'}
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  Air-Gapped: {engineHealth?.components?.text_provider?.air_gapped ? 'True (Cloud Blocked)' : 'False (Enabled)'}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHealthModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Close Telemetry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discard / Reset Confirmation Dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-xl bg-white border border-slate-200 p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-sm font-bold text-slate-900">Reset Current Investigation?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Starting a new case will reset all uploaded artifacts, extracted spectral matrices, and candidate match state.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReset}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                Discard & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForensicHeader;
