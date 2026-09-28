import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, X, Loader2, Lock } from 'lucide-react';

interface RevocationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmRevoke: (reason: string) => Promise<void>;
  targetName: string;
  targetScope: string;
  isRevoking: boolean;
}

export const RevocationWarningModal: React.FC<RevocationWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirmRevoke,
  targetName,
  targetScope,
  isRevoking,
}) => {
  const [reason, setReason] = useState('Routine clearance rotation / reassignment of tactical duties');
  const [confirmedCheck, setConfirmedCheck] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmedCheck) return;
    await onConfirmRevoke(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-red-100 bg-red-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Revoke Authorization Clearance
              </h3>
              <p className="text-xs text-red-700 font-mono">
                Target: {targetName} ({targetScope})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Critical Warning Box */}
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-900">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>CRYPTOGRAPHIC IMMUTABILITY NOTICE</span>
            </div>
            <p className="text-[12px] leading-relaxed font-sans text-red-800 font-medium">
              &quot;This recipient&apos;s previously decrypted copies remain traceable via their Provenance Capsule — revocation prevents future access but does not erase past decryption records.&quot;
            </p>
          </div>

          {/* Revocation Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Revocation Operational Justification (Mandatory)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-500"
              placeholder="State reason for cryptographic revocation..."
            />
          </div>

          {/* Acknowledgement Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={confirmedCheck}
              onChange={(e) => setConfirmedCheck(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500 bg-white"
            />
            <span>
              I confirm the immediate revocation of hardware tokens and cryptographic keys for <strong className="text-slate-900">{targetName}</strong>.
            </span>
          </label>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!confirmedCheck || isRevoking}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isRevoking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Revoking Keys...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Confirm Revocation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
