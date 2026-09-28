import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Loader2 } from 'lucide-react';
import { useRecentActivity } from '../../hooks/useRecentActivity';

export const RecentActivityTable: React.FC = () => {
  const navigate = useNavigate();
  const { data: activities, isLoading, isError } = useRecentActivity();

  const getStatusBadge = (status: string, statusType: string) => {
    switch (statusType) {
      case 'green':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            {status}
          </span>
        );
      case 'orange':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            {status}
          </span>
        );
      case 'blue':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
            {status}
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="navtrac-dashboard-card p-5 flex flex-col justify-between h-full">
      {/* Table Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-['Montserrat']">
                RECENT ACTIVITY
              </h3>
              <p className="text-[11px] text-[#8EABC1]">
                Latest system and provenance events
              </p>
            </div>
          </div>

          {/* View All Link */}
          <button
            type="button"
            onClick={() => navigate('/activity')}
            className="text-xs font-semibold text-[#38bdf8] hover:text-sky-300 flex items-center gap-1 transition-colors hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
            <span className="text-xs">Fetching provenance events…</span>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-xs text-red-400">
            Unable to load activity records. Please verify air-gapped ledger connection.
          </div>
        )}

        {/* Table Content */}
        {!isLoading && !isError && activities && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-2 font-mono">TIME</th>
                  <th className="pb-2">EVENT</th>
                  <th className="pb-2">DOCUMENT</th>
                  <th className="pb-2">RECIPIENT / UNIT</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activities.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => row.detailsUrl && navigate(row.detailsUrl)}
                    className="hover:bg-sky-950/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-2.5 font-mono text-slate-400 text-[11px]">
                      {row.time}
                    </td>
                    <td className="py-2.5 text-slate-300 font-medium">
                      {row.event}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[#38bdf8] group-hover:underline font-semibold font-mono text-[11.5px]">
                        {row.documentId}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-400 text-[11px]">
                      {row.recipientUnit}
                    </td>
                    <td className="py-2.5 text-right">
                      {getStatusBadge(row.status, row.statusType)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
