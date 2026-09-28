import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  ChevronRight,
  AlertTriangle,
  Users
} from 'lucide-react';
import type { DocumentItem, DocumentClassification } from '../../types/document';

interface DocumentTableProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelectDocument: (doc: DocumentItem) => void;
  isLoading: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({
  documents,
  selectedDocId,
  onSelectDocument,
  isLoading,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getClassificationPill = (classification: DocumentClassification) => {
    switch (classification) {
      case 'TOP SECRET (CODEWORD)':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
            TOP SECRET (CW)
          </span>
        );
      case 'TOP SECRET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
            TOP SECRET
          </span>
        );
      case 'SECRET':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            SECRET
          </span>
        );
      case 'CONFIDENTIAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            CONFIDENTIAL
          </span>
        );
      default:
        return <span>{classification}</span>;
    }
  };

  const getStatusPill = (status: string, leakAlertCount: number) => {
    if (leakAlertCount > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10.5px] font-bold text-red-700">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          Leak Alert ({leakAlertCount})
        </span>
      );
    }
    if (status === 'Distributed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10.5px] font-bold text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Distributed
        </span>
      );
    }
    if (status === 'Draft') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10.5px] font-semibold text-slate-700">
          Draft
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[10.5px] font-semibold text-slate-600">
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-200">
              <th className="py-3 px-4">DOCUMENT NAME</th>
              <th className="py-3 px-3">MASTER DOC ID</th>
              <th className="py-3 px-3 text-center">VERSION</th>
              <th className="py-3 px-3">CLASSIFICATION</th>
              <th className="py-3 px-3 text-center">RECIPIENTS</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  Loading secure document registry…
                </td>
              </tr>
            ) : documents && documents.length > 0 ? (
              documents.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <tr
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-[3px] border-l-[#2563EB]'
                        : 'hover:bg-slate-50/70 border-l-[3px] border-l-transparent'
                    }`}
                  >
                    {/* Document Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB] flex-shrink-0 border border-blue-100">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-900 text-xs truncate max-w-[220px]">
                            {doc.name}
                          </div>
                          <div className="text-[10.5px] text-slate-500 mt-0.5">
                            {doc.fileSize} • {doc.pageCount} Pages • {doc.format}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Master ID */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800 font-semibold font-mono text-[11px]">{doc.id}</span>
                        <button
                          type="button"
                          onClick={(e) => copyToClipboard(e, doc.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                          title="Copy Master Document ID"
                        >
                          {copiedId === doc.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Version */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 text-[10.5px] font-bold font-mono">
                        {doc.version}
                      </span>
                    </td>

                    {/* Classification */}
                    <td className="py-3.5 px-3">
                      {getClassificationPill(doc.classification)}
                    </td>

                    {/* Recipients Count */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">
                        <Users className="w-3 h-3 text-slate-400" />
                        {doc.recipientsCount}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {getStatusPill(doc.status, doc.leakAlertCount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDocument(doc);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-blue-600 text-xs font-semibold flex items-center gap-1 ml-auto border border-slate-200 transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No documents found matching the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentTable;
