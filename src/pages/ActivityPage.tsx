import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecentActivity } from '../hooks/useRecentActivity';

export const ActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: activities } = useRecentActivity();

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      <button
        onClick={() => navigate('/command-center')}
        className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Command Center
      </button>

      <div>
        <span className="text-[11px] font-bold text-[#8EABC1] tracking-widest uppercase">
          AUDIT LOGS
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Montserrat']">
          Full System & <span className="text-[#38bdf8]">Provenance Activity</span>
        </h1>
        <p className="text-xs text-[#9FB8CE] mt-0.5">
          Real-time decryption events, cryptographic commits, forensic scans, and node reconciliation.
        </p>
      </div>

      <div className="navtrac-dashboard-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <th className="pb-3 font-mono">TIME</th>
                <th className="pb-3">EVENT TYPE</th>
                <th className="pb-3">DOCUMENT / RECORD</th>
                <th className="pb-3">RECIPIENT / UNIT</th>
                <th className="pb-3 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {activities && activities.map((row) => (
                <tr key={row.id} className="hover:bg-sky-950/40 transition-colors">
                  <td className="py-3.5 font-mono text-slate-400 text-[11px]">{row.time}</td>
                  <td className="py-3.5 text-slate-200 font-semibold">{row.event}</td>
                  <td className="py-3.5 font-mono font-bold text-[#38bdf8]">{row.documentId}</td>
                  <td className="py-3.5 text-slate-300">{row.recipientUnit}</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
