import React from 'react';
import { RotateCcw, Calendar, ChevronDown } from 'lucide-react';
import type { RecipientFilters } from '../../types/recipient';

interface RecipientFilterBarProps {
  filters: RecipientFilters;
  onFilterChange: (newFilters: Partial<RecipientFilters>) => void;
  onReset: () => void;
}

export const RecipientFilterBar: React.FC<RecipientFilterBarProps> = ({
  filters,
  onFilterChange,
  onReset
}) => {
  const documentOptions = [
    'All Documents',
    'Operation_Alpha.pdf',
    'Intel_Threat_Assessment.pdf',
    'Mission_Plan_Bravo.pdf',
    'Sonar_Acoustic_Grids.pdf',
    'Cyber_Threat_Matrix.docx',
    'Fleet_Logistics_Matrix.xlsx'
  ];

  const recipientTypeOptions = [
    'All Types',
    'Users',
    'Groups',
    'Units / Vessels',
    'External Agencies'
  ];

  const unitVesselOptions = [
    'All Units',
    'INS Visakhapatnam (D66)',
    'Western Naval Command (WNC)',
    'INS Vikrant (R11)',
    'Naval Intelligence (NAV-INT)',
    'INS Shivalik (F47)',
    'Cyber Security Cell (NAV-CYBER)',
    'Submarine SSQ (Kalvari Class)',
    'Eastern Naval Command (ENC)'
  ];

  const accessStatusOptions = [
    'All Status',
    'Active',
    'Restricted',
    'Revoked'
  ];

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-3.5 shadow-sm flex flex-wrap items-end gap-3 justify-between">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 flex-1 min-w-[300px]">
        {/* Filter by Document */}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold text-slate-500 tracking-wide uppercase">
            Document
          </label>
          <div className="relative">
            <select
              value={filters.documentId}
              onChange={(e) => onFilterChange({ documentId: e.target.value, page: 1 })}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 text-xs text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-colors cursor-pointer"
            >
              {documentOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Recipient Type */}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold text-slate-500 tracking-wide uppercase">
            Recipient Type
          </label>
          <div className="relative">
            <select
              value={filters.recipientType}
              onChange={(e) => onFilterChange({ recipientType: e.target.value, page: 1 })}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 text-xs text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-colors cursor-pointer"
            >
              {recipientTypeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Unit / Vessel */}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold text-slate-500 tracking-wide uppercase">
            Unit / Vessel
          </label>
          <div className="relative">
            <select
              value={filters.unitVessel}
              onChange={(e) => onFilterChange({ unitVessel: e.target.value, page: 1 })}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 text-xs text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-colors cursor-pointer"
            >
              {unitVesselOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Access Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10.5px] font-bold text-slate-500 tracking-wide uppercase">
            Access Status
          </label>
          <div className="relative">
            <select
              value={filters.accessStatus}
              onChange={(e) => onFilterChange({ accessStatus: e.target.value, page: 1 })}
              className="w-full h-9 pl-3 pr-8 rounded-lg bg-slate-50 hover:bg-white border border-slate-200 text-xs text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-colors cursor-pointer"
            >
              {accessStatusOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Date Range */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <label className="text-[10.5px] font-bold text-slate-500 tracking-wide uppercase">
            Date Range
          </label>
          <div className="relative flex items-center h-9 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              value={filters.dateRange}
              onChange={(e) => onFilterChange({ dateRange: e.target.value, page: 1 })}
              className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full"
              placeholder="DD MMM YYYY – DD MMM YYYY"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        type="button"
        onClick={onReset}
        className="h-9 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        title="Reset all filters to default"
      >
        <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
        <span>Reset</span>
      </button>
    </div>
  );
};

export default RecipientFilterBar;
