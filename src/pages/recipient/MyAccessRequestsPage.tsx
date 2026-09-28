import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyAccessRequests, useCreateAccessRequest } from '../../hooks/useMyAccessRequests';
import type { RecipientAccessRequest } from '../../types/recipientUser';

export const MyAccessRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [documentRef, setDocumentRef] = useState('');
  const [reason, setReason] = useState('');
  const [confirmationNotice, setConfirmationNotice] = useState<string | null>(null);

  const { data: requests = [], isLoading } = useMyAccessRequests();
  const createRequestMutation = useCreateAccessRequest();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentRef.trim() || !reason.trim()) return;

    const result = await createRequestMutation.mutateAsync({
      documentReferenceId: documentRef.trim(),
      reason: reason.trim(),
      officerName: user?.name || 'Officer',
      rank: user?.rank || 'Lieutenant',
      unit: user?.unit || 'INS Visakhapatnam (D66)',
      pno: user?.pno || '06244-S',
    });

    setDocumentRef('');
    setReason('');
    setConfirmationNotice(result.message);
  };

  const renderStatusBadge = (status: RecipientAccessRequest['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Pending Review</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Approved</span>
          </span>
        );
      case 'Denied':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" />
            <span>Denied</span>
          </span>
        );
      default:
        return <span className="pill-slate">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Document Access Requests
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Submit clearance requests for restricted tactical records. Approvals are routed through your Commanding Officer and Fleet Operations.
        </p>
      </div>

      {/* Grid: Left Request Form + Right Pending Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT: REQUEST FORM (5 COLS) ── */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-[#E6EAF2]">
            <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              Request Document Clearance
            </h2>
            <p className="text-[11.5px] text-[#64748B]">
              Enter the document reference number or catalog code
            </p>
          </div>

          {confirmationNotice && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-950">Request Logged</p>
                <p className="text-[11.5px] text-blue-800 mt-0.5">{confirmationNotice}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono block mb-1">
                Document Reference ID *
              </label>
              <input
                type="text"
                required
                value={documentRef}
                onChange={(e) => setDocumentRef(e.target.value)}
                placeholder="e.g. NAV-DOC-2026-0055 or DOC-99012"
                className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white font-mono"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                Standard format: NAV-DOC-YYYY-XXXX
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono block">
                  Operational Justification *
                </label>
                <span className={`text-[10px] font-mono ${reason.length > 200 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {reason.length} / 200
                </span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={200}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify the operational purpose, tactical mission, or exercise for which this record is required..."
                className="w-full text-xs p-2.5 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white resize-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 leading-relaxed">
              <strong>Security Protocol Note:</strong> All access requests are permanently stamped with your digital signature and reviewed by Command Approvers.
            </div>

            <button
              type="submit"
              disabled={createRequestMutation.isPending || !documentRef.trim() || !reason.trim() || reason.length > 200}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-['Montserrat'] shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{createRequestMutation.isPending ? 'Routing Request…' : 'Submit Access Request'}</span>
            </button>
          </form>
        </div>

        {/* ── RIGHT: MY REQUESTS TABLE (7 COLS) ── */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-[#E6EAF2] shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#E6EAF2] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                My Submitted Requests ({requests.length})
              </h2>
              <p className="text-[11.5px] text-[#64748B]">
                Track approval status and access tokens
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">
                Loading request logs…
              </div>
            ) : requests.length === 0 ? (
              <div className="p-10 text-center text-slate-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">No requests submitted yet</p>
                <p className="text-[11px] text-slate-400">Use the form on the left to request document access.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8FAFC] text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider font-mono border-b border-[#E6EAF2]">
                    <th className="py-2.5 px-3">Reference</th>
                    <th className="py-2.5 px-3">Reason Given</th>
                    <th className="py-2.5 px-3">Submitted</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6EAF2]">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span className="font-bold font-mono text-slate-900">
                            {req.documentReferenceId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {req.id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <p className="text-slate-700 text-xs line-clamp-2 max-w-[220px]">
                          {req.reason}
                        </p>
                        {req.decisionNote && (
                          <span className="text-[10px] text-slate-500 block mt-0.5 italic">
                            Note: {req.decisionNote}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {req.submittedOn}
                      </td>

                      <td className="py-3 px-3">
                        {renderStatusBadge(req.status)}
                      </td>

                      <td className="py-3 px-3 text-right">
                        {req.status === 'Approved' && req.linkedDocumentId ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/my/documents/${req.linkedDocumentId}/view`)}
                            className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[10.5px] text-slate-400 font-mono">
                            {req.status === 'Pending' ? 'In Review' : 'Closed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
