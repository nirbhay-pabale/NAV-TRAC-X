import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, ArrowRight, Search } from 'lucide-react';
import { useLeakMonitoring } from '../../hooks/useDocumentData';

interface LeakMonitoringTabProps {
  documentId: string;
}

export const LeakMonitoringTab: React.FC<LeakMonitoringTabProps> = ({ documentId }) => {
  const navigate = useNavigate();
  const { data: leakData, isLoading } = useLeakMonitoring(documentId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        Polling OSINT & tactical leak monitoring feed…
      </div>
    );
  }

  const isClean = leakData?.isClean ?? true;
  const match = leakData?.matchedIncident;

  return (
    <div className="space-y-4 pt-1 animate-fadeIn">
      {/* Primary Status Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
          isClean
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-red-50 border-red-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isClean ? (
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600">
                <AlertTriangle className="w-5 h-5 animate-bounce" />
              </div>
            )}
            <div>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isClean ? 'text-emerald-900' : 'text-red-900'}`}>
                {leakData?.statusText || 'Provenance Scan Complete'}
              </h4>
              <p className="text-[10.5px] text-slate-600">
                Last checked: {leakData?.lastScannedAt || 'Just now'}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              isClean
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-red-100 text-red-800 border-red-300'
            }`}
          >
            {isClean ? '0 LEAKS DETECTED' : 'LEAK ALERT'}
          </span>
        </div>

        {/* If Leaked Match exists */}
        {!isClean && match && (
          <div className="space-y-2.5 pt-2 border-t border-red-200">
            <div className="p-3 rounded-lg bg-white border border-red-200 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Matched Incident Case:</span>
                <span className="text-red-700 font-bold">{match.caseId}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Artifact Source:</span>
                <span className="text-slate-900 font-bold">{match.sourceName}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Cryptographic Confidence:</span>
                <span className="text-emerald-700 font-bold">{match.confidence}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Suspect Terminal:</span>
                <span className="text-amber-800 font-bold truncate max-w-[180px]">{match.suspectUnit}</span>
              </div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                Detection Method: {match.matchMethod}
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/investigations/${match.caseId}`)}
              className="w-full py-2 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>View Case in Investigations ({match.caseId})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Steganographic Fingerprint Health Metrics */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
            Steganographic Watermark Robustness
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-bold">
            100% Embedded
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: '100%' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono text-slate-700">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[9.5px]">Algorithmic Layer:</span>
            <span className="font-semibold text-slate-800">2D DWT-DCT SVD</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block text-[9.5px]">Error Correction:</span>
            <span className="font-semibold text-slate-800">Reed-Solomon RS(64,32)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeakMonitoringTab;
