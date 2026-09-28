import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, X, Check } from 'lucide-react';
import { useEmconIncidents } from '../../hooks/useEmconData';
import { IncidentDetailModal } from './IncidentDetailModal';
import type { EmconIncident } from '../../types/emcon';

export const EmconIncidentAlertsCard: React.FC = () => {
  const navigate = useNavigate();
  const { data: incidents } = useEmconIncidents();

  const [selectedIncident, setSelectedIncident] = useState<EmconIncident | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [monitoredList, setMonitoredList] = useState<Record<string, boolean>>({});

  const handleActionClick = (incident: EmconIncident) => {
    if (incident.actionLabel === 'Investigate') {
      navigate('/investigations/new');
    } else if (incident.actionLabel === 'Review') {
      setSelectedIncident(incident);
    } else {
      // Monitor action: acknowledge / dismiss
      setMonitoredList((prev) => ({ ...prev, [incident.id]: true }));
      setToastMessage(`Incident #${incident.id} acknowledged: Assigned to automated RF telemetry monitoring.`);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const getSeverityPill = (severity: 'High' | 'Medium' | 'Low') => {
    if (severity === 'High') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          High
        </span>
      );
    }
    if (severity === 'Medium') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-50 text-teal-700 border border-teal-200">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        Low
      </span>
    );
  };

  return (
    <>
      <div className="rounded-xl bg-white border border-[#E6EAF2] p-4 shadow-sm flex flex-col justify-between h-[222px] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-wide">
              EMCON Incident Alerts
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
                <th className="pb-1.5">SEVERITY</th>
                <th className="pb-1.5">DESCRIPTION</th>
                <th className="pb-1.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {incidents?.map((inc) => {
                const isMonitored = monitoredList[inc.id];
                return (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-1.5 text-slate-600 text-[10.5px] font-bold">
                      {inc.timeZ}
                    </td>
                    <td className="py-1.5">
                      {getSeverityPill(inc.severity)}
                    </td>
                    <td className="py-1.5 text-slate-700 font-sans text-[10.5px] truncate max-w-[200px]">
                      {inc.description}
                    </td>
                    <td className="py-1.5 text-right font-sans">
                      {isMonitored ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-mono">
                          <Check className="w-3 h-3" /> Monitored
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleActionClick(inc)}
                          className={`px-3 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                            inc.actionLabel === 'Investigate'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                              : inc.actionLabel === 'Review'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {inc.actionLabel}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-2 left-4 right-4 z-40 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-mono flex items-center gap-2 shadow-lg animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Incident Detail Modal */}
      <IncidentDetailModal
        isOpen={selectedIncident !== null}
        onClose={() => setSelectedIncident(null)}
        incident={selectedIncident}
      />

      {/* View All Incidents Modal */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                    EMCON Tactical Incident Register
                  </h3>
                  <p className="text-[11px] text-[#64748B]">
                    Active alerts, unauthorized RF signals, and provenance breaches
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
                    <th className="pb-2">SEVERITY</th>
                    <th className="pb-2">DESCRIPTION</th>
                    <th className="pb-2">UNIT</th>
                    <th className="pb-2 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {incidents?.map((inc) => (
                    <tr key={inc.id} className="hover:bg-slate-50 font-sans transition-colors">
                      <td className="py-2.5 font-mono text-slate-600 font-bold text-[11px]">
                        {inc.timeZ}
                      </td>
                      <td className="py-2.5">
                        {getSeverityPill(inc.severity)}
                      </td>
                      <td className="py-2.5 text-[#0F172A] text-[11px]">
                        {inc.description}
                      </td>
                      <td className="py-2.5 text-slate-600 text-[11px]">
                        {inc.unitVessel}
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAllModal(false);
                            handleActionClick(inc);
                          }}
                          className="px-3 py-1 rounded-lg text-[10.5px] font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
                        >
                          {inc.actionLabel}
                        </button>
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
