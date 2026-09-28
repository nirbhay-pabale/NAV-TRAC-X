import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Lock,
  Clock,
  HelpCircle
} from 'lucide-react';
import { useMyDocuments } from '../../hooks/useMyDocuments';
import type { RecipientDocument, RecipientDocumentStatus } from '../../types/recipientUser';

export const MyDocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Opened' | 'Expiring' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'expiry' | 'title'>('newest');
  const [page, setPage] = useState(1);

  const { data: docData, isLoading } = useMyDocuments({
    tab: activeTab,
    search: searchQuery,
    classification: classificationFilter,
    sortBy,
    page,
    pageSize: 8,
  });

  const renderStatusPill = (status: RecipientDocumentStatus) => {
    switch (status) {
      case 'New':
        return <span className="pill-blue">New</span>;
      case 'Opened':
        return <span className="pill-green">Opened</span>;
      case 'Expiring':
        return <span className="pill-amber">Expiring</span>;
      case 'Expired':
        return <span className="pill-red">Expired</span>;
      case 'Revoked':
        return <span className="pill-red">Revoked</span>;
      default:
        return <span className="pill-slate">{status}</span>;
    }
  };

  const renderClassificationPill = (classification: string) => {
    if (classification.includes('TOP SECRET')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
          {classification}
        </span>
      );
    }
    if (classification.includes('SECRET')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
          {classification}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {classification}
      </span>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            My Assigned Documents
          </h1>
          <p className="text-xs text-[#64748B] mt-1">
            Classified materials cryptographically encapsulated for your operational clearance
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/my/requests')}
          className="btn-secondary text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
        >
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>Request New Document Access</span>
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs overflow-hidden">
        
        {/* Status Tabs Bar */}
        <div className="p-3.5 border-b border-[#E6EAF2] flex flex-wrap items-center justify-between gap-3 bg-[#F8FAFC]">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-[#CBD5E1]">
            {(['All', 'New', 'Opened', 'Expiring', 'Expired'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-[#CBD5E1] min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search assigned documents..."
                className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
            </div>

            <select
              value={classificationFilter}
              onChange={(e) => {
                setClassificationFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white border border-[#CBD5E1] text-xs text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="All">All Classifications</option>
              <option value="SECRET">SECRET</option>
              <option value="TOP SECRET">TOP SECRET</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-[#CBD5E1] text-xs text-slate-700 px-2 py-1.5 rounded-lg focus:outline-none cursor-pointer"
            >
              <option value="newest">Sort: Received Date</option>
              <option value="expiry">Sort: Expiry Time</option>
              <option value="title">Sort: Title</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              Loading authorized records…
            </div>
          ) : docData?.documents.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No documents found</p>
              <p className="text-xs text-slate-400">
                No documents matched your filter parameters.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider font-mono border-b border-[#E6EAF2]">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-3">Classification</th>
                  <th className="py-3 px-3">Authority / Unit</th>
                  <th className="py-3 px-3">Access Type</th>
                  <th className="py-3 px-3">Received Date</th>
                  <th className="py-3 px-3">Expiry Countdown</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EAF2]">
                {docData?.documents.map((doc: RecipientDocument) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Title & Version */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#0F172A] truncate max-w-[220px]">
                          {doc.title}
                        </span>
                        <span className="text-[10.5px] font-mono text-[#64748B]">
                          {doc.documentNumber} • {doc.version}
                        </span>
                      </div>
                    </td>

                    {/* Classification */}
                    <td className="py-3 px-3">
                      {renderClassificationPill(doc.classification)}
                    </td>

                    {/* Sent By Authority */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-medium truncate max-w-[160px]">
                          {doc.sentByAuthority}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {doc.sentByUnit}
                        </span>
                      </div>
                    </td>

                    {/* Allowed Access Type */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {doc.allowedAccessType}
                      </span>
                    </td>

                    {/* Received Date */}
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                      {doc.receivedDate}
                    </td>

                    {/* Expiry Countdown */}
                    <td className="py-3 px-3">
                      <span
                        className={`font-mono text-[11px] font-semibold ${
                          doc.isExpired
                            ? 'text-red-600'
                            : doc.isExpiringSoon
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {doc.expiryCountdownText}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {renderStatusPill(doc.status)}
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-right">
                      {doc.canOpen ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/my/documents/${doc.id}/view`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11.5px] transition-all flex items-center gap-1.5 ml-auto shadow-2xs cursor-pointer"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Open Securely</span>
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-1 text-slate-400" title={doc.disabledReason || 'Access Disabled'}>
                          <button
                            type="button"
                            disabled
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 font-medium text-[11px] cursor-not-allowed border border-slate-200"
                          >
                            Unavailable
                          </button>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {docData && docData.totalPages > 1 && (
          <div className="p-3.5 bg-[#F8FAFC] border-t border-[#E6EAF2] flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing page {docData.page} of {docData.totalPages} ({docData.total} total documents)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= docData.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
