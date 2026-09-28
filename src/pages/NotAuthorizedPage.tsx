import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NavalCrest } from '../components/NavalCrest';

interface NotAuthorizedPageProps {
  attemptedPath?: string;
  requiredRole?: string;
}

export const NotAuthorizedPage: React.FC<NotAuthorizedPageProps> = ({
  attemptedPath,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isNormalUser } = useAuth();

  const currentAttemptPath = attemptedPath || location.pathname;

  return (
    <div className="min-h-screen bg-[#071329] text-white flex flex-col justify-between p-6 select-none font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1E3A8A_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Top Bar Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-sky-900/30 pb-4">
        <div className="flex items-center gap-3">
          <NavalCrest size={40} className="flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-wider text-white font-['Montserrat'] flex items-center gap-1">
              NAV-TRAC <span className="text-[#f2b134]">X</span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              Indian Navy • Security Provenance System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-red-950/80 text-red-400 border border-red-800/50 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>HTTP 403 • FORBIDDEN</span>
          </span>
        </div>
      </header>

      {/* Main Alert Card */}
      <main className="relative z-10 max-w-xl w-full mx-auto my-auto py-8">
        <div className="bg-[#0B1B3A]/90 border border-red-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
          
          {/* Animated Red Shield Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-400 flex items-center justify-center mx-auto mb-5 shadow-[0_0_25px_rgba(239,68,68,0.25)]">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <span className="text-[11px] font-bold text-red-400 uppercase tracking-widest font-mono">
            ACCESS DENIED • SECURITY INCIDENT LOGGED
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Montserrat'] mt-2 mb-3">
            Not Authorized
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto mb-6">
            You do not have the required cryptographic clearance or forensic permissions to access this command module.
          </p>

          {/* Incident Telemetry Box */}
          <div className="bg-[#071329] border border-slate-800 rounded-xl p-4 text-left mb-6 font-mono text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="text-[10.5px] uppercase">Officer Account:</span>
              <span className="text-white font-semibold">{user ? `${user.rank} ${user.name} (${user.pno})` : 'Unauthenticated'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="text-[10.5px] uppercase">Attempted Route:</span>
              <span className="text-amber-400 font-semibold">{currentAttemptPath}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
              <span className="text-[10.5px] uppercase">Clearance Assigned:</span>
              <span className="text-sky-300">{user?.clearanceLevel || 'Level 3 (Secret - View Only)'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[10.5px] uppercase">Audit Action:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span>Recorded to Audit Ledger</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs text-left mb-6">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>
              This access denial has been automatically reported to the Naval Security Operations Center (SOC) & Chief Information Warfare Officer.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-['Montserrat'] flex items-center justify-center gap-2 transition-colors border border-slate-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(isNormalUser ? '/my/dashboard' : '/command-center')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-['Montserrat'] flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Return to My Authorized Dashboard</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer Classification */}
      <footer className="relative z-10 text-center text-[10px] font-mono text-slate-500 border-t border-slate-800 pt-3">
        INDIAN NAVY RESTRICTED DEFENSE NETWORK • UNAUTHORIZED ATTEMPTS ARE OFFENSES UNDER THE OFFICIAL SECRETS ACT
      </footer>
    </div>
  );
};
