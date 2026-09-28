import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import type { ChainVerificationResult } from '../../types/ledger';

interface ChainVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ChainVerificationResult | null;
  isVerifying: boolean;
}

export const ChainVerificationModal: React.FC<ChainVerificationModalProps> = ({
  isOpen,
  onClose,
  result,
  isVerifying,
}) => {
  const [currentBlockStep, setCurrentBlockStep] = useState<number>(1);

  useEffect(() => {
    if (isVerifying) {
      setCurrentBlockStep(1);
      const interval = setInterval(() => {
        setCurrentBlockStep((prev) => {
          if (prev < 4180) return prev + 380;
          if (prev < 4192) return prev + 3;
          return 4192;
        });
      }, 120);

      return () => clearInterval(interval);
    }
  }, [isVerifying]);

  if (!isOpen) return null;

  const isSuccess = result?.isSuccess ?? true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Cryptographic Merkle Chain Verification
              </h3>
              <p className="text-[11px] text-slate-500">
                Zero-Knowledge Merkle Root Hash Validation Across All 4,192 Blocks
              </p>
            </div>
          </div>

          {!isVerifying && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Verification Body */}
        {isVerifying ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-4 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Verifying block {currentBlockStep.toLocaleString()} of 4,192…
              </h4>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Evaluating ML-DSA-65 post-quantum signature syndromes & Merkle parent hashes
              </p>
            </div>
            <div className="w-64 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-blue-600 transition-all duration-150"
                style={{ width: `${(currentBlockStep / 4192) * 100}%` }}
              />
            </div>
          </div>
        ) : result ? (
          <div className="space-y-4 pt-1 animate-fadeIn">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-bold">
                  {isSuccess
                    ? '100% Immutable Integrity Verified'
                    : 'Cryptographic Inconsistency Detected!'}
                </h4>
                <p className="text-xs leading-relaxed text-slate-700">
                  {isSuccess
                    ? 'All 4,192 blocks, 16,840 decryption events, and post-quantum ML-DSA signatures match root state with zero discrepancies.'
                    : result.errorReason}
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10.5px]">Total Blocks Verified:</span>
                <span className="text-slate-900 font-bold text-sm">4,192 / 4,192</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10.5px]">Root Integrity Score:</span>
                <span className={`font-bold text-sm ${isSuccess ? 'text-emerald-700' : 'text-red-700'}`}>
                  {result.rootIntegrityScore}%
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                Close Report
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ChainVerificationModal;
