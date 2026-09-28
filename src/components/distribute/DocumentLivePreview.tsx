import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  ExternalLink
} from 'lucide-react';
import { DocumentViewer } from '../viewer/DocumentViewer';

interface DocumentLivePreviewProps {
  file?: File | Blob | string | null;
  fileName?: string;
  dynamicWatermarkEnabled?: boolean;
  activeRecipientName?: string;
}

export const DocumentLivePreview: React.FC<DocumentLivePreviewProps> = ({
  file = '/Operation_Briefing_Alpha.pdf',
  fileName = 'Operation_Briefing_Alpha.pdf',
}) => {
  const navigate = useNavigate();

  const handleOpenFullViewer = () => {
    navigate('/documents/DOC-2026-0842/preview');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-3 flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-100 shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#0F172A] uppercase">
              DOCUMENT PREVIEW
            </h3>
            <p className="text-[11.5px] text-slate-500 font-medium">
              Preview only. Recipient copies carry invisible forensic marking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Fullscreen Viewer Button */}
          <button
            type="button"
            onClick={handleOpenFullViewer}
            className="h-8 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            title="Open Fullscreen Document Viewer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
            <span>Open Full Viewer</span>
          </button>
        </div>
      </div>

      {/* Embedded Real Document Viewer */}
      <div className="w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 shadow-inner">
        <DocumentViewer
          file={file || '/Operation_Briefing_Alpha.pdf'}
          fileName={fileName}
          fileSize="2.4 MB"
          classification="SECRET // NOFORN"
          masterDocId="IN-DOC-2026-ALPHA-0842"
          sha3Hash="7e9f3b2a4c6d8e1f0b5a9321c8d7e6f543210987654321abcdef0123456789ab"
          version="v1.4 (Signed)"
          mode="sender-preview"
          permissions={{
            download: false,
            print: false,
            edit: false,
          }}
          className="h-full rounded-none border-none"
        />
      </div>
    </div>
  );
};

export default DocumentLivePreview;
