import React, { useState, useEffect } from 'react';
import {
  Camera,
  Video,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  X,
  Trash2,
  Cpu,
  FileWarning,
  ShieldX,
  User,
  Clock,
  Monitor,
  Fingerprint,
  ExternalLink,
  PlayCircle,
} from 'lucide-react';
import type { ScreenLeakEvent } from '../../hooks/useScreenLeakDetection';
import { clearStoredLeakEvents } from '../../hooks/useScreenLeakDetection';

interface ScreenLeakIncidentBannerProps {
  leakEvents: ScreenLeakEvent[];
  onOpenForensicCase?: (investigationId: string, event: ScreenLeakEvent) => void;
  onDismiss?: () => void;
}

const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  SCREENSHOT: {
    label: 'Screenshot Captured',
    icon: <Camera className="w-3.5 h-3.5" />,
    color: 'text-rose-600',
  },
  SCREEN_RECORDING: {
    label: 'Screen Recording Initiated',
    icon: <Video className="w-3.5 h-3.5" />,
    color: 'text-rose-700',
  },
  PRINT_SCREEN: {
    label: 'PrintScreen Key Intercepted',
    icon: <Monitor className="w-3.5 h-3.5" />,
    color: 'text-orange-600',
  },
  WINDOW_CAPTURE: {
    label: 'Window Capture Detected',
    icon: <Monitor className="w-3.5 h-3.5" />,
    color: 'text-orange-600',
  },
};

