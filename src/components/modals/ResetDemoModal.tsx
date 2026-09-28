import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { centralStore } from '../../data/centralStore';

interface ResetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

export const ResetDemoModal: React.FC<ResetDemoModalProps> = ({
  isOpen,
  onClose,
  onResetComplete,
}) => {
  if (!isOpen) return null;

  const handleConfirmReset = () => {
    centralStore.resetDemoEnvironment();
    if (onResetComplete) onResetComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="uppercase tracking-wider text-slate-900">Reset Demo Environment</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed font-sans">
          This action will restore all local database records to the initial clean benchmark state:
        </p>

        <ul className="text-xs font-mono text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <li>• Restore 6 classified documents & versions</li>
          <li>• Reset 8 recipient cryptographic keys & clearances</li>
          <li>• Restore 5 ledger blocks & verify hash chain</li>
          <li>• Re-initialize all 5 forensic investigation benchmarks</li>
          <li>• Clear all simulated tampering flags</li>
        </ul>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReset}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Confirm Environment Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetDemoModal;
