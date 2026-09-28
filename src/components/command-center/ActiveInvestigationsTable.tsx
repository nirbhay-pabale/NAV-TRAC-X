import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useActiveInvestigations } from '../../hooks/useActiveInvestigations';

export const ActiveInvestigationsTable: React.FC = () => {
  const navigate = useNavigate();
  const { data: cases, isLoading, isError } = useActiveInvestigations();

  const getProgressBar = (progress: number, statusType: string) => {
    let barColor = 'bg-sky-400';
    let glowColor = 'rgba(56, 189, 248, 0.5)';

    if (statusType === 'teal') {
      barColor = 'bg-[#2dd4bf]';
      glowColor = 'rgba(45, 212, 191, 0.5)';
    } else if (statusType === 'orange') {
      barColor = 'bg-[#38bdf8]';
      glowColor = 'rgba(56, 189, 248, 0.5)';
    } else if (statusType === 'red') {
      barColor = 'bg-[#ef4444]';
      glowColor = 'rgba(239, 68, 68, 0.5)';
    }

    return (
      <div className="flex items-center gap-2">
        <div className="w-20 sm:w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-500`}
            style={{
              width: `${progress}%`,
              boxShadow: `0 0 6px ${glowColor}`
            }}
          />
        </div>
        <span className="text-[10.5px] font-mono text-slate-400">{progress}%</span>
      </div>
    );
  };

  const getStatusPill = (status: string, statusType: string) => {
    switch (statusType) {
      case 'teal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-teal-950/60 border border-teal-500/40 text-[10.5px] font-semibold text-[#2dd4bf]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf]" />
            {status}
          </span>
        );
      case 'orange':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-[10.5px] font-semibold text-[#fbbf24]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fbbf24]" />
            {status}
          </span>
        );
      case 'red':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-950/60 border border-red-500/40 text-[10.5px] font-semibold text-[#ef4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            {status}
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="navtrac-dashboard-card p-5 flex flex-col justify-between h-full">
      <div>
        {/* Table Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-[#f2b134]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold tracking-wider text-white uppercase font-['Montserrat']">
                ACTIVE INVESTIGATIONS
              </h3>
              <p className="text-[11px] text-[#8EABC1]">
                Ongoing forensic cases
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/investigations')}
            className="text-xs font-semibold text-[#38bdf8] hover:text-sky-300 flex items-center gap-1 transition-colors hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading / Error States */}
        {isLoading && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
            <span className="text-xs">Loading forensic cases…</span>
          </div>
        )}

        {isError && (
          <div className="py-8 text-center text-xs text-red-400">
            Unable to load active cases.
          </div>
        )}

        {/* Table Content */}
        {!isLoading && !isError && cases && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <th className="pb-2 font-mono">CASE ID</th>
                  <th className="pb-2">ARTIFACT</th>
                  <th className="pb-2">PROGRESS</th>
                  <th className="pb-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {cases.map((c) => (
                  <tr
                    key={c.caseId}
                    onClick={() => navigate(`/investigations/${c.caseId}`)}
                    className="hover:bg-sky-950/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 font-mono font-bold text-slate-200 group-hover:text-sky-300 text-[11.5px]">
                      {c.caseId}
                    </td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {c.artifact}
                    </td>
                    <td className="py-3">
                      {getProgressBar(c.progress, c.statusType)}
                    </td>
                    <td className="py-3 text-right">
                      {getStatusPill(c.status, c.statusType)}
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
