import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { DocumentViewer } from '../components/viewer/DocumentViewer';
import { useDocumentDetail } from '../hooks/useDocumentData';

export const DocumentFullScreenPreviewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const { data: documentData } = useDocumentDetail(id || 'NAV-DOC-2026-0042');

  const resolvedFileName = documentData?.name || 'Operation_Briefing_Alpha.pdf';

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F7FB] flex flex-col h-screen w-screen overflow-hidden">
      {/* Top Standalone Header Bar */}
      <div className="h-14 bg-white border-b border-[#E6EAF2] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Back to Previous Page"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              FULL-SCREEN DOCUMENT VIEWER
            </span>
            <span className="pill-blue px-2 py-0.5 text-[10.5px] font-mono font-bold">
              {documentData?.classification || 'SECRET // NOFORN'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PQC Validated Enclave</span>
          </span>
        </div>
      </div>

      {/* Main Fullscreen Viewer */}
      <div className="flex-1 p-2 sm:p-4 overflow-hidden flex flex-col">
        <DocumentViewer
          file="/Operation_Briefing_Alpha.pdf"
          fileName={resolvedFileName}
          fileSize={documentData?.fileSize || '2.4 MB'}
          classification={documentData?.classification || 'SECRET // NOFORN'}
          masterDocId={documentData?.id || 'IN-DOC-2026-ALPHA-0842'}
          sha3Hash={documentData?.sha3Fingerprint || '7e9f3b2a4c6d8e1f0b5a9321c8d7e6f543210987654321abcdef0123456789ab'}
          version={documentData?.version || 'v1.4 (PQC Signed)'}
          mode="sender-preview"
          permissions={{
            download: false,
            print: false,
            edit: false,
          }}
          onClose={() => navigate(-1)}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default DocumentFullScreenPreviewPage;
