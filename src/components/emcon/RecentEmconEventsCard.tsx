import React, { useState } from 'react';
import { FileText, ArrowRight, X } from 'lucide-react';
import { useEmconEvents } from '../../hooks/useEmconData';

export const RecentEmconEventsCard: React.FC = () => {
  const { data: recentEvents } = useEmconEvents({ limit: 5 });
  const { data: allEvents } = useEmconEvents();
  const [showAllModal, setShowAllModal] = useState(false);

  const getStatusPill = (status: string) => {
    if (status === 'Blocked' || status === 'Failed') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {status}
        </span>
      );
    }
    if (status === 'Restricted' || status === 'Warning') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {status}
      </span>
    );
  };

  return (
    <>
      <div className="rounded-xl bg-white border border-[#E6EAF2] p-4 shadow-sm flex flex-col justify-between h-[222px]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-100">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-wide">
              Recent EMCON Events
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowAllModal(true)}
            className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors hover:underline cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 mt-1.5">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-1.5 font-mono">TIME (Z)</th>
                <th className="pb-1.5">UNIT / VESSEL</th>
                <th className="pb-1.5">EVENT</th>
                <th className="pb-1.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {recentEvents?.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-1.5 text-slate-600 text-[10.5px] font-bold">
                    {evt.timeZ}
                  </td>
                  <td className="py-1.5 text-[#0F172A] font-medium text-[10.5px] font-sans truncate max-w-[130px]">
                    {evt.unitVessel}
                  </td>
                  <td className="py-1.5 text-slate-600 text-[10px] font-sans truncate max-w-[150px]">
                    {evt.event}
                  </td>
                  <td className="py-1.5 text-right">
                    {getStatusPill(evt.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View All Events Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    Full EMCON Event Stream
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Historical communication security records & protocol alerts
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <th className="pb-2 font-mono">TIME (Z)</th>
                    <th className="pb-2">UNIT / VESSEL</th>
                    <th className="pb-2">EVENT</th>
                    <th className="pb-2">CHANNEL</th>
                    <th className="pb-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allEvents?.map((evt) => (
                    <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-mono text-slate-600 font-bold text-[11px]">
                        {evt.timeZ} <span className="text-[9.5px] text-slate-400 font-normal">({evt.timeLocal})</span>
                      </td>
                      <td className="py-2.5 font-medium text-[#0F172A] text-[11.5px]">
                        {evt.unitVessel}
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">
                        {evt.event}
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[10.5px]">
                        {evt.channel || 'System'}
                      </td>
                      <td className="py-2.5 text-right">
                        {getStatusPill(evt.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
