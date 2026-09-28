import React, { useState } from 'react';
import {
  GitMerge,
  Radio,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  FileText,
  Download,
  RefreshCw,
  Layers,
  ChevronDown
} from 'lucide-react';
import { useDisconnectedUnits, useReconcileLedger } from '../../hooks/useLedgerData';
import type { DisconnectedUnit, ReconciliationResult } from '../../types/ledger';

export const ReconciliationView: React.FC = () => {
  const { data: units = [], isLoading: loadingUnits } = useDisconnectedUnits();
  const reconcileMutation = useReconcileLedger();

  const [selectedUnitId, setSelectedUnitId] = useState<string>('DISC-01');
  const [reconcileResult, setReconcileResult] = useState<ReconciliationResult | null>(null);

  const currentUnit: DisconnectedUnit | undefined =
    units.find((u) => u.id === selectedUnitId) || units[0];

  const handleReconcile = async () => {
    if (!currentUnit) return;
    try {
      const res = await reconcileMutation.mutateAsync({ unitId: currentUnit.id });
      setReconcileResult(res);
    } catch (err) {
      console.error('Reconciliation error:', err);
    }
  };

  const handleDownloadAuditReport = () => {
    if (!reconcileResult) return;
    const reportData = {
      title: 'NAV-TRAC X - Offline Node EMCON Reconciliation Audit Receipt',
      unit: reconcileResult.unitName,
      unitId: reconcileResult.unitId,
      timestamp: reconcileResult.reconciledAt,
      eventsAppended: reconcileResult.eventsMergedCount,
      reconciliationStatus: 'COMPLETED_CRYPTO_VERIFIED',
      events: reconcileResult.events,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RECONCILIATION_AUDIT_${reconcileResult.unitId}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Simulated offline events in local EMCON log
  const offlineEvents = [
    {
      id: 'OFF-EVT-901',
      doc: 'Mission_Plan_Bravo.pdf',
      docId: 'NAV-DOC-2026-0042',
      recipient: `${currentUnit?.name || 'Unit'} Terminal Ops`,
      time: '27 Sep 2026 06:14Z',
      action: 'Decryption Event (Offline Diode)',
      status: 'Signed (ML-DSA-65 Offline Key)',
    },
    {
      id: 'OFF-EVT-902',
      doc: 'Tactical_Satcom_Frequency_Allocation.docx',
      docId: 'NAV-DOC-2026-0029',
      recipient: `${currentUnit?.name || 'Unit'} Tactical EW`,
      time: '27 Sep 2026 07:22Z',
      action: 'Decryption Event (Air-Gap Cache)',
      status: 'Signed (ML-DSA-65 Offline Key)',
    },
    {
      id: 'OFF-EVT-903',
      doc: 'Submarine_Acoustic_Signature_Profile.pdf',
      docId: 'NAV-DOC-2026-0055',
      recipient: `${currentUnit?.name || 'Unit'} Sonar Station`,
      time: '27 Sep 2026 08:45Z',
      action: 'Decryption Event (Offline HSM)',
      status: 'Signed (ML-DSA-65 Offline Key)',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Unit Selector & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Disconnected Unit:
            </span>
          </div>

          <div className="relative w-full sm:w-72">
            <select
              value={selectedUnitId}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                setReconcileResult(null);
              }}
              disabled={loadingUnits}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 font-mono"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id} className="bg-white text-slate-900">
                  {u.name} ({u.pendingEventCount} pending)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {currentUnit && (
            <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Offline: {currentUnit.offlineSince}</span>
            </div>
          )}

          <button
            onClick={handleReconcile}
            disabled={reconcileMutation.isPending || !currentUnit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {reconcileMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Reconciling & Merging...</span>
              </>
            ) : (
              <>
                <GitMerge className="w-4 h-4" />
                <span>Reconcile Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unit Status Banner */}
      {currentUnit && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Call Sign</span>
            <p className="text-sm font-bold text-blue-700 font-mono mt-0.5">{currentUnit.callsign}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EMCON State</span>
            <p className="text-sm font-bold text-amber-700 font-mono mt-0.5">{currentUnit.emconState}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Sector</span>
            <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">{currentUnit.sector}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unmerged Offline Events</span>
            <p className="text-sm font-bold text-amber-800 font-mono mt-0.5">
              {currentUnit.pendingEventCount} Local Events Queued
            </p>
          </div>
        </div>
      )}

      {/* Post-Reconciliation Diff Banner */}
      {reconcileResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 animate-fadeIn shadow-xs">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <span>Reconciliation Complete & Sealed</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono">
                    Block #4,193 Appended
                  </span>
                </h4>
                <p className="text-xs text-emerald-700">
                  Merged {reconcileResult.eventsMergedCount} offline events from {reconcileResult.unitName} into HQ Main Ledger DAG.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadAuditReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-mono font-bold transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Reconciliation Audit Receipt</span>
            </button>
          </div>

          {/* Diff Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
              <span className="text-xs text-slate-600">New Events Added</span>
              <span className="text-sm font-mono font-bold text-emerald-700">+{reconcileResult.eventsMergedCount} (Clean Diff)</span>
            </div>
            <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
              <span className="text-xs text-slate-600">Historical Records Altered</span>
              <span className="text-sm font-mono font-bold text-slate-700">0 (Integrity Preserved)</span>
            </div>
            <div className="bg-white border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between shadow-xs">
              <span className="text-xs text-slate-600">Merkle Root Hash</span>
              <span className="text-xs font-mono font-bold text-emerald-700 truncate max-w-[140px]">0x99aa001923fa...</span>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Panels: Local EMCON Log vs Main Synchronized Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* LEFT: Local EMCON Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Local EMCON Log ({currentUnit?.callsign || 'Offline Unit'})
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Disconnected Cache
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Cryptographic decryption events registered locally inside the vessel's air-gapped cryptographic enclave during EMCON radio silence.
            </p>

            <div className="space-y-2">
              {offlineEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg p-3 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-800">{evt.id}</span>
                    <span className="text-[10px] text-slate-400">{evt.time}</span>
                  </div>
                  <div className="text-slate-800 font-sans font-medium flex items-center gap-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{evt.doc}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                    <span>{evt.recipient}</span>
                    <span className="text-emerald-700 font-semibold">{evt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Air-gap signatures buffered
            </span>
            <span className="font-mono text-amber-800 font-bold">{currentUnit?.pendingEventCount || 3} events ready for sync</span>
          </div>
        </div>

        {/* RIGHT: Main Synchronized Ledger */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Main Synchronized Ledger (HQ DAG)
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Synced Head #4,192
              </span>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              Centrally validated Merkle DAG blocks synced across connected command nodes with quantum-safe ML-DSA-65 signatures.
            </p>

            {/* Current Sync Head block representation */}
            <div className="space-y-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-blue-700">BLOCK #4,192 (Current Tip)</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">SEALED</span>
                </div>
                <p className="text-[11px] text-slate-700 font-sans mb-1.5">
                  Validating Node: NAVAL-HQ-DELHI (PQC Validator 01)
                </p>
                <div className="p-2 rounded bg-white border border-slate-200 text-[10.5px] text-slate-600 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Root:</span>
                    <span className="text-blue-700 font-bold truncate max-w-[200px]">0x88f21ac0981baacc3321ff8890...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Committed Events:</span>
                    <span className="text-slate-800 font-semibold">4 Events</span>
                  </div>
                </div>
              </div>

              {/* Merge target block preview */}
              <div className="bg-slate-50/50 border border-dashed border-slate-300 rounded-lg p-3 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500">
                  <Layers className="w-4 h-4 text-slate-400" />
                  <span>Next Append Target: BLOCK #4,193</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-blue-600 font-bold">
                  <span>Awaiting Reconcile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-blue-600" />
              Non-destructive fast-forward merge
            </span>
            <span className="font-mono text-blue-700 font-semibold">Byzantine Consensus Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationView;
