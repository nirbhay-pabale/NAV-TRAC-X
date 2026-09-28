import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Radio,
  Bell,
  ChevronDown,
  ShieldCheck,
  Sliders,
  LogOut
} from 'lucide-react';
import { useSystemMode } from '../../hooks/useSystemMode';

interface TopBarProps {
  onOpenSearch: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { label, isAirGapped, toggleEmconMode, pqcStatus, isPqcActive, togglePqcMode } = useSystemMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Active preset case state
  const [selectedPreset, setSelectedPreset] = useState('INV-2026-0042 (Operation Alpha)');

  // Dev HUD flag (off by default)
  const isDevHudEnabled = typeof window !== 'undefined' && (window as any).VITE_DEV_HUD === true;

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onOpenSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenSearch]);

  // Dynamic Breadcrumb based on path
  const getBreadcrumbs = () => {
    const p = location.pathname;
    if (p.startsWith('/investigations/')) {
      const caseId = p.split('/')[2] || 'INV-2026-0042';
      return { section: 'Investigations', page: `Case ${caseId}` };
    }
    if (p.startsWith('/investigations')) return { section: 'Investigations', page: 'Case Directory' };
    if (p.startsWith('/distribute')) return { section: 'Distribution', page: 'New Distribution' };
    if (p.startsWith('/documents')) return { section: 'Document Registry', page: 'Master Archive' };
    if (p.startsWith('/recipients')) return { section: 'Recipients', page: 'Naval PKI Directory' };
    if (p.startsWith('/ledger')) return { section: 'Ledger', page: 'Tamper-Evident Hash Chain' };
    if (p.startsWith('/authorization')) return { section: 'Authorization', page: 'Clearance & Policies' };
    if (p.startsWith('/emcon')) return { section: 'EMCON', page: 'Operational Comms Map' };
    return { section: 'Dashboard', page: 'Command Center' };
  };

  const breadcrumbs = getBreadcrumbs();

  const handleSignOut = () => {
    localStorage.removeItem('navtrac_remember_flag');
    navigate('/login');
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem('navtrac_active_role') : 'investigator';
  const userName = role === 'normal_user' ? 'Lt. Priya Singh' : 'Lt. Cdr. S. Rao';
  const userUnit = role === 'normal_user' ? 'IO • Eastern Fleet' : 'IO • Western Command';

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-[#E6EAF2] px-6 flex items-center justify-between gap-4 select-none shadow-xs">
      
      {/* ── LEFT: BREADCRUMB + LIVE PILL ── */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-xs sm:text-[13px] text-[#64748B] flex items-center gap-2 font-medium truncate">
          <span className="text-[#0F172A] font-bold tracking-tight">NAV-TRAC X</span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#475569]">{breadcrumbs.section}</span>
          <span className="text-[#94A3B8]">&gt;</span>
          <span className="text-[#0F172A] font-semibold truncate">{breadcrumbs.page}</span>
        </div>

        <span className="pill-green px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
          <span>v1.0 Live</span>
        </span>
      </div>

      {/* ── CENTER: QUICK SEARCH INPUT (COMMAND PALETTE) ── */}
      <div className="hidden md:flex flex-1 max-w-lg mx-3">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full h-10 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-left flex items-center justify-between text-xs text-[#64748B] transition-all group shadow-2xs hover:border-[#94A3B8] cursor-pointer"
          aria-label="Quick Search"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors shrink-0" />
            <span className="truncate font-medium">Search by document, recipient, hash, block…</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold text-[#64748B] bg-white border border-[#CBD5E1] rounded-md shadow-2xs shrink-0 whitespace-nowrap">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* ── RIGHT CONTROLS ── */}
      <div className="flex items-center gap-3">
        
        {/* Preset Filter Dropdown */}
        <div className="relative hidden xl:block">
          <button
            type="button"
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="h-10 flex items-center gap-2 px-3.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white text-xs font-medium text-[#0F172A] shadow-2xs transition-all cursor-pointer"
          >
            <span className="text-[#94A3B8] text-[11px]">Preset:</span>
            <span className="font-mono text-[11px] font-semibold truncate max-w-[180px]">{selectedPreset}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showPresetDropdown && (
            <div className="absolute right-0 mt-2 w-68 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-1.5 z-50 text-xs font-sans animate-fadeIn">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider font-mono">
                Saved Case Presets
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('INV-2026-0042 (Operation Alpha)');
                  setShowPresetDropdown(false);
                  navigate('/investigations/INV-2026-0042');
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F1F5F9] font-mono text-[11px] text-[#0F172A] cursor-pointer"
              >
                INV-2026-0042 (Operation Alpha)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedPreset('INV-2026-0043 (Naval Signal 88)');
                  setShowPresetDropdown(false);
                  navigate('/investigations/INV-2026-0043');
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-[#F1F5F9] font-mono text-[11px] text-[#0F172A] cursor-pointer"
              >
                INV-2026-0043 (Naval Signal 88)
              </button>
            </div>
          )}
        </div>

        {/* EMCON Status Pill */}
        <button
          type="button"
          onClick={toggleEmconMode}
          title="Click to toggle EMCON mode"
          className={`h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
            isAirGapped
              ? 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A] border border-[#FCD34D]'
              : 'bg-[#DCFCE7] text-[#15803D] hover:bg-[#BBF7D0] border border-[#86EFAC]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>{label}</span>
        </button>

        {/* PQC Verification Pill */}
        <button
          type="button"
          onClick={togglePqcMode}
          title="Click to toggle PQC mode"
          className={`h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer hidden lg:inline-flex ${
            isPqcActive
              ? 'bg-[#E0EDFF] text-[#1D4ED8] hover:bg-[#BFDBFE] border border-[#93C5FD]'
              : 'bg-[#FEF3C7] text-[#B45309] hover:bg-[#FDE68A] border border-[#FCD34D]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{pqcStatus}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475569] transition-colors relative shadow-2xs cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#2563EB] ring-2 ring-white" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-3 z-50 text-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                <span className="font-bold text-[#0F172A]">SECURITY NOTIFICATIONS</span>
                <span className="pill-blue px-2 py-0.5 text-[10px] font-bold">2 New</span>
              </div>
              <div className="space-y-1.5">
                <div
                  onClick={() => {
                    navigate('/investigations/INV-2026-0042');
                    setShowNotifications(false);
                  }}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-[#1D4ED8]">Attribution Result Resolved</p>
                  <p className="text-[11px] text-[#64748B]">Match score 99.8% on Case INV-2026-0042.</p>
                </div>
                <div
                  onClick={() => {
                    navigate('/ledger');
                    setShowNotifications(false);
                  }}
                  className="p-2.5 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-[#15803D]">Merkle Block #4192 Sealed</p>
                  <p className="text-[11px] text-[#64748B]">Hash chain integrity verified across 6 nodes.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User / Unit Pill with Green Dot */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="h-10 flex items-center gap-2 px-3.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] text-xs font-medium text-[#0F172A] shadow-2xs transition-all cursor-pointer"
            aria-label="User profile"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100" />
            <span className="font-semibold">{userUnit}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-2 z-50 text-xs animate-fadeIn">
              <div className="px-3 py-2 border-b border-[#E2E8F0]">
                <p className="font-bold text-[#0F172A] uppercase">{userName}</p>
                <p className="text-[10.5px] text-[#64748B] mt-0.5">
                  {role === 'normal_user' ? 'Clearance Level 3 (Recipient)' : 'Clearance Level 4 (Top Secret)'}
                </p>
              </div>
              <div className="mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/authorization');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-left text-[#334155] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>Security Clearance</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/emcon');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#F1F5F9] text-left text-[#334155] cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#B45309]" />
                  <span>EMCON Settings</span>
                </button>
                <div className="h-[1px] bg-[#E2E8F0] my-1" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 text-left font-medium cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out / Switch Role</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Optional Dev Overlay */}
        {isDevHudEnabled && (
          <div className="hidden 2xl:flex items-center gap-1.5 text-[10px] font-mono text-[#94A3B8] bg-[#F1F5F9] px-2 py-0.5 rounded border border-[#E2E8F0]">
            <span>FPS N/A</span>
            <span>|</span>
            <span>GPU 0%</span>
            <span>|</span>
            <span>CPU 14%</span>
            <span>|</span>
            <span>LAT N/A</span>
          </div>
        )}
      </div>
    </header>
  );
};