export const ScreenLeakIncidentBanner: React.FC<ScreenLeakIncidentBannerProps> = ({
  leakEvents,
  onOpenForensicCase,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [forensicRunning, setForensicRunning] = useState<string | null>(null);
  const [forensicComplete, setForensicComplete] = useState<Set<string>>(new Set());
  const [pulse, setPulse] = useState(true);

  // Pulse animation controller
  useEffect(() => {
    const timer = setInterval(() => setPulse((p) => !p), 900);
    return () => clearInterval(timer);
  }, []);

  if (leakEvents.length === 0) return null;

  const latestEvent = leakEvents[0];
  const methodMeta = METHOD_LABELS[latestEvent.method] || METHOD_LABELS['SCREENSHOT'];

  const handleRunForensic = (event: ScreenLeakEvent) => {
    if (forensicRunning === event.id || forensicComplete.has(event.id)) return;
    setForensicRunning(event.id);

    // Simulate auto-forensic emulator run
    setTimeout(() => {
      setForensicRunning(null);
      setForensicComplete((prev) => new Set([...prev, event.id]));
      if (onOpenForensicCase) {
        onOpenForensicCase(event.investigationId, event);
      }
    }, 3500);
  };

  const handleClearAll = () => {
    clearStoredLeakEvents();
    if (onDismiss) onDismiss();
  };

  return (
    <div className="rounded-xl overflow-hidden border-2 border-rose-500 shadow-2xl animate-fadeIn">
      {/* ── Critical Header ── */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-700 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Pulsing Danger Icon */}
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-white/30 transition-all ${
              pulse ? 'bg-white/20 scale-110' : 'bg-white/10 scale-100'
            }`}
          >
            <AlertOctagon className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-black text-sm uppercase tracking-widest font-mono">
                ⚠ DOCUMENT LEAK DETECTED — SCREEN CAPTURE VIOLATION
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-opacity ${
                  pulse ? 'bg-white text-rose-700' : 'bg-rose-900 text-white'
                }`}
              >
                CRITICAL
              </span>
            </div>
            <p className="text-rose-100 text-[11px] mt-0.5 font-mono">
              {leakEvents.length} screen capture violation{leakEvents.length !== 1 ? 's' : ''}{' '}
              detected. Forensic investigation auto-initiated. Rules &amp; regulations breached.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-900/50 text-white cursor-pointer"
            title="Clear all incidents"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Expanded Panel ── */}
      {expanded && (
        <div className="bg-white">
          {/* Violation Summary Card */}
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-4 flex flex-wrap items-start gap-5">
            {/* User Info */}
            <div className="flex items-start gap-2.5 min-w-[200px]">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider font-mono">
                  Violating User
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {latestEvent.recipientRank} {latestEvent.recipientName}
                </div>
                <div className="text-xs text-slate-600 font-mono">{latestEvent.recipientUnit}</div>
              </div>
            </div>

            {/* Document Info */}
            <div className="flex items-start gap-2.5 min-w-[240px]">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0">
                <FileWarning className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider font-mono">
                  Leaked Document
                </div>
                <div className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                  {latestEvent.documentName}
                </div>
                <div className="text-xs text-slate-500 font-mono">{latestEvent.documentId}</div>
              </div>
            </div>

            {/* Capture Method */}
            <div className="flex items-start gap-2.5 min-w-[180px]">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0 text-rose-600">
                {methodMeta.icon}
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider font-mono">
                  Capture Method
                </div>
                <div className={`text-sm font-bold ${methodMeta.color}`}>{methodMeta.label}</div>
                <div className="text-[11px] text-slate-500 font-mono">Session: {latestEvent.sessionId}</div>
              </div>
            </div>

            {/* Violation Type */}
            <div className="flex items-start gap-2.5 min-w-[160px]">
              <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center flex-shrink-0">
                <ShieldX className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-rose-500 uppercase tracking-wider font-mono">
                  Violation Type
                </div>
                <div className="text-sm font-bold text-rose-700">SCREEN LEAK — Policy Breach</div>
                <div className="text-[11px] text-slate-500 font-mono">Device: {latestEvent.deviceId}</div>
              </div>
            </div>
          </div>

          {/* Rule Violation Notice */}
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-3">
            <ShieldX className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>SECURITY REGULATION BREACH:</strong> This user has violated Naval Cyber Security Policy
              §8.4 (Screen Capture Prohibition) and §12.1 (Unauthorized Document Reproduction). A mandatory
              forensic investigation has been auto-initiated under{' '}
              <span className="font-mono font-bold">{latestEvent.investigationId}</span>. All evidence
              is being cryptographically preserved on the sovereign ledger.
            </p>
          </div>

          {/* All Incidents Table */}
          <div className="px-5 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-slate-900">
                  Screen Leak Incidents Log
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                  {leakEvents.length} total
                </span>
              </div>
              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Log</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                    <th className="py-2 px-3">Timestamp</th>
                    <th className="py-2 px-3">Method</th>
                    <th className="py-2 px-3">User</th>
                    <th className="py-2 px-3">Document</th>
                    <th className="py-2 px-3">Case ID</th>
                    <th className="py-2 px-3">Forensic Emulator</th>
                    <th className="py-2 px-3 text-right">Investigate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leakEvents.map((evt) => {
                    const meta = METHOD_LABELS[evt.method] || METHOD_LABELS['SCREENSHOT'];
                    const isRunning = forensicRunning === evt.id;
                    const isDone = forensicComplete.has(evt.id);
                    return (
                      <tr key={evt.id} className="hover:bg-rose-50/40 transition-colors">
                        {/* Timestamp */}
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{evt.timestamp}</span>
                          </div>
                        </td>

                        {/* Method */}
                        <td className="py-2.5 px-3">
                          <span
                            className={`flex items-center gap-1.5 font-semibold text-[11px] ${meta.color}`}
                          >
                            {meta.icon}
                            {meta.label}
                          </span>
                        </td>

                        {/* User */}
                        <td className="py-2.5 px-3">
                          <div className="text-xs font-bold text-slate-900">
                            {evt.recipientRank} {evt.recipientName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {evt.recipientUnit}
                          </div>
                        </td>

                        {/* Document */}
                        <td className="py-2.5 px-3">
                          <div className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                            {evt.documentName}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {evt.documentId}
                          </div>
                        </td>

                        {/* Case ID */}
                        <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-blue-700">
                          {evt.investigationId}
                        </td>

                        {/* Forensic Emulator */}
                        <td className="py-2.5 px-3">
                          {isDone ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                              <Cpu className="w-3 h-3" />
                              Analysis Complete
                            </span>
                          ) : isRunning ? (
                            <span className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                              <Cpu className="w-3 h-3 animate-spin" />
                              Running…
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleRunForensic(evt)}
                              className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200 cursor-pointer transition-colors"
                            >
                              <PlayCircle className="w-3 h-3" />
                              Run Forensic
                            </button>
                          )}
                        </td>

                        {/* Investigate */}
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (!isDone) handleRunForensic(evt);
                              if (onOpenForensicCase) {
                                setTimeout(
                                  () => onOpenForensicCase(evt.investigationId, evt),
                                  isDone ? 0 : 3500
                                );
                              }
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold cursor-pointer ml-auto"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open Case</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenLeakIncidentBanner;
