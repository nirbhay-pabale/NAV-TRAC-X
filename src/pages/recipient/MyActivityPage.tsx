import React, { useState } from 'react';
import {
  Activity,
  Search,
  FileCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useMyActivity } from '../../hooks/useMyActivity';
import type { RecipientActivityEvent } from '../../types/recipientUser';

export const MyActivityPage: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('All Actions');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedReceipt, setSelectedReceipt] = useState<RecipientActivityEvent | null>(null);

  const { data, isLoading } = useMyActivity({
    action: actionFilter,
    search: searchQuery,
    page,
    pageSize: 10,
  });

  const events = data?.events || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 10) || 1;

  const renderStatusBadge = (status: RecipientActivityEvent['status']) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="pill-green">Verified</span>;
      case 'DENIED':
        return <span className="pill-red">Denied</span>;
      case 'PENDING':
        return <span className="pill-amber">Pending</span>;
      default:
        return <span className="pill-blue">{status}</span>;
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          My Activity & Access Receipts
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Complete transparent audit trail of your cryptographic access, signing events, and clearance requests
        </p>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-3.5 bg-[#F8FAFC] border-b border-[#E6EAF2] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] min-w-[240px] max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by receipt ID, action, or document..."
              className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-[#CBD5E1] text-xs text-slate-700 px-2.5 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="All Actions">All Event Actions</option>
              <option value="Opened">Document Opened</option>
              <option value="Request Submitted">Request Submitted</option>
              <option value="Request Approved">Request Approved</option>
              <option value="Access Denied">Access Denied</option>
            </select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Loading personal activity feed…
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Activity className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No activity events found</p>
              <p className="text-xs text-slate-400">Your recent actions will automatically appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider font-mono border-b border-[#E6EAF2]">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-3">Action Type</th>
                  <th className="py-3 px-3">Document Subject</th>
                  <th className="py-3 px-3">Receipt ID</th>
                  <th className="py-3 px-3">Signature Status</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF2]">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                      {evt.timeLocal}
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{evt.action}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-slate-800 truncate max-w-[220px]">
                          {evt.documentTitle || 'Command Resource'}
                        </span>
                        {evt.documentId && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {evt.documentId}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] text-blue-600 font-semibold">
                        {evt.receiptId}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[10.5px]">
                      {evt.signatureStatus === 'ML-DSA-65 Valid' ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ML-DSA-65 Valid</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">{evt.signatureStatus}</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      {renderStatusBadge(evt.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(evt)}
                        className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E6EAF2] flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing page {page} of {totalPages} ({total} total events)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
                  Cryptographic Access Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt ID:</span>
                <span className="font-bold text-blue-600">{selectedReceipt.receiptId}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-slate-800">{selectedReceipt.action}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Document:</span>
                <span className="text-slate-800 font-semibold">{selectedReceipt.documentTitle || 'Command Resource'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Signature:</span>
                <span className="text-emerald-700 font-bold">{selectedReceipt.signatureStatus}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Ledger Audit:</span>
                <span className="text-emerald-700 font-bold">{selectedReceipt.ledgerStatus}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Device Node:</span>
                <span className="text-slate-700">{selectedReceipt.deviceId}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-lg text-[11px] text-slate-600 leading-relaxed font-sans">
              <strong>Event Notes:</strong> {selectedReceipt.details}
            </div>

            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold font-['Montserrat'] hover:bg-slate-800 cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
