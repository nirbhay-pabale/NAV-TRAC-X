import React, { useState } from 'react';
import {
  Radio,
  Download,
  ChevronDown,
  Check
} from 'lucide-react';
import { useCommunicationLog } from '../../hooks/useEmconData';
import { exportCommunicationLogCsv } from '../../utils/exportCsv';
import type { CommsLogFilters } from '../../types/emcon';

export const CommunicationLogCard: React.FC = () => {
  const [filters, setFilters] = useState<CommsLogFilters>({
    unit: 'All Units',
    timeRange: 'Last 24 Hours',
    searchQuery: ''
  });

  const { data: logEntries, isLoading } = useCommunicationLog(filters);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unitOptions = [
    'All Units',
    'INS Visakhapatnam',
    'Western Fleet HQ',
    'UAV-Alpha-03',
    'INS Vikramaditya',
    'Coastal Radar Unit',
    'INS Mormugao'
  ];

  const timeRangeOptions = [
    'Last 24 Hours',
    'Last 7 Days',
    'Last 30 Days',
    'All Historical Records'
  ];

  const handleExport = () => {
    if (!logEntries || logEntries.length === 0) {
      setToastMessage('No log records available to export for the current filters.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const result = exportCommunicationLogCsv(logEntries, {
      unit: filters.unit,
      timeRange: filters.timeRange
    });

    if (result.success) {
      setToastMessage(`Exported ${result.rowCount} log entries to ${result.filename}`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const getStatusPill = (status: string) => {
    if (status === 'Blocked') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          Blocked
        </span>
      );
    }
    if (status === 'Restricted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Restricted
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Success
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-[#E6EAF2] p-5 shadow-sm flex flex-col justify-between space-y-4 relative">
      {/* Header & Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
              Communication Log
            </h3>
            <p className="text-xs text-[#64748B]">
              Detailed log of communication attempts, blocks and authorizations
            </p>
          </div>
        </div>

        {/* Dropdowns & Export Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Unit Dropdown */}
          <div className="relative">
            <select
              value={filters.unit}
              onChange={(e) => setFilters((prev) => ({ ...prev, unit: e.target.value }))}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold px-3.5 py-2 pr-9 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              aria-label="Filter communication log by unit"
            >
              {unitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time Range Dropdown */}
          <div className="relative">
            <select
              value={filters.timeRange}
              onChange={(e) => setFilters((prev) => ({ ...prev, timeRange: e.target.value }))}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs font-semibold px-3.5 py-2 pr-9 rounded-xl focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
              aria-label="Filter communication log by time range"
            >
              {timeRangeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Export Log Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={!logEntries || logEntries.length === 0}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Download CSV report of active filtered log records"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Log</span>
          </button>
        </div>
      </div>

      {/* Log Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="pb-2.5 font-mono">TIME (Z)</th>
              <th className="pb-2.5">SOURCE</th>
              <th className="pb-2.5">DESTINATION</th>
              <th className="pb-2.5">CHANNEL</th>
              <th className="pb-2.5">EVENT</th>
              <th className="pb-2.5">POLICY</th>
              <th className="pb-2.5">DETAILS</th>
              <th className="pb-2.5 text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs font-sans">
                  Querying immutable communication audit ledger…
                </td>
              </tr>
            ) : logEntries && logEntries.length > 0 ? (
              logEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 text-slate-600 font-bold text-[11.5px]">
                    {entry.timeZ}
                  </td>
                  <td className="py-3 font-sans font-semibold text-[#0F172A] text-[11.5px]">
                    {entry.source}
                  </td>
                  <td className="py-3 font-sans text-slate-600 text-[11px]">
                    {entry.destination}
                  </td>
                  <td className="py-3 text-slate-500 text-[11px]">
                    {entry.channel}
                  </td>
                  <td className="py-3 font-sans text-slate-800 text-[11px]">
                    {entry.event}
                  </td>
                  <td className="py-3 font-sans text-slate-500 text-[11px]">
                    {entry.policy}
                  </td>
                  <td className="py-3 font-sans text-slate-600 text-[11px] truncate max-w-[240px]">
                    {entry.details}
                  </td>
                  <td className="py-3 text-right">
                    {getStatusPill(entry.status)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs font-sans">
                  No communication records found matching the specified unit and time criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute bottom-3 right-5 z-40 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-lg animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
