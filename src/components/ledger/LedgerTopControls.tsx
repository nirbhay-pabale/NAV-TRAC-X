import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Download,
  CheckCircle2,
  XCircle,
  Database,
  Radio,
  Loader2
} from 'lucide-react';

interface LedgerTopControlsProps {
  activeView: 'explorer' | 'reconciliation';
  onViewChange: (view: 'explorer' | 'reconciliation') => void;
  onVerifyChain: () => void;
  isVerifying: boolean;
  isTamperedState: boolean;
  tamperedBlockNum: number;
  onOpenTamperModal: () => void;
  onResetDemo: () => void;
  onExportEvidence: () => void;
  isExporting: boolean;
}

export const LedgerTopControls: React.FC<LedgerTopControlsProps> = ({
  activeView,
  onViewChange,
  onVerifyChain,
  isVerifying,
  isTamperedState,
  tamperedBlockNum,
  onOpenTamperModal,
  onResetDemo,
  onExportEvidence,
  isExporting,
}) => {
  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: View Tabs + Live Status Pill */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => onViewChange('explorer')}
            className={`py-1.5 px-3 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'explorer'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Block Explorer</span>
          </button>

          <button
            type="button"
            onClick={() => onViewChange('reconciliation')}
            className={`py-1.5 px-3 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              activeView === 'reconciliation'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-600" />
            <span>Offline Unit Reconciliation</span>
          </button>
        </div>

        {/* Live Integrity Status Pill */}
        {isTamperedState ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-4 h-4 text-red-600" />
            <span>Inconsistency Detected at Block #{tamperedBlockNum}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chain Verified (4,192 Blocks Sealed)</span>
          </span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Verify Chain Integrity Button */}
        <button
          type="button"
          onClick={onVerifyChain}
          disabled={isVerifying}
          className="px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Verifying Chain…</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Chain Integrity</span>
            </>
          )}
        </button>

        {/* Simulate Tamper / Reset Demo */}
        {isTamperedState ? (
          <button
            type="button"
            onClick={onResetDemo}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            title="Restore uncorrupted ledger state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo State</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenTamperModal}
            className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Demonstration feature to simulate block alteration"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Tamper</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-bold">DEMO</span>
          </button>
        )}

        {/* Export Evidence Package */}
        <button
          type="button"
          onClick={onExportEvidence}
          disabled={isExporting}
          className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
          title="Export cryptographically signed Merkle segment"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Evidence</span>
        </button>
      </div>
    </div>
  );
};

export default LedgerTopControls;
