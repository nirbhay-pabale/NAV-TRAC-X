import React, { useState } from 'react';
import { FileUp, X, CheckCircle2, Lock } from 'lucide-react';

interface DistributeDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DistributeDocumentModal: React.FC<DistributeDocumentModalProps> = ({
  isOpen,
  onClose
}) => {
  const [docTitle, setDocTitle] = useState('');
  const [docId, setDocId] = useState('NAV-OPS-045');
  const [selectedRecipient, setSelectedRecipient] = useState('INS VIKRANT (R11)');
  const [securityClearance, setSecurityClearance] = useState('SECRET');
  const [watermarkingActive, setWatermarkingActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#08162b] border border-sky-500/40 shadow-2xl p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-700/60 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-[#f2b134]">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-['Montserrat']">
                Distribute Secure Document
              </h3>
              <p className="text-xs text-[#8EABC1]">Cryptographic Watermark & Ledger Commit</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-10 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
            <h4 className="text-base font-bold text-white">Document Cryptographically Sealed</h4>
            <p className="text-xs text-slate-400 mt-1">Provenance block committed to Naval Ledger #18472</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Identifier</label>
              <input
                type="text"
                value={docId}
                onChange={(e) => setDocId(e.target.value)}
                className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Document Title / Subject</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Naval Exercise Sea Shield Operations"
                className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-sky-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Recipient Unit</label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                >
                  <option>INS VIKRANT (R11)</option>
                  <option>INS CHENNAI (D65)</option>
                  <option>WESTERN NAVAL COMMAND</option>
                  <option>EASTERN FLEET HQ</option>
                  <option>FOST (KOCHI)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Clearance Classification</label>
                <select
                  value={securityClearance}
                  onChange={(e) => setSecurityClearance(e.target.value)}
                  className="w-full bg-[#040b15] border border-sky-500/30 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none"
                >
                  <option>CONFIDENTIAL</option>
                  <option>SECRET</option>
                  <option>TOP SECRET</option>
                  <option>RESTRICTED</option>
                </select>
              </div>
            </div>

            {/* Steganographic Watermark Check */}
            <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#38bdf8]" />
                <span className="text-slate-300">Apply Recipient-Specific Stego Watermark</span>
              </div>
              <input
                type="checkbox"
                checked={watermarkingActive}
                onChange={(e) => setWatermarkingActive(e.target.checked)}
                className="w-4 h-4 accent-sky-400"
              />
            </div>

            {/* Submit button */}
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary-glow px-5 py-2 rounded-xl text-white font-bold"
              >
                {isSubmitting ? 'Encrypting & Committing…' : 'Seal & Distribute'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
