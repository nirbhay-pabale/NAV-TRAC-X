import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';

export const EmconHeader: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            EMCON Operations & Radio Silence Control
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
            <Radio className="w-3 h-3 text-amber-600" />
            EMCON Bravo Active
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">
          Monitor, control, and audit emission control postures and offline vessel packet queues across sovereign naval fleets.
        </p>
      </div>

      <div className="flex items-center gap-2 font-mono text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
        <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
        <span>Tactical Status: <strong className="text-slate-900">RF-Silent Ready</strong></span>
      </div>
    </div>
  );
};

export default EmconHeader;
