import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, StopCircle, RefreshCw } from 'lucide-react';
import type { PipelineStageUI } from '../../hooks/useAnalyzeArtifact';

interface AnalysisStepTrackerProps {
  stages: PipelineStageUI[];
  isAnalyzing: boolean;
  statusText: string;
  hasCompleted: boolean;
  onRunAnalysis: () => void;
  onCancelAnalysis?: () => void;
  disabled?: boolean;
}

const AnalysisStepTrackerComponent: React.FC<AnalysisStepTrackerProps> = ({
  stages,
  isAnalyzing,
  statusText,
  hasCompleted,
  onRunAnalysis,
  onCancelAnalysis,
  disabled = false,
}) => {
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStageId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm space-y-3.5">
      {/* Run / Cancel Action Button Bar */}
      <div className="flex items-center gap-2">
        {isAnalyzing ? (
          <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-10 px-4 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-wait">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span className="tracking-wide">{statusText}</span>
            </div>
            {onCancelAnalysis && (
              <button
                type="button"
                onClick={onCancelAnalysis}
                className="h-10 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                title="Cancel ongoing forensic analysis"
                aria-label="Cancel analysis"
              >
                <StopCircle className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onRunAnalysis}
            disabled={disabled}
            className={`w-full h-10 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              disabled
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : hasCompleted
                ? 'bg-slate-800 hover:bg-slate-900 text-white cursor-pointer active:scale-[0.99]'
                : 'bg-[#0F5257] hover:bg-[#0b3e42] text-white cursor-pointer active:scale-[0.99]'
            }`}
            aria-label={hasCompleted ? 'Re-run Forensic Analysis' : 'Run Forensic Analysis'}
          >
            {hasCompleted ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="tracking-wide uppercase">Re-run Forensic Analysis</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current stroke-[2.5]" />
                <span className="tracking-wide uppercase">Run Forensic Analysis</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 7-Step Pipeline Header with Live Engine Telemetry */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5">
        <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          7-Stage Verification Pipeline
        </h4>
        <span
          className="text-[10px] font-mono font-medium text-slate-600"
          aria-live="polite"
        >
          {statusText}
        </span>
      </div>

      {/* 7-Step Pipeline Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2 pt-0.5">
        {stages.map((stage, idx) => {
          const isPassed = stage.status === 'passed';
          const isRunning = stage.status === 'running';
          const isFailed = stage.status === 'failed';
          const isSkipped = stage.status === 'skipped';
          const isPending = stage.status === 'pending';
          const isExpanded = expandedStageId === stage.id;
          const hasRawEvidence = stage.raw_evidence && Object.keys(stage.raw_evidence).length > 0;

          return (
            <div
              key={stage.id}
              className={`p-2 rounded-lg border transition-all flex flex-col justify-between min-h-[76px] cursor-pointer ${
                isPassed
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 hover:bg-emerald-50'
                  : isRunning
                  ? 'bg-amber-50/80 border-amber-400 text-amber-950 ring-2 ring-amber-300/50'
                  : isFailed
                  ? 'bg-red-50/80 border-red-300 text-red-950'
                  : isSkipped
                  ? 'bg-slate-100/70 border-slate-200 text-slate-400 opacity-60'
                  : 'bg-slate-50/60 border-slate-200 text-slate-500 opacity-70'
              }`}
              onClick={() => toggleExpand(stage.id)}
              role="button"
              tabIndex={0}
              aria-expanded={isExpanded}
              aria-label={`Stage ${idx + 1}: ${stage.name}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold font-mono ${
                  isPassed ? 'text-emerald-700' : isRunning ? 'text-amber-700' : isFailed ? 'text-red-700' : 'text-slate-400'
                }`}>
                  0{idx + 1}
                </span>

                <div className="flex items-center gap-1">
                  {stage.duration_ms > 0 && (
                    <span className="text-[9px] font-mono text-slate-500">
                      {stage.duration_ms}ms
                    </span>
                  )}
                  {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isRunning && <Loader2 className="w-3.5 h-3.5 text-amber-600 animate-spin" />}
                  {isFailed && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                  {isSkipped && <span className="text-[9px] font-bold text-slate-400 uppercase">Skip</span>}
                  {isPending && <Clock className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </div>

              <div>
                <div className="text-[10.5px] font-bold leading-tight line-clamp-1">
                  {stage.name}
                </div>
                <div className={`text-[9px] mt-0.5 line-clamp-1 font-medium ${
                  isPassed ? 'text-emerald-700' : isRunning ? 'text-amber-700 font-bold' : isFailed ? 'text-red-700 font-bold' : 'text-slate-400'
                }`}>
                  {stage.detail}
                </div>
              </div>

              {hasRawEvidence && (
                <div className="flex items-center justify-end mt-1 text-[8.5px] text-slate-400 hover:text-slate-600">
                  {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded Stage Raw Evidence Modal/Panel */}
      {expandedStageId && (
        <div className="p-3 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono space-y-2 animate-fadeIn border border-slate-800">
          {(() => {
            const stage = stages.find((s) => s.id === expandedStageId);
            if (!stage) return null;
            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-teal-400">Raw Evidence Telemetry:</span>
                    <span>{stage.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedStageId(null)}
                    className="text-slate-400 hover:text-white text-[10px] px-2 py-0.5 rounded bg-slate-800 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Detail: <span className="text-white font-sans">{stage.detail}</span>
                </div>
                {stage.error && (
                  <div className="text-rose-400 text-[11px]">
                    Error: {stage.error}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto bg-slate-950 p-2.5 rounded border border-slate-800">
                  <pre className="text-[10px] text-emerald-400 whitespace-pre-wrap break-all">
                    {JSON.stringify(stage.raw_evidence, null, 2)}
                  </pre>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export const AnalysisStepTracker = React.memo(AnalysisStepTrackerComponent);
export default AnalysisStepTracker;
