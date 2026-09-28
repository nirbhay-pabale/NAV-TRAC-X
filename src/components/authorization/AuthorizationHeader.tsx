import React from 'react';
import { Lock, Plus } from 'lucide-react';

interface AuthorizationHeaderProps {
  onNewPolicyClick: () => void;
}

export const AuthorizationHeader: React.FC<AuthorizationHeaderProps> = ({ onNewPolicyClick }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Access Control Matrix & Authorization
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            HSM Quorum Active
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">
          Manage access policies, approvals, cryptographic clearance enforcement, and anomaly alerts.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNewPolicyClick}
          className="px-4 py-2 rounded-lg bg-[#0F5257] hover:bg-[#0b3e42] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Access Policy</span>
        </button>
      </div>
    </div>
  );
};

export default AuthorizationHeader;
