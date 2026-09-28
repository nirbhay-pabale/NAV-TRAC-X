import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  Key,
  Lock,
  Send,
  Unlock,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Search,
  Check,
  X,
  Play,
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import { centralStore } from '../../data/centralStore';

interface JudgeForensicDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToInvestigation?: (caseId: string) => void;
}

interface StepInfo {
  stepNumber: number;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  detailData: string;
}

const DEMO_STEPS: StepInfo[] = [
  {
    stepNumber: 1,
    label: 'Document Ingestion & Metadata Sanitization',
    description: 'Ingesting "Mission_Plan_Bravo.pdf" (v2.1) and scrubbing non-operational metadata fields.',
    icon: FileText,
    detailData: 'SHA3-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    stepNumber: 2,
    label: 'Recipient Clearance & Authorization Check',
    description: 'Verifying Level-4 clearance & hardware HSM validation for Cdr. A. Mehta (04821-K).',
    icon: Key,
    detailData: 'Policy: POL-01 (Command Level-4) • Device: HW-HSM-9021 • PQC Key: Valid',
  },
  {
    stepNumber: 3,
    label: 'AES-256-GCM Encryption & ML-KEM-768 Encapsulation',
    description: 'Generating ephemeral 256-bit symmetric session key & encapsulating for recipient public key.',
    icon: Lock,
    detailData: 'Ciphertext: 0xCT_KEM768_88f21ac0981b • Key ID: KEY-AES256-89af42e1',
  },
  {
    stepNumber: 4,
    label: 'Secure Cryptographic Distribution',
    description: 'Broadcasting encrypted payload across Western Fleet Naval Tactical Link.',
    icon: Send,
    detailData: 'Distribution ID: DIST-88219 • Recipients: 1 Authorized • Channel: Link-II',
  },
  {
    stepNumber: 5,
    label: 'Authorized Recipient Decryption',
    description: 'Recipient decapsulates shared secret inside tamper-resistant hardware enclave.',
    icon: Unlock,
    detailData: 'Decryption Event: EVT-88420 • Status: VERIFIED • Session: SESS-9042',
  },
  {
    stepNumber: 6,
    label: 'Dynamic Steganographic Watermark & Fingerprint Injection',
    description: 'Synthesizing 5-layer unique recipient watermark into memory buffer (DCT/DWT + Kerning + Unicode).',
    icon: Layers,
    detailData: 'Fingerprint ID: FP-0042-REC-01 • 5 Layers Active • Coverage: 99.8%',
  },
  {
    stepNumber: 7,
    label: 'Provenance Capsule Generation & PQC Signature',
    description: 'Binding Document, Version, Recipient Pseudonym, Device, Nonce, and ML-DSA-65 signature.',
    icon: ShieldCheck,
    detailData: 'Capsule ID: CAPSULE-2026-0042-REC-01 • Signature: 0xSIG_MLDSA65_VALID',
  },
  {
    stepNumber: 8,
    label: 'Immutable Ledger Block Commit',
    description: 'Appending cryptographic decryption record into tamper-evident block chain.',
    icon: FileSpreadsheet,
    detailData: 'Block Number: #4192 • Previous Hash: 0x32ba1198... • Merkle Root: 0x88f21ac0...',
  },
  {
    stepNumber: 9,
    label: 'Simulated Leak Discovery on External Channel',
    description: 'Air-gap monitoring engine detects suspicious screenshot posted on external forum.',
    icon: AlertTriangle,
    detailData: 'Artifact: leaked_strike_plan_sample.pdf • Source: Dark Web Paste • Candidate: REC-01',
  },
  {
    stepNumber: 10,
    label: 'Multi-Layer Forensic Recovery & OCR',
    description: 'Preprocessing artifact: deskew, contrast normalization, frequency-domain DCT/DWT coefficient extraction.',
    icon: Search,
    detailData: 'Recovered Layers: 5/5 • OCR Match: 100% • Quality Score: 92%',
  },
  {
    stepNumber: 11,
    label: 'Evidence Convergence Engine Execution',
    description: 'Cross-verifying 8 independent evidence pillars against master document and ledger chain.',
    icon: Check,
    detailData: '8/8 Evidence Checks PASS • Fingerprint, SHA3-256, Signature, Ledger All Agree',
  },
  {
    stepNumber: 12,
    label: 'Attribution Verdict: PROVENANCE VERIFIED',
    description: 'Forensic attribution indisputably resolves leak origin to Cdr. A. Mehta (04821-K).',
    icon: CheckCircle2,
    detailData: 'VERDICT: PROVENANCE VERIFIED (99.8% Confidence) • Framing & Collusion Cleared',
  },
];

