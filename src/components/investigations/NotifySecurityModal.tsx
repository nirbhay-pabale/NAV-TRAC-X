import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { sendSecurityNotification } from '../../api/forensicApi';

interface NotifySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  documentName?: string;
  suspectName?: string;
  confidenceScore?: number;
  outcome?: string;
  defaultMessage?: string;
}

const AUTHORIZED_SECURITY_RECIPIENTS = [
  { label: 'Cyber Warfare Operations (Primary)', email: 'cyberwarfare-ops@navy.mil.in', role: 'Watch Officer' },
  { label: 'FOC-in-C Command Secretariat', email: 'foc-in-c-secretariat@navy.mil.in', role: 'Flag Authority' },
  { label: 'Naval Provost Marshal (Forensics)', email: 'provost-marshal@navy.mil.in', role: 'Investigator' },
  { label: 'Directorate of Naval Intelligence', email: 'dni-counterintel@navy.mil.in', role: 'Intelligence' },
];

export const NotifySecurityModal: React.FC<NotifySecurityModalProps> = ({
  isOpen,
  onClose,
  caseId,
  documentName = 'Mission_Plan_Bravo.pdf',
  suspectName = 'Verified Subject',
  confidenceScore = 98.0,
  outcome = 'Verified',
  defaultMessage,
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState(AUTHORIZED_SECURITY_RECIPIENTS[0].email);
  const [customEmail, setCustomEmail] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [severity, setSeverity] = useState<'HIGH' | 'CRITICAL' | 'ELEVATED' | 'LOW'>('HIGH');
  const [subject, setSubject] = useState(`TACTICAL BREACH ALERT: Case ${caseId}`);
  const [note, setNote] = useState(
    defaultMessage ||
    `Priority classified document leak detected on sovereign network.\nTarget Document: ${documentName}\nCorrelated Recipient: ${suspectName}\nConfidence: ${confidenceScore}%\nOutcome: ${outcome}\nImmediate cryptographic key revocation & containment requested.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultToast, setResultToast] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const targetEmail = useCustom ? customEmail : selectedRecipient;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultToast(null);
    setIsSubmitting(true);

    try {
      const res = await sendSecurityNotification({
        case_id: caseId,
        recipient_email: targetEmail,
        subject,
        message: note,
        severity,
      });

      setResultToast({
        success: true,
        message: res.message || `Security bulletin successfully dispatched to ${targetEmail}`,
      });

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        setResultToast(null);
      }, 2000);
    } catch (err: any) {
      setIsSubmitting(false);
      setResultToast({
        success: false,
        message: err.message || 'Dispatch failed',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 border border-red-200 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Notify Naval Security Command</h3>
              <p className="text-[11px] text-slate-500 font-mono">Case ID: {caseId}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSend} className="p-5 space-y-3.5 text-xs">
          {/* Case Summary Pill */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Document</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">{documentName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Subject</span>
              <span className="font-semibold text-red-700">{suspectName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-500">Attribution State</span>
              <span className="font-mono font-bold text-emerald-700 uppercase">{outcome} ({confidenceScore}%)</span>
            </div>
          </div>

          {/* Severity & Subject Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="ELEVATED">ELEVATED</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">
              Select Authorized Security Recipient
            </label>
            {!useCustom ? (
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              >
                {AUTHORIZED_SECURITY_RECIPIENTS.map((rec) => (
                  <option key={rec.email} value={rec.email}>
                    {rec.label} ({rec.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="email"
                required
                placeholder="officer@navy.mil.in"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            )}

            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={() => setUseCustom(!useCustom)}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
              >
                {useCustom ? '← Select Standard Recipient' : '+ Enter Custom Address'}
              </button>
            </div>
          </div>

          {/* Operational Directive / Note (Editable Draft) */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-slate-700">
              Draft Message Directive (Editable)
            </label>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-mono resize-none leading-relaxed"
            />
          </div>

          {/* Result Alert */}
          {resultToast && (
            <div className={`p-2.5 rounded-lg border text-xs leading-relaxed ${
              resultToast.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {resultToast.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{resultToast.message}</span>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? 'Dispatching…' : 'Confirm & Dispatch Alert'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotifySecurityModal;
