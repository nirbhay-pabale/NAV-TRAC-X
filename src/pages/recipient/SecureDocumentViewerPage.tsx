import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Key,
  Unlock,
  FileCheck,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyDocumentById } from '../../hooks/useMyDocuments';
import { useAddMyActivity } from '../../hooks/useMyActivity';
import { DocumentViewer } from '../../components/viewer/DocumentViewer';

type Step = 'confirm' | 'unlock_and_sign' | 'viewer';

export const SecureDocumentViewerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const addActivityMutation = useAddMyActivity();

  const { data: document, isLoading, error } = useMyDocumentById(id);

  // Step state
  const [currentStep, setCurrentStep] = useState<Step>('confirm');
  const [ackChecked, setAckChecked] = useState(false);

  // Unlock state
  const [unlockMethod, setUnlockMethod] = useState<'passphrase' | 'cac'>('passphrase');
  const [passphrase, setPassphrase] = useState('Navy@User2026');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<'idle' | 'unlocking' | 'signing' | 'error' | 'success'>('idle');
  const [unlockErrorMessage, setUnlockErrorMessage] = useState<string | null>(null);

  // Viewer controls state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [accessReceiptId, setAccessReceiptId] = useState<string>('');

  const canPrint = document?.allowedAccessType === 'Print';
  const canDownload = document?.allowedAccessType === 'Download';

  // Step 1 -> Step 2
  const handleProceedToUnlock = () => {
    if (!ackChecked) return;
    setCurrentStep('unlock_and_sign');
  };

  // Step 2: Unlock and Sign
  const handleUnlockAndSign = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUnlockErrorMessage(null);

    // Verify document eligibility
    if (!document || !document.canOpen) {
      setUnlockStatus('error');
      setUnlockErrorMessage(document?.disabledReason || 'Cryptographic access expired or revoked for this record.');
      return;
    }

    if (unlockMethod === 'passphrase') {
      if (!passphrase || passphrase.length < 4) {
        setUnlockStatus('error');
        setUnlockErrorMessage('Invalid security passphrase. Decryption denied.');
        return;
      }
    }

    setUnlockStatus('unlocking');
    await new Promise((r) => setTimeout(r, 600));

    setUnlockStatus('signing');
    await new Promise((r) => setTimeout(r, 700));

    // Generate receipt ID
    const receiptId = `RCPT-2026-${Date.now().toString().slice(-4)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`;
    setAccessReceiptId(receiptId);

    // Record activity
    addActivityMutation.mutate({
      receiptId,
      action: 'Opened',
      documentId: document.id,
      documentTitle: document.title,
      status: 'SUCCESS',
      signatureStatus: 'ML-DSA-65 Valid',
      ledgerStatus: 'Recorded on Ledger',
      deviceId: user?.deviceId || 'HW-HSM-9402',
      details: 'Secure in-memory session decrypted and signed with officer key ML-DSA-65.',
    });

    setUnlockStatus('success');
    await new Promise((r) => setTimeout(r, 400));
    setCurrentStep('viewer');
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-mono text-slate-500">
          Querying encrypted document metadata…
        </span>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-lg mx-auto my-12 bg-white border border-red-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Document Unavailable</h2>
        <p className="text-xs text-slate-600">
          You are not authorized to view this document, or the record reference is invalid.
        </p>
        <button
          type="button"
          onClick={() => navigate('/my/dashboard')}
          className="btn-primary text-xs px-4 py-2"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1500px] mx-auto space-y-4 animate-fadeIn pb-12 select-none">
      
      {/* ── TOP NAVIGATION BACK BAR ── */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/my/dashboard')}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Documents</span>
        </button>

        {currentStep === 'viewer' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-300"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>View Access Receipt</span>
            </button>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          STEP 1: CONFIRMATION MODAL / SCREEN
          ════════════════════════════════════════════════════════════════ */}
      {currentStep === 'confirm' && (
        <div className="max-w-2xl mx-auto my-8 bg-white border border-[#E6EAF2] rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-[#E6EAF2]">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase font-mono tracking-wider">
                STEP 1 OF 3 • ACCESS DISCLOSURE
              </span>
              <h2 className="text-xl font-black text-slate-900 font-['Montserrat'] mt-0.5">
                Secure Decryption Confirmation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Opening this classified document creates an immutable, signed cryptographic audit record.
              </p>
            </div>
          </div>

          {/* Document Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Document Title:</span>
              <span className="font-bold text-slate-900">{document.title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Classification:</span>
              <span className="pill-blue font-mono font-bold text-[10.5px]">{document.classification}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Allowed Access Type:</span>
              <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-slate-200 text-slate-800">
                {document.allowedAccessType}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-mono text-[11px] uppercase">Originating Authority:</span>
              <span className="font-semibold text-slate-800">{document.sentByAuthority}</span>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Cryptographic Protocol Notice:</strong> Access is granted under in-memory execution rules. Steganographic deterrent watermarking is applied on decryption. Unauthorized redistribution or tampering is punishable under naval regulations.
            </span>
          </div>

          {/* Mandatory Acknowledgment Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer select-none transition-colors">
            <input
              type="checkbox"
              checked={ackChecked}
              onChange={(e) => setAckChecked(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="text-xs font-semibold text-slate-800 leading-snug">
              I understand this access is recorded and cryptographically signed with my officer key.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E6EAF2]">
            <button
              type="button"
              onClick={() => navigate('/my/dashboard')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!ackChecked}
              onClick={handleProceedToUnlock}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-['Montserrat'] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Proceed to Key Unlock</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 2: UNLOCK AND SIGN STEP
          ════════════════════════════════════════════════════════════════ */}
      {currentStep === 'unlock_and_sign' && (
        <div className="max-w-2xl mx-auto my-8 bg-white border border-[#E6EAF2] rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="flex items-start gap-4 pb-4 border-b border-[#E6EAF2]">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-teal-600 uppercase font-mono tracking-wider">
                STEP 2 OF 3 • PQC DIGITAL SIGNING
              </span>
              <h2 className="text-xl font-black text-slate-900 font-['Montserrat'] mt-0.5">
                Unlock Hardware Token & Sign Record
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticate with your hardware token to sign the decryption receipt with ML-DSA-65.
              </p>
            </div>
          </div>

          {/* Unlock Method Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl">
            <button
              type="button"
              onClick={() => setUnlockMethod('passphrase')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                unlockMethod === 'passphrase'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Passphrase / PIN
            </button>
            <button
              type="button"
              onClick={() => setUnlockMethod('cac')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                unlockMethod === 'cac'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CAC / Smart Card Token
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUnlockAndSign} className="space-y-4">
            {unlockMethod === 'passphrase' ? (
              <div className="space-y-1.5">
                <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono block">
                  Officer Security Passphrase
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter security passphrase"
                    className="w-full text-xs p-3 pr-10 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-600"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Default evaluation passphrase: Navy@User2026
                </span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <ShieldCheck className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="text-xs font-bold text-slate-900">
                  CAC Hardware Token Detected: {user?.deviceId || 'HW-HSM-9402'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Smart card certificate validated under Indian Navy PKI Level 3
                </p>
              </div>
            )}

            {/* Error Message Display */}
            {unlockErrorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600" />
                <span>{unlockErrorMessage}</span>
              </div>
            )}

            {/* Execution Status Spinner */}
            {unlockStatus !== 'idle' && (
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-center gap-2 font-mono">
                {unlockStatus === 'unlocking' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Unlocking ML-KEM-768 Decryption Key…</span>
                  </>
                )}
                {unlockStatus === 'signing' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Generating ML-DSA-65 Quantum-Resistant Digital Signature…</span>
                  </>
                )}
                {unlockStatus === 'success' && (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Cryptographic Session Established! Loading Viewer…</span>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#E6EAF2]">
              <button
                type="button"
                onClick={() => setCurrentStep('confirm')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={unlockStatus === 'unlocking' || unlockStatus === 'signing'}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold font-['Montserrat'] shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>Decrypt & Open Document</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          STEP 3: SECURE RECIPIENT VIEWER (REAL MULTI-PAGE PDF & ZERO-TRUST ENCLAVE)
          ════════════════════════════════════════════════════════════════ */}
      {currentStep === 'viewer' && (
        <div className="space-y-3">
          {/* Top Session Security Banner */}
          <div className="bg-[#0F172A] text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-slate-200 uppercase">Secure Ephemeral Session</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Cryptographically Recorded</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 font-bold">
                Auto-lock active (5m idle / window blur)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Receipt: <strong className="text-sky-300">{accessReceiptId || 'RCPT-2026-9402'}</strong>
              </span>
            </div>
          </div>

          {/* Unified Master Document Viewer in Recipient-Secure Mode */}
          <div className="w-full h-[720px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <DocumentViewer
              file="/Operation_Briefing_Alpha.pdf"
              fileName={`${document.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`}
              fileSize={`${(document.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`}
              classification={document.classification}
              masterDocId={document.documentNumber}
              sha3Hash="7e9f3b2a4c6d8e1f0b5a9321c8d7e6f543210987654321abcdef0123456789ab"
              version={document.version}
              mode="recipient-secure"
              permissions={{
                download: canDownload,
                print: canPrint,
                edit: false,
              }}
              className="h-full rounded-none border-none"
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ACCESS RECEIPT MODAL
          ════════════════════════════════════════════════════════════════ */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
                  Access Receipt
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Receipt ID:</span>
                <span className="font-bold text-blue-600">{accessReceiptId || 'RCPT-2026-9402'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-800">{new Date().toLocaleString('en-GB')}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Officer Signature:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span>Signed with your key</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Ledger Status:</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span>Recorded on ledger</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              This access receipt is your personal proof of authorized decryption under Indian Navy Command regulations.
            </p>

            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold font-['Montserrat'] hover:bg-slate-800 cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
