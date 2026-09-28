import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ForensicWorkbench } from '../components/investigations/ForensicWorkbench';
import { ScreenLeakIncidentBanner } from '../components/investigations/ScreenLeakIncidentBanner';
import { useActiveInvestigations } from '../hooks/useActiveInvestigations';
import { useScreenLeakDetection, getStoredLeakEvents } from '../hooks/useScreenLeakDetection';
import { ArrowRight, Search, Clock, UserCheck, X, Camera } from 'lucide-react';

export const InvestigationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: cases } = useActiveInvestigations();
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // ── Screen Leak Detection ──
  const { leakEvents, fireLeakEvent } = useScreenLeakDetection({
    documentId: 'NAV-DOC-2026-0061',
    documentName: 'Carrier_Air_Wing_Sortie_Schedule.pptx',
    recipientName: 'Lt. Priya Singh',
    recipientRank: 'Lieutenant',
    recipientUnit: 'INS Visakhapatnam (D66)',
    deviceId: 'HW-HSM-9402',
    sessionId: 'SES-882193',
    enabled: true,
  });

  // Merge stored events + live events into one list
  const allLeakEvents = useMemo(() => {
    const stored = getStoredLeakEvents();
    // Deduplicate by id
    const seen = new Set(stored.map((e) => e.id));
    const live = leakEvents.filter((e) => !seen.has(e.id));
    return [...stored, ...live];
  }, [leakEvents]);

  const handleForensicCaseOpen = useCallback(
    (_investigationId: string) => {
      // Scroll to the forensic workbench
      document.getElementById('forensic-workbench')?.scrollIntoView({ behavior: 'smooth' });
    },
    []
  );

  const filteredCases = useMemo(() => {
    return (cases || []).filter((c) => {
      const matchesSearch =
        c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.artifact.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.assignedOfficer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'ALL' || c.status.toLowerCase().includes(filterStatus.toLowerCase());
      return matchesSearch && matchesFilter;
    });
  }, [cases, searchTerm, filterStatus]);

  return (
    <div className="space-y-4">
      {/* ── Screen Leak Incident Banner (shown above everything when leaks are detected) ── */}
      {allLeakEvents.length > 0 && (
        <ScreenLeakIncidentBanner
          leakEvents={allLeakEvents}
          onOpenForensicCase={handleForensicCaseOpen}
          onDismiss={() => {}}
        />
      )}

      {/* Demo trigger button (for testing — simulates a screenshot event) */}
      <div className="flex justify-end">
        <button
          type="button"
          id="simulate-screenshot-btn"
          onClick={() => fireLeakEvent('SCREENSHOT')}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
          title="Simulate a screenshot attempt (for demo / testing)"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Simulate Screenshot Leak (Demo)</span>
        </button>
      </div>

      {/* Active Forensic Workbench */}
      <div id="forensic-workbench">
        <ForensicWorkbench
          caseId="INV-2026-0042"
          isNewCase={false}
          initialOutcome="verified"
          initialSelectedFileId="F-001"
        />
      </div>

      {/* Previous Investigations Drawer / Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Forensic Investigation Archives
                </h3>
                <p className="text-xs text-slate-500">
                  Select an active or historical leak case to load into the forensic workbench
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowArchiveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by case ID, artifact name, officer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
                />
              </div>

              <div className="flex items-center gap-1.5">
                {['ALL', 'In Progress', 'Completed', 'Flagged'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      filterStatus === status
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto pr-1 py-1">
              {filteredCases.map((c) => (
                <div
                  key={c.caseId}
                  onClick={() => {
                    setShowArchiveModal(false);
                    navigate(`/investigations/${c.caseId}`);
                  }}
                  className="bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 p-4 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {c.caseId}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        c.status.toLowerCase().includes('progress')
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status.toLowerCase().includes('flagged')
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug truncate">
                      {c.artifact}
                    </h4>

                    <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>Officer: <strong className="text-slate-700">{c.assignedOfficer}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Activity: 28 Sep 2026</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-600 text-[11px] font-semibold">{c.progress}% verified</span>
                    <div className="flex items-center gap-1 font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform text-[11px]">
                      <span>Open Case</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestigationsPage;
