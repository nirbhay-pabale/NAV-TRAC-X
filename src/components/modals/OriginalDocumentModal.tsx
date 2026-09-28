import React from 'react';
import { X, FileText, CheckCircle2 } from 'lucide-react';


interface OriginalDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: any;
}

export const OriginalDocumentModal: React.FC<OriginalDocumentModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Clean Source Document: {document.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {document.classification}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Version {document.version} &bull; Distributed: {document.distributedOn}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Render Area (Clean pristine state without leak artifacts) */}
        <div className="p-6 bg-slate-100 overflow-y-auto max-h-[60vh] space-y-4">
          <div className="bg-white text-slate-900 rounded-xl p-8 shadow-sm border border-slate-200 font-sans space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <h2 className="text-base font-black tracking-wider uppercase">
                  INDIAN NAVY — INTEGRATED DEFENCE STAFF
                </h2>
                <div className="text-xs font-bold text-slate-700">
                  OPERATIONAL TASK FORCE: WESTERN NAVAL COMMAND (MUMBAI)
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-600">
                <span>CLASSIFICATION: TOP SECRET</span><br />
                <span>CODEWORD: BRAVO-FLEET</span>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-800">
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                1. Mission Directive & Force Composition
              </h3>
              <p>
                Task Force D66 comprising Guided Missile Destroyer INS Visakhapatnam (D66) and stealth frigate elements will establish sea-control sectors in the North Arabian Sea. Strict EMCON protocols remain in force throughout maritime operational phases.
              </p>

              <h3 className="font-bold text-sm text-slate-900 uppercase pt-2">
                2. Tactical Communications & Provenance Keying
              </h3>
              <p>
                All digital operations orders distributed via NAV-TRAC X are cryptographically sealed using NIST FIPS 203/204 post-quantum key encapsulation mechanisms. Decryption event payloads are irreversibly watermarked into rendering memory.
              </p>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-300 pt-3 flex justify-between text-[9px] font-mono text-slate-500">
              <span>UNCLASSIFIED WHEN SEPARATED FROM ANNEXES</span>
              <span>VERIFIED CLEAN SOURCE REPOSITORY</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Integrity: SHA-256 Validated</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition-colors shadow-xs cursor-pointer"
          >
            Close Source Viewer
          </button>
        </div>
      </div>
    </div>
  );
};

export default OriginalDocumentModal;
