import React, { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ForensicHeader } from './ForensicHeader';
import { UploadLeakedFilesColumn } from './UploadLeakedFilesColumn';
import { SplitCompareViewer } from './SplitCompareViewer';
import { AnalysisStepTracker } from './AnalysisStepTracker';
import { IdentificationResultColumn } from './IdentificationResultColumn';
import { BottomEvidencePanels } from './BottomEvidencePanels';
import { EvidenceLightboxModal } from '../modals/EvidenceLightboxModal';
import { OriginalDocumentModal } from '../modals/OriginalDocumentModal';
import { EvidenceDossierModal } from '../modals/EvidenceDossierModal';
import { ArtifactLineageGraph } from './ArtifactLineageGraph';
import { NotifySecurityModal } from './NotifySecurityModal';
import { useAnalyzeArtifact } from '../../hooks/useAnalyzeArtifact';
import { fetchBenchmarks } from '../../api/forensicApi';
import { downloadForensicReportPdf } from '../../utils/generateForensicPdf';
import type { ForensicArtifactFile } from '../../types/forensic';
import {
  FlaskConical,
  Download,
  FileSpreadsheet,
  Check,
  Share2,
  Scale,
  Mail,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface ForensicWorkbenchProps {
  caseId?: string;
  isNewCase?: boolean;
  initialOutcome?: string;
  initialSelectedFileId?: string;
}

const DEFAULT_BENCHMARK_FILES: ForensicArtifactFile[] = [
  {
    id: 'ART-BENCH-001',
    name: 'operation_alpha_briefing.png',
    size: '1.8 MB',
    format: 'PNG',
    type: 'image',
    status: 'Uploaded',
    previewUrl: '/api/artifacts/ART-BENCH-001/file',
    hash: 'sha3-71a2…1192',
    benchmarkId: 'BENCH-1',
    expectedOutcome: 'Verified',
    isBenchmark: true,
  },
  {
    id: 'ART-BENCH-002',
    name: 'tampered_payload_exhibit.png',
    size: '1.8 MB',
    format: 'PNG',
    type: 'image',
    status: 'Uploaded',
    previewUrl: '/api/artifacts/ART-BENCH-002/file',
    hash: 'sha3-4f81…99a1',
    benchmarkId: 'BENCH-2',
    expectedOutcome: 'Manipulation Suspected',
    isBenchmark: true,
  },
  {
    id: 'ART-BENCH-003',
    name: 'contradictory_leak.png',
    size: '1.8 MB',
    format: 'PNG',
    type: 'image',
    status: 'Uploaded',
    previewUrl: '/api/artifacts/ART-BENCH-003/file',
    hash: 'sha3-99b2…33c1',
    benchmarkId: 'BENCH-3',
    expectedOutcome: 'Contradictory',
    isBenchmark: true,
  },
  {
    id: 'ART-BENCH-004',
    name: 'cropped_degraded_copy.png',
    size: '0.4 MB',
    format: 'PNG',
    type: 'image',
    status: 'Uploaded',
    previewUrl: '/api/artifacts/ART-BENCH-004/file',
    hash: 'sha3-11a9…88e2',
    benchmarkId: 'BENCH-4',
    expectedOutcome: 'Unresolved',
    isBenchmark: true,
  },
  {
    id: 'ART-BENCH-005',
    name: 'clean_unmarked_photo.png',
    size: '1.8 MB',
    format: 'PNG',
    type: 'image',
    status: 'Uploaded',
    previewUrl: '/api/artifacts/ART-BENCH-005/file',
    hash: 'sha3-00e4…77f1',
    benchmarkId: 'BENCH-5',
    expectedOutcome: 'No Match',
    isBenchmark: true,
  },
];

export const ForensicWorkbench: React.FC<ForensicWorkbenchProps> = ({
  caseId = 'INV-2026-0042',
  isNewCase = false,
}) => {
  const [activeCaseId, setActiveCaseId] = useState<string>(caseId);
  const [uploadedFiles, setUploadedFiles] = useState<ForensicArtifactFile[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string>(DEFAULT_BENCHMARK_FILES[0].id);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Fetch benchmark metadata from sovereign engine
  const { data: benchmarksData } = useQuery({
    queryKey: ['benchmarks'],
    queryFn: fetchBenchmarks,
  });

  const files = useMemo<ForensicArtifactFile[]>(() => {
    const dynamicBenchmarks: ForensicArtifactFile[] = (benchmarksData && benchmarksData.length > 0)
      ? benchmarksData.map((b) => ({
          id: b.id,
          name: b.filename,
          size: b.file_size,
          format: 'PNG',
          type: 'image' as const,
          status: 'Uploaded' as const,
          previewUrl: `/api/artifacts/${b.id}/file`,
          hash: b.sha3_256 ? `${b.sha3_256.substring(0, 8)}…` : 'sha3-ok',
          benchmarkId: b.benchmark_id,
          expectedOutcome: b.expected_outcome,
          isBenchmark: true,
        }))
      : DEFAULT_BENCHMARK_FILES;

    return [...dynamicBenchmarks, ...uploadedFiles];
  }, [benchmarksData, uploadedFiles]);

  // Forensic Sovereign Engine Hook
  const {
    analyzeMutation,
    analystReviewMutation,
    isAnalyzing,
    currentResult,
    stages,
    pipelineStatusText,
    selectArtifact,
    cancelAnalysis,
    resetAnalysis,
  } = useAnalyzeArtifact(undefined, activeCaseId, selectedFileId);

  // Modals state
  const [lightboxEvidenceType, setLightboxEvidenceType] = useState<string | null>(null);
  const [originalDocModalOpen, setOriginalDocModalOpen] = useState(false);
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [lineageModalOpen, setLineageModalOpen] = useState(false);
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  // Selected file reference
  const selectedFile = useMemo(() => {
    return files.find((f) => f.id === selectedFileId) || files[0];
  }, [files, selectedFileId]);

  // Select File Handler (Loads file and resets to Not analyzed)
  const handleSelectFile = useCallback((file: ForensicArtifactFile) => {
    setSelectedFileId(file.id);
    selectArtifact(file.id, file.isBenchmark, file.benchmarkId, file.expectedOutcome);
  }, [selectArtifact]);

  // Add / Upload files
  const handleAddFiles = useCallback((newFiles: ForensicArtifactFile[]) => {
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (newFiles.length > 0) {
      setSelectedFileId(newFiles[0].id);
      selectArtifact(newFiles[0].id, newFiles[0].isBenchmark, newFiles[0].benchmarkId, newFiles[0].expectedOutcome);
    }
  }, [selectArtifact]);

  // Remove file
  const handleRemoveFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      if (selectedFileId === fileId && updated.length > 0) {
        setSelectedFileId(updated[0].id);
        selectArtifact(updated[0].id, updated[0].isBenchmark, updated[0].benchmarkId, updated[0].expectedOutcome);
      }
      return updated;
    });
  }, [selectedFileId, selectArtifact]);

  // Reset Workbench Case
  const handleResetCase = useCallback(() => {
    setUploadedFiles([]);
    setSelectedFileId(DEFAULT_BENCHMARK_FILES[0].id);
    resetAnalysis();
  }, [resetAnalysis]);

  // Run Analysis
  const handleRunAnalysis = useCallback(() => {
    if (selectedFile) {
      analyzeMutation.mutate({ file: selectedFile });
    }
  }, [selectedFile, analyzeMutation]);

  // Benchmark Buttons Handler
  const handleSelectBenchmark = useCallback((benchId: string) => {
    const found = files.find((f) => f.benchmarkId === benchId);
    if (found) {
      setSelectedFileId(found.id);
      selectArtifact(found.id, true, benchId, found.expectedOutcome);
    }
  }, [files, selectArtifact]);

  // Export Report PDF Handler (Dynamic Section 63 BSA PDF with server fallback)
  const handleExportReportPdf = useCallback(async () => {
    if (!currentResult || !selectedFile) return;
    setIsGeneratingPdf(true);
    setDownloadToast(`Generating Section 63 BSA Forensic Examination Report for ${selectedFile.name}…`);
    try {
      await downloadForensicReportPdf({
        caseId: activeCaseId,
        file: selectedFile,
        result: currentResult,
      });
      setDownloadToast(`Signed Forensic Examination Report (${selectedFile.name}) Downloaded`);
      setTimeout(() => setDownloadToast(null), 3000);
    } catch (err) {
      console.warn('Local PDF generation fallback:', err);
      const link = document.createElement('a');
      link.href = `/api/reports/${activeCaseId}.pdf`;
      link.download = `Forensic_Report_${activeCaseId}_${selectedFile.name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadToast('Signed Forensic Examination Report (.pdf) Downloaded');
      setTimeout(() => setDownloadToast(null), 2500);
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [activeCaseId, currentResult, selectedFile]);

  // Evidence Package Zip Handler
  const handleExportEvidenceZip = useCallback(() => {
    setLightboxEvidenceType('heatmap');
  }, []);

  const hasAnalysisResult = currentResult !== null;

  // Benchmark Outcome Validation
  const benchmarkStatus = useMemo(() => {
    if (!currentResult || !selectedFile.isBenchmark || !selectedFile.expectedOutcome) return null;
    const matches = currentResult.outcome.toLowerCase() === selectedFile.expectedOutcome.toLowerCase();
    return {
      matches,
      expected: selectedFile.expectedOutcome,
      actual: currentResult.outcome,
    };
  }, [currentResult, selectedFile]);

  return (
    <div className="relative space-y-4 animate-fadeIn pb-10 min-h-screen">
      {/* 1. Forensic Header */}
      <ForensicHeader
        onResetCase={handleResetCase}
        hasUnsavedChanges={hasAnalysisResult}
        caseId={activeCaseId}
        isExistingCase={!isNewCase}
        onSelectCase={(newCaseId) => setActiveCaseId(newCaseId)}
      />

      {/* 2. Interactive Benchmark Bar & Analysis Action Buttons */}
      <div className="rounded-xl bg-white border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        {/* Left: 5 Benchmark Buttons */}
        <div className="flex items-center gap-2 text-slate-700 font-semibold flex-wrap">
          <div className="flex items-center gap-1.5 text-amber-600">
            <FlaskConical className="w-4 h-4" />
            <span>Forensic Benchmarks:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'BENCH-1', label: '1. Verified (NAVX-0042)' },
              { id: 'BENCH-2', label: '2. Manipulation (NAVX-0041)' },
              { id: 'BENCH-3', label: '3. Contradictory (NAVX-0040)' },
              { id: 'BENCH-4', label: '4. Unresolved (NAVX-0039)' },
              { id: 'BENCH-5', label: '5. No Match (NAVX-0038)' },
            ].map((bench) => {
              const isSelected = selectedFile?.benchmarkId === bench.id;
              return (
                <button
                  key={bench.id}
                  type="button"
                  onClick={() => handleSelectBenchmark(bench.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                  title={`Load Benchmark Scenario ${bench.id}`}
                >
                  {bench.label}
                </button>
              );
            })}
          </div>

          {/* Benchmark Expectation Badge */}
          {benchmarkStatus && (
            <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1 border ${
              benchmarkStatus.matches
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}>
              {benchmarkStatus.matches ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>
                {benchmarkStatus.matches
                  ? 'Engine result matches benchmark expectation'
                  : `Differs from expectation (Expected: ${benchmarkStatus.expected}, Result: ${benchmarkStatus.actual})`}
              </span>
            </div>
          )}
        </div>

        {/* Right: 5 Forensic Action Buttons (Disabled with Tooltip until Analysis Complete) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 1. Lineage Graph */}
          <div className="relative group">
            <button
              type="button"
              disabled={!hasAnalysisResult}
              onClick={() => setLineageModalOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                hasAnalysisResult
                  ? 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Lineage Graph</span>
            </button>
            {!hasAnalysisResult && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 font-mono">
                Run analysis to generate React Flow lineage graph
              </div>
            )}
          </div>

          {/* 2. Sec 63 Dossier */}
          <div className="relative group">
            <button
              type="button"
              disabled={!hasAnalysisResult}
              onClick={() => setDossierModalOpen(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                hasAnalysisResult
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <Scale className="w-3.5 h-3.5 text-purple-600" />
              <span>Sec 63 Dossier</span>
            </button>
            {!hasAnalysisResult && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 font-mono">
                Run analysis to view legal Section 63 BSA certificate
              </div>
            )}
          </div>

          {/* 3. Export Report (Real PDF) */}
          <div className="relative group">
            <button
              type="button"
              disabled={!hasAnalysisResult}
              onClick={handleExportReportPdf}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                hasAnalysisResult
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-60'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            {!hasAnalysisResult && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 font-mono">
                Run analysis to download signed cryptographic PDF
              </div>
            )}
          </div>

          {/* 4. Evidence Package (Zip + Gallery) */}
          <div className="relative group">
            <button
              type="button"
              disabled={!hasAnalysisResult}
              onClick={handleExportEvidenceZip}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                hasAnalysisResult
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Evidence</span>
            </button>
            {!hasAnalysisResult && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 font-mono">
                Run analysis to view multi-band gallery and zip
              </div>
            )}
          </div>

          {/* 5. Notify Security Team (Not offered for No Match) */}
          {currentResult?.outcome !== 'No Match' && (
            <div className="relative group">
              <button
                type="button"
                disabled={!hasAnalysisResult}
                onClick={() => setNotifyModalOpen(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                  hasAnalysisResult
                    ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span>Notify Security Team</span>
              </button>
              {!hasAnalysisResult && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-30 font-mono">
                  Run analysis to dispatch incident notification
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Main 3-Column Forensic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Column 1: Upload Leaked Files (3 cols) */}
        <div className="lg:col-span-3">
          <UploadLeakedFilesColumn
            files={files}
            selectedFileId={selectedFileId}
            onSelectFile={handleSelectFile}
            onRemoveFile={handleRemoveFile}
            onAddFiles={handleAddFiles}
          />
        </div>

        {/* Column 2: Document View & 7-Stage Pipeline (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <SplitCompareViewer
            filename={selectedFile?.name || 'artifact.png'}
            fileUrl={selectedFile?.previewUrl || `/api/artifacts/${selectedFile?.id}/file`}
            heatmapUrl={currentResult?.visual_evidence?.heatmap_url}
            processedUrl={currentResult?.visual_evidence?.processed_url}
            spectralUrl={currentResult?.visual_evidence?.spectral_url}
            fingerprintUrl={currentResult?.visual_evidence?.fingerprint_map_url}
            transformations={currentResult?.transformations}
            hotRegions={currentResult?.hot_regions}
            onOpenLightbox={() => setLightboxEvidenceType('heatmap')}
          />

          <AnalysisStepTracker
            stages={stages}
            isAnalyzing={isAnalyzing}
            statusText={pipelineStatusText}
            hasCompleted={hasAnalysisResult}
            onRunAnalysis={handleRunAnalysis}
            onCancelAnalysis={cancelAnalysis}
            disabled={!selectedFile}
          />
        </div>

        {/* Column 3: Identification Result (3 cols) */}
        <div className="lg:col-span-3">
          <IdentificationResultColumn
            result={currentResult}
            isAnalyzing={isAnalyzing}
            onOpenOriginalDoc={() => setOriginalDocModalOpen(true)}
            onTriageReview={async (action, reason) => {
              await analystReviewMutation.mutateAsync({ action, reason });
            }}
            isReviewing={analystReviewMutation.isPending}
            onDownloadPdf={handleExportReportPdf}
            isDownloadingPdf={isGeneratingPdf}
          />
        </div>
      </div>

      {/* 4. Bottom 4 Evidence Panels */}
      <BottomEvidencePanels
        result={currentResult}
        caseId={activeCaseId}
        filename={selectedFile?.name || 'artifact.png'}
        onOpenEvidenceModal={(type) => setLightboxEvidenceType(type)}
      />

      {/* Modals */}
      {/* 1. Multi-Band Lightbox Gallery & Zip Modal */}
      <EvidenceLightboxModal
        isOpen={Boolean(lightboxEvidenceType)}
        onClose={() => setLightboxEvidenceType(null)}
        evidenceType={lightboxEvidenceType}
        caseId={activeCaseId}
        result={currentResult}
      />

      {/* 2. Original Document Modal */}
      <OriginalDocumentModal
        isOpen={originalDocModalOpen}
        onClose={() => setOriginalDocModalOpen(false)}
        document={currentResult?.document}
      />

      {/* 3. Section 63 BSA Evidence Dossier Modal */}
      <EvidenceDossierModal
        isOpen={dossierModalOpen}
        onClose={() => setDossierModalOpen(false)}
        caseId={activeCaseId}
        result={currentResult as any}
      />

      {/* 4. Lineage Graph Modal (React Flow + Dagre) */}
      {lineageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-5xl h-[85vh] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Forensic Provenance Lineage Graph ({activeCaseId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLineageModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full h-full">
              <ArtifactLineageGraph
                outcome={currentResult?.outcome?.toLowerCase() as any}
                caseId={activeCaseId}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Notify Security Team Modal */}
      <NotifySecurityModal
        isOpen={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
        caseId={activeCaseId}
        documentName={currentResult?.document?.name || selectedFile?.name}
        suspectName={currentResult?.recipient ? `${currentResult.recipient.rank} ${currentResult.recipient.name}` : 'Unattributed Subject'}
        confidenceScore={currentResult?.confidence || 0}
        outcome={currentResult?.outcome || 'Pending'}
        defaultMessage={currentResult?.narratives?.security_message?.text}
      />

      {/* Download Toast Notification */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-semibold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
};

export default ForensicWorkbench;
