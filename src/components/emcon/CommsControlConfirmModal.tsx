import React, { useState } from 'react';
import { X, ShieldAlert, Radio, Satellite, Globe, Shield, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { CommsControlItem, CommsControlState } from '../../types/emcon';

interface CommsControlConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: CommsControlItem | null;
  onConfirm: (targetState: CommsControlState, rationale: string) => Promise<void>;
}

export const CommsControlConfirmModal: React.FC<CommsControlConfirmModalProps> = ({
  isOpen,
  onClose,
  control,
  onConfirm
}) => {
  const defaultNextState: CommsControlState =
    control?.state === 'BLOCKED' || control?.state === 'DISCONNECTED'
      ? 'ALLOWED'
      : control?.state === 'ALLOWED'
      ? 'RESTRICTED'
      : 'BLOCKED';

  const [targetState, setTargetState] = useState<CommsControlState>(defaultNextState);
  const [rationale, setRationale] = useState<string>('Routine tactical clearance under Western Fleet Command order');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !control) return null;

  const getControlIcon = () => {
    switch (control.icon) {
      case 'radio':
        return <Radio className="w-5 h-5 text-red-600" />;
      case 'satellite':
        return <Satellite className="w-5 h-5 text-amber-600" />;
      case 'network':
        return <Globe className="w-5 h-5 text-red-600" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-emerald-600" />;
      default:
        return <Radio className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadgeStyle = (st: CommsControlState) => {
    if (st === 'ALLOWED') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (st === 'RESTRICTED') {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-red-50 text-red-700 border-red-200';
  };

  const handleExecute = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm(targetState, rationale);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comms-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 id="comms-modal-title" className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                Authorize Communication Posture Change
              </h3>
              <p className="text-[11px] text-[#64748B]">
                Operational Security Enforcement Protocol
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

        {/* Selected Channel Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
              {getControlIcon()}
            </div>
            <div>
              <div className="text-xs font-bold text-[#0F172A]">{control.name}</div>
              <div className="text-[10.5px] text-slate-500">{control.description}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-mono">Current:</span>
            <span className={`px-2 py-0.5 rounded-md text-[10.5px] font-bold font-mono border ${getBadgeStyle(control.state)}`}>
              {control.state}
            </span>
          </div>
        </div>

        {/* Target Posture Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">
            Target Channel State:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['ALLOWED', 'RESTRICTED', 'BLOCKED'] as CommsControlState[]).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setTargetState(st)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  targetState === st
                    ? st === 'ALLOWED'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : st === 'RESTRICTED'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                      : 'bg-red-600 text-white border-red-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Rationale Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 block">
            Operational Reason / Command Reference:
          </label>
          <input
            type="text"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="e.g. Task Force Bravo scheduled exercise clearance"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Security Warning Notice */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed">
            <strong>CRITICAL AUDIT NOTICE:</strong> Changing RF emissions or communication states affects naval acoustic/electromagnetic detectability. This operational change will be permanently committed to the immutable blockchain ledger with timestamp and officer ID.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={isSubmitting || targetState === control.state}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Authorizing…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Confirm & Change Posture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
