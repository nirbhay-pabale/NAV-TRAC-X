import React from 'react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10.5px] font-bold text-slate-400 tracking-widest uppercase">
            INDIAN NAVY • SECURE PROVENANCE SYSTEM
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Node Live
          </span>
        </div>

        <h1 className="text-2xl font-bold text-[#0F172A] tracking-tight">
          Command Center & Operational Telemetry
        </h1>

        <p className="text-xs text-[#64748B] mt-1 max-w-2xl">
          Post-quantum cryptographic document distribution, invisible steganographic watermark encapsulation, and sovereign provenance attribution.
        </p>
      </div>

      <div className="hidden lg:flex items-center gap-6 border-l border-slate-100 pl-6 text-right">
        <div className="flex flex-col text-[11px] font-bold tracking-wider text-slate-600 uppercase leading-relaxed">
          <span>TRUSTED DOCUMENTS</span>
          <span className="text-[#2563EB]">SECURE OPERATIONS</span>
          <span>STRONGER NATION</span>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
