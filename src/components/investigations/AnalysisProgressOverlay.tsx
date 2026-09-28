import React from 'react';
import { Loader2, CheckCircle2, Cpu, Database, Key, Layers, Search, ShieldCheck } from 'lucide-react';
import type { AnalysisPipelineStep } from '../../types/forensic';

interface AnalysisProgressOverlayProps {
  isAnalyzing: boolean;
  activeStepIndex: number;
  pipelineSteps: AnalysisPipelineStep[];
}

export const AnalysisProgressOverlay: React.FC<AnalysisProgressOverlayProps> = ({
  isAnalyzing,
  activeStepIndex,
  pipelineSteps,
}) => {
  if (!isAnalyzing) return null;

  const getStepIcon = (idx: number) => {
    switch (idx) {
      case 0:
        return Layers;
      case 1:
        return Cpu;
      case 2:
        return Search;
      case 3:
        return Database;
      case 4:
        return Key;
      case 5:
        return ShieldCheck;
      default:
        return CheckCircle2;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-5">
        {/* Top Header */}
        <div className="flex items-center gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Zero-Trust Forensic Reconstruction Engine
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              NIST FIPS 203/204 &bull; 2D DWT-DCT SVD Decomposition
            </p>
          </div>
        </div>

        {/* 7-Stage Pipeline Workflow */}
        <div className="space-y-2.5">
          {pipelineSteps.map((step, idx) => {
            const Icon = getStepIcon(idx);
            const isDone = idx < activeStepIndex;
            const isCurrent = idx === activeStepIndex;

            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isCurrent
                    ? 'bg-blue-50/80 border-blue-400 shadow-xs scale-[1.01]'
                    : isDone
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isDone
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : isCurrent
                      ? 'bg-blue-100 text-blue-700 border border-blue-300 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold truncate ${
                      isCurrent ? 'text-blue-900' : isDone ? 'text-emerald-900' : 'text-slate-600'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-[10.5px] text-slate-500 font-mono truncate">
                      {step.sublabel}
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Progress Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono text-slate-500">
          <span>Progress: {Math.round(((activeStepIndex + 1) / pipelineSteps.length) * 100)}%</span>
          <span>Step {activeStepIndex + 1} of {pipelineSteps.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgressOverlay;
