import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  FileText,
  Shield,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { usePendingRequests } from '../../hooks/useAuthorizationData';
import type { AccessRequest } from '../../types/authorization';
import { RequestDecisionModal } from './RequestDecisionModal';

export const PendingRequestsTab: React.FC = () => {
  const { data: requests = [], isLoading } = usePendingRequests();

  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
  const [decisionType, setDecisionType] = useState<'APPROVE' | 'DENY'>('APPROVE');
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'Approved' | 'Denied'>('ALL');

  const pendingRequests = requests.filter((r) => r.status === 'Pending');
  const historyRequests = requests.filter((r) => {
    if (r.status === 'Pending') return false;
    if (historyFilter === 'ALL') return true;
    return r.status === historyFilter;
  });

  const handleOpenDecision = (req: AccessRequest, type: 'APPROVE' | 'DENY') => {
    setSelectedRequest(req);
    setDecisionType(type);
  };

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case 'TOP SECRET (CODEWORD)':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'TOP SECRET':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'SECRET':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Pending Requests Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Pending Clearance Requests ({pendingRequests.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Awaiting Command Decision
          </span>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500 text-xs font-mono animate-pulse">
            Loading pending requests...
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="bg-white border border-[#E6EAF2] rounded-xl p-8 text-center shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#0F172A]">All pending requests resolved</p>
            <p className="text-[11px] text-slate-500 mt-0.5">No outstanding clearance requests in queue.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#E6EAF2] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                    <th className="p-3.5">REQUESTER & RANK</th>
                    <th className="p-3.5">REQUESTED DOCUMENT</th>
                    <th className="p-3.5">OPERATIONAL REASON</th>
                    <th className="p-3.5">REQUESTED ON</th>
                    <th className="p-3.5">ESCALATION PATH</th>
                    <th className="p-3.5 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {pendingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Requester info */}
                      <td className="p-3.5">
                        <div className="font-bold text-[#0F172A]">{req.requesterName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {req.requesterRank} • {req.requesterUnit}
                        </div>
                        <span className="text-[10px] text-blue-600 font-mono">PNo: {req.requesterPno}</span>
                      </td>

                      {/* Document info */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-900">{req.documentName}</span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold border ${getClassificationBadge(
                              req.documentClassification
                            )}`}
                          >
                            {req.documentClassification}
                          </span>
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="p-3.5 max-w-xs text-[11px] text-slate-600 italic">
                        &quot;{req.reasonGiven}&quot;
                      </td>

                      {/* Time */}
                      <td className="p-3.5 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                        {req.requestedOn}
                      </td>

                      {/* Approver role */}
                      <td className="p-3.5">
                        <div className="text-[11px] font-mono text-blue-600 font-semibold">
                          {req.requiredApproverRole}
                        </div>
                        {req.escalatedTo && (
                          <div className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5">
                            <ArrowRight className="w-2.5 h-2.5" />
                            <span>Escalate: {req.escalatedTo}</span>
                          </div>
                        )}
                      </td>

                      {/* Decision buttons */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDecision(req, 'APPROVE')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDecision(req, 'DENY')}
                            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Deny</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Historical Decisions Section */}
      <div className="space-y-3 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Authorization Decision History
            </h3>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setHistoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                historyFilter === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All History
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('Approved')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                historyFilter === 'Approved' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setHistoryFilter('Denied')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                historyFilter === 'Denied' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Denied
            </button>
          </div>
        </div>

        <div className="bg-white border border-[#E6EAF2] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="p-3">REQUEST ID</th>
                  <th className="p-3">REQUESTER</th>
                  <th className="p-3">DOCUMENT</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">DECIDED BY</th>
                  <th className="p-3">DECISION NOTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {historyRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-blue-600">{req.id}</td>
                    <td className="p-3">
                      <span className="text-[#0F172A] font-semibold">{req.requesterName}</span>
                      <span className="text-[11px] text-slate-500 font-mono block">
                        {req.requesterRank}, {req.requesterUnit}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{req.documentName}</td>
                    <td className="p-3">
                      {req.status === 'Approved' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                          APPROVED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold font-mono">
                          DENIED
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div className="font-semibold">{req.decidedBy || 'Command Authority'}</div>
                      <div className="text-[10px] text-slate-400">{req.decidedAt}</div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 italic">
                      {req.decisionNote || 'No remark'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Decision Modal */}
      {selectedRequest && (
        <RequestDecisionModal
          isOpen={!!selectedRequest}
          onClose={() => setSelectedRequest(null)}
          request={selectedRequest}
          decisionType={decisionType}
        />
      )}
    </div>
  );
};
