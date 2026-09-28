import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Shield,
  FileText,
  User,
  Loader2
} from 'lucide-react';
import type { AccessRequest } from '../../types/authorization';
import { useApproveRequest, useDenyRequest } from '../../hooks/useAuthorizationData';

interface RequestDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: AccessRequest | null;
  decisionType: 'APPROVE' | 'DENY';
}

export const RequestDecisionModal: React.FC<RequestDecisionModalProps> = ({
  isOpen,
  onClose,
  request,
  decisionType,
}) => {
  const approveMutation = useApproveRequest();
  const denyMutation = useDenyRequest();

  const [approverName, setApproverName] = useState('Capt. R. Deshmukh (Commanding Officer)');
  const [note, setNote] = useState('');

  if (!isOpen || !request) return null;

  const isApproving = decisionType === 'APPROVE';
  const isPending = approveMutation.isPending || denyMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    try {
      if (isApproving) {
        await approveMutation.mutateAsync({
          requestId: request.id,
          approverName,
          note: note || 'Authorization granted under Naval Clearance Authority',
        });
      } else {
        await denyMutation.mutateAsync({
          requestId: request.id,
          denierName: approverName,
          reason: note || 'Access denied due to classification protocol mismatch',
        });
      }
      onClose();
    } catch (err) {
      console.error('Decision mutation failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-5 border-b ${
            isApproving ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isApproving ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'
              }`}
            >
              {isApproving ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                {isApproving ? 'Approve Access Authorization' : 'Deny Access Request'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Request ID: {request.id}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Request Context Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-[#0F172A] font-sans">{request.requesterName}</span>
                <span className="text-slate-500 font-mono">({request.requesterRank}, {request.requesterUnit})</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] font-bold border border-blue-200">
                PNo: {request.requesterPno}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-700 pt-1 border-t border-slate-200">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-[#0F172A]">{request.documentName}</span>
              <span className="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {request.documentClassification}
              </span>
            </div>

            <div className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
              &quot;{request.reasonGiven}&quot;
            </div>
          </div>

          {/* Escalation Hierarchy Notice for Approval */}
          {isApproving && request.escalatedTo && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-blue-950 block">Escalation Routing Notice</span>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Requires Commander approval — routed to <strong className="text-blue-900">{request.escalatedTo}</strong> ({request.requiredApproverRole}) for final cryptographic key injection.
                </p>
              </div>
            </div>
          )}

          {/* Approving/Denying Officer Signature Name */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Approving Officer Identity
            </label>
            <input
              type="text"
              value={approverName}
              onChange={(e) => setApproverName(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Decision Note */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isApproving ? 'Authorization Remarks & Validity Note' : 'Rejection Reason (Recorded in Immutable Audit Log)'}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder={isApproving ? 'e.g. Approved for 48 hours for tactical exercise...' : 'e.g. Insufficient clearance level for Codeword compartment...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending}
              className={`px-5 py-2 rounded-xl text-white font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer ${
                isApproving
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isApproving ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Approval</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Confirm Denial</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
