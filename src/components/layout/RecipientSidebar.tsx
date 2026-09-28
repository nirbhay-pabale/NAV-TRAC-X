import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NavalCrest } from '../NavalCrest';
import { RECIPIENT_MENU_CONFIG } from '../../utils/permissions';
import { useAuth } from '../../context/AuthContext';

interface RecipientSidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const RecipientSidebar: React.FC<RecipientSidebarProps> = ({ collapsed = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isItemActive = (to: string) => {
    if (to === '/my/dashboard') {
      return location.pathname === '/my/dashboard' || location.pathname === '/my';
    }
    if (to === '/my/documents') {
      return location.pathname.startsWith('/my/documents');
    }
    return location.pathname.startsWith(to);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'PS';

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
                Recipient Secure Portal
              </span>
            </div>
          )}
        </div>

        {/* Role Badge Indicator */}
        {!collapsed && (
          <div className="px-3 pt-3">
            <div className="px-2.5 py-1.5 rounded-lg bg-[#071329] border border-[#1E2E4E] flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-300">
                ROLE ACCESS:
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold font-mono bg-blue-900/60 text-blue-300 border border-blue-500/30">
                Officer / Recipient
              </span>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="mt-3 px-2.5 space-y-1" aria-label="Recipient Navigation">
          {RECIPIENT_MENU_CONFIG.map((item) => {
            const active = isItemActive(item.to);
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-all ${
                  active
                    ? 'border-l-4 border-[#38BDF8] bg-[#38BDF8]/15 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 font-normal'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#38BDF8]' : 'text-slate-400'}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: User Card & Classification Badge */}
      <div className="p-3 border-t border-[#1E2E4E] space-y-2">
        {!collapsed ? (
          <>
            <div className="flex items-center justify-between p-2 rounded-lg bg-[#071329] border border-[#1E2E4E]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center border border-blue-500/30 flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {user?.name || 'Lt. Priya Singh'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight">
                    {user?.unit || 'INS Visakhapatnam (D66)'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                title="Sign out / Switch role"
                className="p-1 text-slate-400 hover:text-red-400 transition-colors rounded cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="px-1 text-[9.5px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>PQC Key Active</span>
              </span>
              <span className="text-slate-500">View-Only</span>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={handleSignOut}
            title="Sign out"
            className="w-full flex justify-center py-2 text-slate-400 hover:text-red-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
