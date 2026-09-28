import React, { useState } from 'react';
import {
  X,
  FileText,
  Shield,
  ShieldCheck,
  Copy,
  Check,
  Hash
} from 'lucide-react';

interface ViewerDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fileType?: string;
  fileSize?: string;
  totalPages: number;
  classification?: string;
  version?: string;
  masterDocId?: string;
  sha3Hash?: string;
}

export const ViewerDetailsDrawer: React.FC<ViewerDetailsDrawerProps> = ({
  isOpen,
  onClose,
  fileName,
  fileSize = '2.4 MB',
  totalPages,
  classification = 'SECRET // NOFORN',
  version = 'v1.4 (PQC Signed)',
  masterDocId = 'IN-DOC-2026-ALPHA-0842',
  sha3Hash = '7e9f3b2a4c6d8e1f0b5a9321c8d7e6f543210987654321abcdef0123456789ab',
}) => {
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha3Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col h-full shrink-0 select-none z-10 animate-fadeIn shadow-lg">
      {/* Drawer Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            DOCUMENT DETAILS
          </h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close Details"
          aria-label="Close details drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        
        {/* Classification Banner */}
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5">
          <Shield className="w-4 h-4 text-red-600 shrink-0" />
          <div>
            <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
              SECURITY CLASSIFICATION
            </span>
            <span className="text-xs font-black text-red-800 tracking-wide font-mono">
              {classification}
            </span>
          </div>
        </div>

        {/* General Metadata */}
        <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              File Name
            </span>
            <span className="text-xs font-semibold text-slate-900 font-mono break-all">
              {fileName}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Pages
              </span>
              <span className="text-xs font-bold text-blue-600 font-mono">
                {totalPages} Pages
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                File Size
              </span>
              <span className="text-xs font-bold text-slate-800 font-mono">
                {fileSize}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Master Document ID
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono">
              {masterDocId}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Document Version
            </span>
            <span className="text-xs font-semibold text-slate-800">
              {version}
            </span>
          </div>
        </div>

        {/* Cryptographic Hash Section */}
        <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Hash className="w-3 h-3 text-slate-400" />
              SHA3-256 Fingerprint
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <p className="p-2 rounded-lg bg-white border border-slate-200 font-mono text-[10px] text-slate-700 break-all leading-relaxed">
            {sha3Hash}
          </p>
        </div>

        {/* Cryptographic Protection Lineage */}
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Post-Quantum Provenance Active</span>
          </div>
          <p className="text-[10.5px] text-emerald-700 leading-relaxed">
            Forensic watermark lineage and tamper validation committed to local cryptographic ledger (ML-DSA-65 NIST FIPS 204).
          </p>
        </div>
      </div>
    </div>
  );
};
