import React from 'react';
import { useDocumentStats } from '../../hooks/useDocumentData';
import { FileText, Share2, ShieldCheck, AlertTriangle } from 'lucide-react';

export const DocumentStatCards: React.FC = () => {
  const { data: stats } = useDocumentStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
      {/* Card 1: Total Documents */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Total Documents</span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-[#0F172A] font-mono">
            {stats?.totalDocuments || 28}
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            +4 this week
          </span>
        </div>
      </div>

      {/* Card 2: Active Distributions */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Active Distributions</span>
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
            <Share2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-[#0F172A] font-mono">
            {stats?.activeDistributions || 14}
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            64 Replicas
          </span>
        </div>
      </div>

      {/* Card 3: Metadata Sanitized */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Metadata Sanitized</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-[#0F172A] font-mono">
            {stats?.metadataSanitizedPercentage || 96.4}%
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            Zero EXIF
          </span>
        </div>
      </div>

      {/* Card 4: External Leak Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">External Leak Alerts</span>
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-2xl font-bold text-red-600 font-mono">
            {stats?.externalLeakAlerts || 2}
          </div>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            1 Active Case
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentStatCards;
