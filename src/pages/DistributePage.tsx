import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { DocumentUploadStep } from '../components/distribute/DocumentUploadStep';
import { RecipientsStep } from '../components/distribute/RecipientsStep';
import { AccessPermissionsStep } from '../components/distribute/AccessPermissionsStep';
import { DocumentLivePreview } from '../components/distribute/DocumentLivePreview';
import { useDistributeDocument } from '../hooks/useDistributeDocument';
import type { AccessType, AdvancedRestrictions, DistributionPayload } from '../types/distribution';

export const DistributePage: React.FC = () => {
  const navigate = useNavigate();
  const distributeMutation = useDistributeDocument();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMeta, setFileMeta] = useState<{
    name: string;
    size: string;
    type: string;
    classification: string;
  } | null>({
    name: 'Operation_Briefing_Alpha.pdf',
    size: '12.4 MB',
    type: 'PDF',
    classification: 'Classified'
  });

  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([
    'user-01',
    'user-02'
  ]);

  const [accessType, setAccessType] = useState<AccessType>('view');

  const [restrictions, setRestrictions] = useState<AdvancedRestrictions>({
    dynamicWatermarking: true,
    screenCaptureProtection: true,
    deviceBinding: true
  });

  const [validityPreset, setValidityPreset] = useState('7');
  const [dateRangeText, setDateRangeText] = useState('27 Sep 2026 – 04 Oct 2026');
  const [accessReason, setAccessReason] = useState('Mission planning document for Operation Alpha.');

  const [feedbackToast, setFeedbackToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleToggleRecipient = (id: string) => {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((rId) => rId !== id) : [...prev, id]
    );
  };

  const handleToggleRestriction = (key: keyof AdvancedRestrictions) => {
    setRestrictions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleValidityPresetChange = (preset: string) => {
    setValidityPreset(preset);
    const now = new Date();
    const days = parseInt(preset, 10) || 7;
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startStr = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const endStr = `${end.getDate().toString().padStart(2, '0')} ${months[end.getMonth()]} ${end.getFullYear()}`;

    setDateRangeText(`${startStr} – ${endStr}`);
  };

  const canSubmit =
    fileMeta !== null &&
    selectedRecipientIds.length > 0 &&
    accessType !== undefined &&
    accessReason.trim().length > 0;

  const handleDistributeSubmit = async () => {
    if (!canSubmit) return;

    try {
      const payload: DistributionPayload = {
        document: fileMeta!,
        recipients: selectedRecipientIds.map((id) => ({
          id,
          name: id === 'user-01' ? 'Cdr. A. Mehta' : id === 'user-02' ? 'Lt. Priya Singh' : 'Authorized Recipient',
          unit: 'NAV-OPS-042',
          role: 'Operations',
          category: 'Users',
          initials: 'AM',
          isAuthorized: true,
          clearanceLevel: 'LEVEL 4'
        })),
        accessType,
        advancedRestrictions: restrictions,
        watermarkPolicy: restrictions.dynamicWatermarking ? 'dynamic-per-recipient' : 'none',
        screenCaptureProtection: restrictions.screenCaptureProtection,
        deviceBinding: restrictions.deviceBinding,
        validityWindow: {
          durationDays: parseInt(validityPreset, 10) || 7,
          startDate: dateRangeText.split(' – ')[0],
          endDate: dateRangeText.split(' – ')[1]
        },
        accessReason
      };

      const result = await distributeMutation.mutateAsync(payload);
      setFeedbackToast({
        type: 'success',
        message: result.message
      });

      setTimeout(() => {
        navigate('/documents');
      }, 2000);
    } catch (err: any) {
      setFeedbackToast({
        type: 'error',
        message: err.message || 'Cryptographic distribution failed. Please verify air-gap link.'
      });
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12 max-w-[1700px] mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Distribute Document
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
              ML-KEM-768 Encapsulation
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Share sensitive naval files with steganographic watermarking, post-quantum encryption, and hardware device binding.
          </p>
        </div>
      </div>

      {/* Global Toast Feedback */}
      {feedbackToast && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold shadow-sm animate-fadeIn ${
            feedbackToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {feedbackToast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (Cols 1-7): Step 1 & Step 2 + Live Preview */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <DocumentUploadStep
              selectedFile={selectedFile}
              fileMeta={fileMeta}
              onFileSelect={(file, meta) => {
                setSelectedFile(file);
                setFileMeta(meta);
              }}
              onFileRemove={() => {
                setSelectedFile(null);
                setFileMeta(null);
              }}
            />

            <RecipientsStep
              selectedRecipientIds={selectedRecipientIds}
              onToggleRecipient={handleToggleRecipient}
            />
          </div>

          <DocumentLivePreview
            fileName={fileMeta?.name || 'No document selected'}
            dynamicWatermarkEnabled={restrictions.dynamicWatermarking}
            activeRecipientName={
              selectedRecipientIds.includes('user-01')
                ? 'Cdr. A. Mehta'
                : 'Authorized Naval Officer'
            }
          />
        </div>

        {/* Right Column (Cols 8-12): Step 3 (Access & Permissions) */}
        <div className="lg:col-span-5 flex flex-col">
          <AccessPermissionsStep
            accessType={accessType}
            onAccessTypeChange={setAccessType}
            restrictions={restrictions}
            onToggleRestriction={handleToggleRestriction}
            validityPreset={validityPreset}
            onValidityPresetChange={handleValidityPresetChange}
            dateRangeText={dateRangeText}
            accessReason={accessReason}
            onAccessReasonChange={setAccessReason}
            canSubmit={canSubmit}
            isSubmitting={distributeMutation.isPending}
            onSubmit={handleDistributeSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default DistributePage;
