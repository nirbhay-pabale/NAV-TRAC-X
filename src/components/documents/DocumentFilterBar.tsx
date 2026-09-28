import React from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import type { DocumentFilters } from '../../types/document';

interface DocumentFilterBarProps {
  filters: DocumentFilters;
  onChange: (updated: Partial<DocumentFilters>) => void;
  onReset: () => void;
  totalResults: number;
}

export const DocumentFilterBar: React.FC<DocumentFilterBarProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const classificationOptions = [
    'All Classifications',
    'TOP SECRET (CODEWORD)',
    'TOP SECRET',
    'SECRET',
    'CONFIDENTIAL'
  ];

  const documentTypeOptions = [
    'All Types',
    'Operational',
    'Hydrographic',
    'Satcom',
    'Acoustic',
    'Sortie',
    'Radar'
  ];

  const statusOptions = [
    'All Statuses',
    'Distributed',
    'Draft',
    'Archived'
  ];

  const dateRangeOptions = [
    'All Time',
    'Last 24 Hours',
    'Last 7 Days',
    'Last 30 Days'
  ];

  const hasActiveFilters =
    filters.classification !== 'All Classifications' ||
    filters.documentType !== 'All Types' ||
    filters.status !== 'All Statuses' ||
    filters.dateRange !== 'All Time' ||
    filters.searchQuery !== '';

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onChange({ searchQuery: e.target.value })}
            placeholder="Search documents by ID, file name, fingerprint hash..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onChange({ searchQuery: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Counter and Reset */}
        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Showing <strong className="text-slate-900">{totalResults}</strong> documents</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] text-slate-700 font-semibold transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        <div className="relative">
          <select
            value={filters.classification}
            onChange={(e) => onChange({ classification: e.target.value })}
            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {classificationOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.documentType}
            onChange={(e) => onChange({ documentType: e.target.value })}
            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {documentTypeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {statusOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={filters.dateRange}
            onChange={(e) => onChange({ dateRange: e.target.value })}
            className="w-full appearance-none bg-slate-50 hover:bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer transition-colors"
          >
            {dateRangeOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default DocumentFilterBar;
