import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TamperConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const TamperConfirmModal: React.FC<TamperConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Simulate Ledger Tamper
                </h3>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9.5px] font-bold font-mono">
                  DEMO MODE
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Controlled Cryptographic Breach Simulation
              </p>
            </div>
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
          This will simulate an adversary artificially modifying a historical decryption entry at <strong>Block #4,188</strong> in local demo state.
        </p>

        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 leading-relaxed font-mono">
          <strong>Expected Behavior:</strong> Re-running <em>"Verify Chain Integrity"</em> will immediately detect the Merkle root mismatch and pinpoint Block #4,188. You can restore clean state anytime using <em>"Reset Demo"</em>.
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-xs font-bold text-slate-950 shadow-xs cursor-pointer"
          >
            Corrupt Block #4,188 & Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TamperConfirmModal;