export const JudgeForensicDemoModal: React.FC<JudgeForensicDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigateToInvestigation,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsRunning(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  // Automated step progression timer
  useEffect(() => {
    let timer: any;
    if (isRunning && currentStep < DEMO_STEPS.length) {
      timer = setTimeout(() => {
        if (currentStep === DEMO_STEPS.length - 1) {
          setIsRunning(false);
          setIsCompleted(true);
        } else {
          setCurrentStep((prev) => prev + 1);
        }
      }, 1100);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStep]);

  if (!isOpen) return null;

  const handleStartDemo = () => {
    setCurrentStep(0);
    setIsRunning(true);
    setIsCompleted(false);
  };

  const handleNextStep = () => {
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setIsCompleted(false);
    }
  };

  const activeStep = DEMO_STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  NAV-TRAC X End-to-End Forensic Pipeline Demo
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                  SIH BENCHMARK
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Full cryptographic lifecycle: Ingestion → Encapsulation → Watermarking → Ledger → Leak Recovery → Attribution
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Visual Stepper */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[750px] gap-1">
            {DEMO_STEPS.map((step, idx) => {
              const isPassed = idx < currentStep || isCompleted;
              const isCurrent = idx === currentStep && !isCompleted;
              return (
                <button
                  key={step.stepNumber}
                  type="button"
                  onClick={() => {
                    setCurrentStep(idx);
                    setIsRunning(false);
                  }}
                  className={`flex flex-col items-center group relative flex-1 text-center transition-all cursor-pointer ${
                    isCurrent ? 'scale-105' : ''
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      isPassed
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    {step.stepNumber}
                  </div>
                  <span
                    className={`text-[9px] font-mono mt-1 line-clamp-1 max-w-[55px] ${
                      isCurrent ? 'text-blue-600 font-bold' : isPassed ? 'text-emerald-700 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Step {step.stepNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Step Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          <div className="flex items-start gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-11 h-11 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <activeStep.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider">
                  PHASE {activeStep.stepNumber} OF 12
                </span>
                <span className="text-xs font-mono text-slate-500 font-semibold">
                  {Math.round(((currentStep + 1) / DEMO_STEPS.length) * 100)}% COMPLETE
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {activeStep.label}
              </h3>
              <p className="text-xs text-slate-600 font-sans leading-relaxed">
                {activeStep.description}
              </p>
            </div>
          </div>

          {/* Cryptographic Proof Output Console */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2 border border-slate-800 shadow-inner">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10.5px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                EXECUTION LOG / PROVENANCE TELEMETRY
              </span>
              <span>ENVIRONMENT: LOCAL AIR-GAP PROTOTYPE</span>
            </div>
            <p className="text-slate-200 bg-black/40 p-2.5 rounded-lg border border-slate-800 text-[11.5px] leading-relaxed">
              &gt; {activeStep.detailData}
            </p>
          </div>

          {/* Complete Provenance Chain Graph */}
          {isCompleted && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>PROVENANCE VERIFIED: COMPLETE ATTRIBUTION CHAIN CONFIRMED</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                  CONFIDENCE: 99.8%
                </span>
              </div>

              {/* End to End Pipeline Graph Flow */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 text-[10px] font-mono text-center">
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">DOCUMENT</div>
                  <div className="text-slate-900 font-bold truncate">Mission_Plan.pdf</div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">VERSION</div>
                  <div className="text-blue-700 font-bold">v2.1 (Strike)</div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">RECIPIENT</div>
                  <div className="text-amber-800 font-bold">Cdr. Mehta</div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">CAPSULE</div>
                  <div className="text-emerald-700 font-bold">CAPSULE-0042</div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">LEDGER</div>
                  <div className="text-purple-700 font-bold">Block #4192</div>
                </div>
                <div className="p-2 rounded bg-white border border-slate-200 shadow-xs">
                  <div className="text-slate-500">LEAK VERDICT</div>
                  <div className="text-emerald-700 font-bold">ATTRIBUTED</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartDemo}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-[#2563EB] hover:bg-blue-700 text-white'
              }`}
            >
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                  <span>Auto Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>{isCompleted ? 'Re-Run Auto Demo' : 'Run Auto Demo'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                centralStore.resetDemoEnvironment();
                setCurrentStep(0);
                setIsRunning(false);
                setIsCompleted(false);
              }}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset State</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={currentStep === 0 || isRunning}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              Previous
            </button>

            {isCompleted ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToInvestigation) {
                    onNavigateToInvestigation('NAVX-0042');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Open Forensic Workbench (NAVX-0042)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={isRunning}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeForensicDemoModal;
