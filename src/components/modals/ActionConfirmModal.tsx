import React, { useState } from 'react';
import { X, ShieldAlert, Ban, RefreshCw, Download, CheckCircle2 } from 'lucide-react';
import type { RecipientRecord } from '../../types/recipient';

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionType: 'suspend' | 'revoke' | 'export' | 'rotateKey' | null;
  recipient: RecipientRecord | null;
  onConfirm: () => void;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  actionType,
  recipient,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !recipient || !actionType) return null;

  const handleExecute = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsProcessing(false);
    setIsDone(true);
    setTimeout(() => {
      setIsDone(false);
      onConfirm();
      onClose();
    }, 1000);
  };

  const getActionDetails = () => {
    switch (actionType) {
      case 'suspend':
        return {
          title: 'Suspend Recipient Access',
          icon: ShieldAlert,
          iconColor: 'text-amber-600',
          btnColor: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs',
          desc: `Are you sure you want to temporarily suspend document access and decryption privileges for ${recipient.name} (${recipient.pno})? Active sessions will be quarantined.`,
          confirmText: 'Suspend Access',
          successText: 'Access Suspended Successfully'
        };
      case 'revoke':
        return {
          title: 'Revoke Recipient PKI/PQC Certificates',
          icon: Ban,
          iconColor: 'text-red-600',
          btnColor: 'bg-red-600 hover:bg-red-700 text-white shadow-xs',
          desc: `CRITICAL ACTION: This will permanently revoke the cryptographic credentials, ML-DSA-65 signatures, and HSM certificates for ${recipient.name} (${recipient.pno}). This event will be recorded on the naval blockchain ledger.`,
          confirmText: 'Permanently Revoke',
          successText: 'Recipient Credentials Revoked'
        };
      case 'rotateKey':
        return {
          title: 'Rotate PQC Cryptographic Keypair',
          icon: RefreshCw,
          iconColor: 'text-blue-600',
          btnColor: 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs',
          desc: `Issue new NIST FIPS 203 (ML-KEM-768) and FIPS 204 (ML-DSA-65) key material for ${recipient.name} (${recipient.pno}). Previous keypairs will be safely retired.`,
          confirmText: 'Generate & Deploy Keys',
          successText: 'PQC Keys Rotated Successfully'
        };
      case 'export':
        return {
          title: 'Export Recipient Ledger History',
          icon: Download,
          iconColor: 'text-emerald-600',
          btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs',
          desc: `Export verifiable cryptographic provenance audit log for ${recipient.name} (${recipient.pno}) including all decryption IDs, zero-knowledge proofs, and timestamps.`,
          confirmText: 'Download Signed Log',
          successText: 'Provenance Log Exported'
        };
    }
  };

  const details = getActionDetails();
  const IconComponent = details.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconComponent className={`w-5 h-5 ${details.iconColor}`} />
            <h3 className="text-sm font-bold text-[#0F172A]">
              {details.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-xs text-slate-700 space-y-4">
          {isDone ? (
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-bounce" />
              <p className="text-sm font-bold text-[#0F172A]">{details.successText}</p>
              <p className="text-[11px] text-slate-500 font-mono">Blockchain block receipt generated.</p>
            </div>
          ) : (
            <>
              <p className="leading-relaxed">
                {details.desc}
              </p>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Recipient:</span>
                  <span className="text-[#0F172A] font-bold">{recipient.name}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Service PNo:</span>
                  <span className="text-blue-600 font-semibold">{recipient.pno}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Current Status:</span>
                  <span className="text-emerald-700 font-bold">{recipient.status}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!isDone && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecute}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer ${details.btnColor}`}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{details.confirmText}</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
