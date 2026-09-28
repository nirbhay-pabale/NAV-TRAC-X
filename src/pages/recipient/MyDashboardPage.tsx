import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  AlertTriangle,
  Send,
  Search,
  Key,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Lock,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyDashboardStats, useSecurityNotices, useSubmitSecurityConcern } from '../../hooks/useMyDashboardData';
import { useMyDocuments } from '../../hooks/useMyDocuments';
import { useMyActivity } from '../../hooks/useMyActivity';
import { useMyKeyInfo, useReportLostKey } from '../../hooks/useMyKeys';
import type { RecipientDocument, RecipientDocumentStatus } from '../../types/recipientUser';

export const MyDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active Tab for Assigned Documents
  const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Opened' | 'Expiring' | 'Expired'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'expiry' | 'title'>('newest');
  const [page, setPage] = useState(1);

  // Security Concern Form State
  const [concernSubject, setConcernSubject] = useState('');
  const [concernDetails, setConcernDetails] = useState('');
  const [concernSuccessMsg, setConcernSuccessMsg] = useState<string | null>(null);

  // Lost Key Modal State
  const [isLostKeyModalOpen, setIsLostKeyModalOpen] = useState(false);
  const [lostKeyReason, setLostKeyReason] = useState('');
  const [lostKeyConfirmChecked, setLostKeyConfirmChecked] = useState(false);

  // Query Hooks
  const { data: stats, isLoading: statsLoading } = useMyDashboardStats();
  const { data: docData, isLoading: docsLoading } = useMyDocuments({
    tab: activeTab,
    search: searchQuery,
    classification: classificationFilter,
    sortBy,
    page,
    pageSize: 5,
  });
  const { data: activityData, isLoading: activityLoading } = useMyActivity({ pageSize: 4 });
  const { data: notices = [] } = useSecurityNotices();
  const { data: keyInfo } = useMyKeyInfo();

  // Mutations
  const submitConcernMutation = useSubmitSecurityConcern();
  const reportLostKeyMutation = useReportLostKey();

  // Greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleConcernSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernSubject.trim() || !concernDetails.trim()) return;

    await submitConcernMutation.mutateAsync({
      subject: concernSubject.trim(),
      details: concernDetails.trim(),
    });

    setConcernSubject('');
    setConcernDetails('');
    setConcernSuccessMsg('Security concern submitted directly to Naval Command SOC.');
    setTimeout(() => setConcernSuccessMsg(null), 6000);
  };

  const handleReportLostKey = async () => {
    if (!keyInfo || !lostKeyConfirmChecked) return;

    await reportLostKeyMutation.mutateAsync({
      keyId: keyInfo.keyId,
      reason: lostKeyReason || 'Reported lost/stolen hardware token by officer',
      officerName: user?.name || 'Officer',
    });

    setIsLostKeyModalOpen(false);
    setLostKeyReason('');
    setLostKeyConfirmChecked(false);
  };

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
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ── 1. HEADER GREETING BLOCK ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            {getGreeting()}, {user?.rank || 'Officer'} {user?.name || 'Priya Singh'}
          </h1>
          <p className="text-xs text-[#64748B] mt-1 flex items-center flex-wrap gap-2">
            <span className="font-medium text-[#334155]">{user?.unit || 'INS Visakhapatnam (D66)'}</span>
            <span>•</span>
            <span className="font-mono text-blue-600 font-semibold">{user?.clearanceLevel || 'Level 3 (Secret)'}</span>
            <span>•</span>
            <span>Last login: {user?.lastLoginTime || '28 Sep 2026, 08:30 IST'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/my/requests')}
            className="btn-secondary text-xs px-3.5 py-2 cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Request Document Access</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 SMALL STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Documents Shared With Me */}
        <div
          onClick={() => {
            setActiveTab('All');
          }}
          className="stat-card cursor-pointer group hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Shared With Me
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {statsLoading ? '—' : stats?.documentsSharedWithMe ?? 6}
            </span>
            <span className="text-[11px] text-[#64748B]">Assigned</span>
          </div>
        </div>

        {/* Stat 2: Awaiting My Review */}
        <div
          onClick={() => {
            setActiveTab('New');
          }}
          className="stat-card cursor-pointer group hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Awaiting Review
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {statsLoading ? '—' : stats?.awaitingMyReview ?? 2}
            </span>
            <span className="text-[11px] text-indigo-600 font-semibold">Unopened</span>
          </div>
        </div>

        {/* Stat 3: Expiring Within 48h */}
        <div
          onClick={() => {
            setActiveTab('Expiring');
          }}
          className="stat-card cursor-pointer group hover:border-amber-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Expiring &lt; 48h
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600">
              {statsLoading ? '—' : stats?.expiringWithin48h ?? 2}
            </span>
            <span className="text-[11px] text-amber-700 font-medium">Action Required</span>
          </div>
        </div>

        {/* Stat 4: Pending Access Requests */}
        <div
          onClick={() => navigate('/my/requests')}
          className="stat-card cursor-pointer group hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider font-mono">
              Pending Requests
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#0F172A]">
              {statsLoading ? '—' : stats?.pendingAccessRequests ?? 1}
            </span>
            <span className="text-[11px] text-slate-500">In Routing</span>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN GRID: LEFT ASSIGNED DOCS + RIGHT STACKED WIDGETS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ── LEFT COLUMN: ASSIGNED DOCUMENTS + RECENT ACTIVITY (8 COLS) ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Assigned Documents Card */}
          <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs overflow-hidden">
            
            {/* Card Header & Tabs */}
            <div className="p-4 border-b border-[#E6EAF2] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  Assigned Documents
                </h2>
                <p className="text-[11.5px] text-[#64748B]">
                  Tactical records cryptographically encapsulated for your clearance
                </p>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0] overflow-x-auto">
                {(['All', 'New', 'Opened', 'Expiring', 'Expired'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Bar: Search, Classification & Sort */}
            <div className="p-3 bg-[#F8FAFC] border-b border-[#E6EAF2] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm bg-white px-2.5 py-1.5 rounded-lg border border-[#CBD5E1]">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Filter by document name or unit..."
                  className="w-full text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
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

            {/* Document List Table */}
            <div className="overflow-x-auto">
              {docsLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Loading encrypted document registry…
                </div>
              ) : docData?.documents.length === 0 ? (
                <div className="p-10 text-center text-slate-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold">No documents matched your criteria</p>
                  <p className="text-[11px] text-slate-400">Try adjusting your search terms or status tab filter.</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F8FAFC] text-[10.5px] font-bold text-[#64748B] uppercase tracking-wider font-mono border-b border-[#E6EAF2]">
                      <th className="py-2.5 px-4">Document Details</th>
                      <th className="py-2.5 px-3">Classification</th>
                      <th className="py-2.5 px-3">Origin Authority</th>
                      <th className="py-2.5 px-3">Access Type</th>
                      <th className="py-2.5 px-3">Expiry</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EAF2]">
                    {docData?.documents.map((doc: RecipientDocument) => (
                      <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Title & Version */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-[#0F172A] truncate max-w-[200px]">
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
                            <span className="text-slate-800 font-medium truncate max-w-[150px]">
                              {doc.sentByAuthority}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
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

                        {/* Open Securely Button */}
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
              <div className="p-3 bg-[#F8FAFC] border-t border-[#E6EAF2] flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing page {docData.page} of {docData.totalPages} ({docData.total} total)
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= docData.totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-2.5 py-1 rounded border border-[#CBD5E1] bg-white text-xs disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity (Own Events Only) */}
          <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2] mb-3">
              <div>
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  My Recent Activity
                </h3>
                <p className="text-[11px] text-[#64748B]">
                  Your personal signed cryptographic access records and receipts
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/my/activity')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Activity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {activityLoading ? (
              <div className="p-4 text-center text-slate-400 text-xs">Loading activity...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase font-mono border-b border-[#E6EAF2]">
                      <th className="py-2 px-2">Time</th>
                      <th className="py-2 px-2">Document</th>
                      <th className="py-2 px-2">Action</th>
                      <th className="py-2 px-2">Receipt ID</th>
                      <th className="py-2 px-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EAF2]">
                    {activityData?.events.map((evt) => (
                      <tr key={evt.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-2 text-slate-500 font-mono text-[11px]">
                          {evt.timeLocal}
                        </td>
                        <td className="py-2.5 px-2 font-medium text-slate-900 truncate max-w-[200px]">
                          {evt.documentTitle || 'Command Resource'}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="font-semibold text-slate-700">{evt.action}</span>
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[10.5px] text-blue-600">
                          {evt.receiptId}
                        </td>
                        <td className="py-2.5 px-2 text-right">
                          {evt.status === 'SUCCESS' ? (
                            <span className="pill-green">Success</span>
                          ) : evt.status === 'DENIED' ? (
                            <span className="pill-red">Denied</span>
                          ) : (
                            <span className="pill-blue">{evt.status}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: STACKED WIDGETS (4 COLS) ── */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Widget 1: My Key Status */}
          <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E6EAF2]">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  My Key Status
                </h3>
              </div>
              <span className={keyInfo?.status === 'Active' ? 'pill-green' : 'pill-red'}>
                {keyInfo?.status || 'Active'}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] uppercase text-slate-400 block mb-0.5">Key Fingerprint</span>
                <span className="font-bold text-slate-800 text-[11px] break-all">
                  {keyInfo?.keyId || '0xKEM-768: 33BB:7711:00AA:55FF'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span>Algorithms:</span>
                <span className="font-bold text-slate-800">ML-KEM-768 / ML-DSA-65</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span>Valid Until:</span>
                <span className="text-slate-800 font-semibold">{keyInfo?.validUntil || '31 Dec 2026'}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600 px-1">
                <span>Device Binding:</span>
                <span className="text-blue-600 font-semibold">{keyInfo?.registeredDevice.id || 'HW-HSM-9402'}</span>
              </div>
            </div>

            {/* Action: Report Lost Device / Key */}
            <div className="pt-2 border-t border-[#E6EAF2]">
              <button
                type="button"
                onClick={() => setIsLostKeyModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold font-['Montserrat'] border border-red-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                <span>Report Lost Device / Key</span>
              </button>
            </div>
          </div>

          {/* Widget 2: Security Notices */}
          <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E6EAF2]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  Security Notices
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Naval PKI</span>
            </div>

            <div className="space-y-2">
              {notices.map((notice) => (
                <div key={notice.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-[11.5px]">{notice.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{notice.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{notice.summary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Report a Security Concern */}
          <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-4 space-y-3">
            <div className="pb-2 border-b border-[#E6EAF2]">
              <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                Report a Security Concern
              </h3>
              <p className="text-[11px] text-slate-500">
                Direct confidential report to Naval Security Operations Center
              </p>
            </div>

            {concernSuccessMsg && (
              <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{concernSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleConcernSubmit} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-mono">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={concernSubject}
                  onChange={(e) => setConcernSubject(e.target.value)}
                  placeholder="e.g. Unsolicited access prompt, token glitch"
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-mono">
                  Details *
                </label>
                <textarea
                  required
                  rows={3}
                  value={concernDetails}
                  onChange={(e) => setConcernDetails(e.target.value)}
                  placeholder="Provide precise observation details..."
                  className="w-full text-xs p-2 rounded-lg border border-[#CBD5E1] bg-[#F8FAFC] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitConcernMutation.isPending}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-['Montserrat'] shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{submitConcernMutation.isPending ? 'Transmitting…' : 'Submit Concern Report'}</span>
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* ── LOST DEVICE / KEY CONFIRMATION MODAL ── */}
      {isLostKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Montserrat']">
                  Confirm Key & Device Revocation
                </h3>
                <p className="text-xs text-red-600 font-semibold font-mono">
                  CRITICAL DEFENSE ACTION • IMMEDIATE BLACKLIST
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 leading-relaxed">
              Reporting this hardware token or key as lost will immediately revoke its cryptographic clearance across all Naval Task Force nodes. All active ephemeral sessions will terminate instantly.
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono block">
                Incident Description / Circumstances:
              </label>
              <textarea
                rows={2}
                value={lostKeyReason}
                onChange={(e) => setLostKeyReason(e.target.value)}
                placeholder="Describe when and where the device was misplaced..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lostKeyConfirmChecked}
                onChange={(e) => setLostKeyConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold">
                I understand that this action is irreversible and immediately notifies the Naval Security Operations Center.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLostKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!lostKeyConfirmChecked || reportLostKeyMutation.isPending}
                onClick={handleReportLostKey}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-['Montserrat'] disabled:opacity-50 cursor-pointer"
              >
                {reportLostKeyMutation.isPending ? 'Revoking…' : 'Revoke Key Immediately'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
