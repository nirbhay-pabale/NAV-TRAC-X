import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Radio,
  Bell,
  ChevronDown,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_RECIPIENT_DOCUMENTS, INITIAL_SECURITY_NOTICES } from '../../data/recipientMockData';

interface RecipientTopBarProps {
  onOpenSearch?: () => void;
}

export const RecipientTopBar: React.FC<RecipientTopBarProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dual-timezone clock state
  const [timeUtc, setTimeUtc] = useState('');
  const [timeIst, setTimeIst] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const zHours = now.getUTCHours().toString().padStart(2, '0');
      const zMinutes = now.getUTCMinutes().toString().padStart(2, '0');
      setTimeUtc(`${zHours}:${zMinutes}Z`);

      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTimeIst(`${istString} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p.startsWith('/my/documents/') && p.endsWith('/view')) {
      return { section: 'Secure Viewer', page: 'Document Decryption & View' };
    }
    if (p.startsWith('/my/documents')) return { section: 'Documents', page: 'My Assigned Documents' };
    if (p.startsWith('/my/requests')) return { section: 'Clearance', page: 'Access Requests' };
    if (p.startsWith('/my/activity')) return { section: 'Audit', page: 'My Activity & Receipts' };
    if (p.startsWith('/my/keys')) return { section: 'PKI Keys', page: 'My Key Status & Hardware' };
    if (p.startsWith('/my/guidelines')) return { section: 'Protocol', page: 'Security Guidelines' };
    return { section: 'Recipient', page: 'My Dashboard' };
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  // Filtered documents for the scoped recipient search
  const searchResults = searchQuery.trim()
    ? INITIAL_RECIPIENT_DOCUMENTS.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : INITIAL_RECIPIENT_DOCUMENTS.slice(0, 4);

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E6EAF2] px-6 flex items-center justify-between gap-4 select-none shadow-xs">
      
      {/* ── LEFT: BREADCRUMB + LIVE BADGE ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-xs sm:text-[13px] text-[#64748B] flex items-center gap-2 font-medium truncate">
          <span className="text-[#0F172A] font-bold tracking-tight">NAV-TRAC X</span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#475569]">{breadcrumbs.section}</span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#0F172A] font-semibold truncate">{breadcrumbs.page}</span>
        </div>

        <span className="pill-blue px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
          <span>Recipient Portal</span>
        </span>
      </div>

      {/* ── CENTER: SCOPED SEARCH BAR (COMMAND PALETTE) ── */}
      <div className="hidden md:flex flex-1 max-w-lg mx-3">
        <button
          type="button"
          onClick={() => setSearchModalOpen(true)}
          className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-left flex items-center justify-between text-xs text-[#64748B] transition-all group shadow-2xs hover:border-[#94A3B8] cursor-pointer"
          aria-label="Search my documents"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0" />
            <span className="truncate font-medium">Search my assigned documents…</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold text-[#64748B] bg-white border border-[#CBD5E1] rounded-md shadow-2xs shrink-0 whitespace-nowrap">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* ── RIGHT CONTROLS ── */}
      <div className="flex items-center gap-3">
        
        {/* Dual-Timezone Clock (Zulu + IST) */}
        <div className="hidden lg:flex items-center gap-2.5 px-3.5 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono shadow-2xs">
          <span className="text-[#0F172A] font-bold">{timeUtc}</span>
          <span className="text-slate-300">•</span>
          <span className="text-[#475569]">{timeIst}</span>
        </div>

        {/* Read-Only EMCON Status Pill */}
        <div
          title="EMCON Mode: Connected (Read-Only Status)"
          className="h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] shadow-2xs cursor-default"
        >
          <Radio className="w-3.5 h-3.5" />
          <span>EMCON Alpha</span>
        </div>

        {/* Read-Only PQC ACTIVE Pill */}
        <div
          title="Post-Quantum Cryptography: ML-KEM-768 & ML-DSA-65 Active"
          className="h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 bg-[#E0EDFF] text-[#1D4ED8] border border-[#93C5FD] shadow-2xs hidden sm:inline-flex cursor-default"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>PQC ACTIVE</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475569] transition-colors relative shadow-2xs cursor-pointer"
            aria-label="Security notices"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-3 z-50 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                <span className="font-bold text-[#0F172A] uppercase">Security Notices</span>
                <span className="pill-blue px-2 py-0.5 text-[10px] font-bold">{INITIAL_SECURITY_NOTICES.length} Items</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {INITIAL_SECURITY_NOTICES.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/my/guidelines');
                    }}
                    className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer border border-[#E2E8F0]/60 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#1E293B] text-[11.5px] truncate">
                        {notice.title}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] font-mono">{notice.date}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B] leading-relaxed line-clamp-2">
                      {notice.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Chip */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-10 flex items-center gap-2 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-2xs transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span className="font-semibold truncate max-w-[140px]">
              {user?.rank ? `${user.rank} ${user.name.split(' ').pop()}` : 'Lt. Singh'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-2 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#0F172A]">{user?.rank} {user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.unit}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    {user?.clearanceLevel || 'Level 3 (Secret)'}
                  </span>
                </div>
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/my/dashboard');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-left text-[#334155] cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 text-[#2563EB]" />
                  <span>My Profile & Dashboard</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/my/documents');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-left text-[#334155] cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#14B8A6]" />
                  <span>My Documents</span>
                </button>
                <div className="h-[1px] bg-[#E2E8F0] my-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-600 text-left font-medium cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── SCOPED QUICK SEARCH MODAL ── */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-start justify-center pt-20 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden">
            {/* Input Header */}
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              <Search className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search my assigned documents by title, ID, or mission..."
                className="w-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scoped Document Results */}
            <div className="p-3 max-h-80 overflow-y-auto space-y-1.5">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Assigned Documents ({searchResults.length})
              </div>
              {searchResults.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No matching documents found in your clearance scope.
                </div>
              ) : (
                searchResults.map((doc) => (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSearchModalOpen(false);
                      navigate(`/my/documents/${doc.id}/view`);
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600">
                          {doc.title}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate">
                          {doc.documentNumber} • {doc.version} • {doc.sentByAuthority}
                        </span>
                      </div>
                    </div>
                    <span className="pill-blue text-[10px]">{doc.classification}</span>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Scoped to authorized recipient documents only</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
