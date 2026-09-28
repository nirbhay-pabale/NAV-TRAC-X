import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  FileText,
  Users,
  Database,
  Search,
  ShieldCheck,
  Radio,
  LogOut
} from 'lucide-react';
import { NavalCrest } from '../NavalCrest';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isItemActive = (itemTo: string) => {
    if (itemTo.startsWith('/investigations')) {
      return location.pathname.startsWith('/investigations');
    }
    if (itemTo.startsWith('/documents')) {
      return location.pathname.startsWith('/documents');
    }
    if (itemTo.startsWith('/ledger')) {
      return location.pathname.startsWith('/ledger');
    }
    if (itemTo.startsWith('/recipients')) {
      return location.pathname.startsWith('/recipients');
    }
    if (itemTo.startsWith('/distribute')) {
      return location.pathname.startsWith('/distribute');
    }
    if (itemTo.startsWith('/authorization')) {
      return location.pathname.startsWith('/authorization');
    }
    if (itemTo.startsWith('/emcon')) {
      return location.pathname.startsWith('/emcon');
    }
    if (itemTo === '/command-center') {
      return location.pathname === '/command-center' || location.pathname === '/';
    }
    return location.pathname === itemTo;
  };

  const navItems = [
    { to: '/command-center', label: 'Command Center', icon: Home },
    { to: '/distribute', label: 'Distribute', icon: FileText },
    { to: '/documents', label: 'Documents', icon: FileText },
    { to: '/recipients', label: 'Recipients', icon: Users },
    { to: '/ledger', label: 'Ledger', icon: Database },
    { to: '/investigations/INV-2026-0042', label: 'Investigations', icon: Search },
    { to: '/authorization', label: 'Authorization', icon: ShieldCheck },
    { to: '/emcon', label: 'EMCON', icon: Radio },
  ];

  const handleSignOut = () => {
    localStorage.removeItem('navtrac_remember_flag');
    navigate('/login');
  };

  const role = typeof window !== 'undefined' ? localStorage.getItem('navtrac_active_role') : 'investigator';
  const userName = role === 'normal_user' ? 'Lt. Priya Singh' : 'Lt. Cdr. S. Rao';
  const userUnit = role === 'normal_user' ? 'Eastern Fleet HQ' : 'Western Naval Command';
  const userInitials = role === 'normal_user' ? 'PS' : 'SR';

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-[#0B1B3A] border-r border-[#1E2E4E] flex flex-col justify-between transition-all duration-300 select-none ${
        collapsed ? 'w-20' : 'w-[250px]'
      }`}
    >
      {/* Top Section: Logo & Nav Items */}
      <div>
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[#1E2E4E]">
          <NavalCrest size={38} className="flex-shrink-0" />
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-extrabold tracking-wider text-white font-['Montserrat'] flex items-center gap-1 leading-tight">
                NAV-TRAC <span className="text-[#f2b134]">X</span>
              </span>
              <span className="text-[11px] font-medium text-slate-300 truncate leading-tight mt-0.5">
                Indian Navy
              </span>
              <span className="text-[9.5px] text-slate-400 truncate leading-tight">
                Secure Provenance System
              </span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-3 px-2.5 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const active = isItemActive(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                  active
                    ? 'border-l-4 border-[#14B8A6] bg-[#14B8A6]/15 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#14B8A6]' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Card & Node Status */}
      <div className="p-3 border-t border-[#1E2E4E] space-y-2">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#071329] border border-[#1E2E4E]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-teal-600/30 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-500/30 flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {userUnit}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out / Switch role"
                className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-1 text-[9.5px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Air-gapped node</span>
              </span>
              <span>Indian Navy</span>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="w-full flex justify-center py-2 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
