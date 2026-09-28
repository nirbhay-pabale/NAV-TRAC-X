import React, { useState } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Share2
} from 'lucide-react';
import { TimelineVersionsTab } from './TimelineVersionsTab';
import { DistributionRecipientsTab } from './DistributionRecipientsTab';
import { LeakMonitoringTab } from './LeakMonitoringTab';
import type { DocumentItem } from '../../types/document';
import { useNavigate } from 'react-router-dom';

interface DocumentDetailDrawerProps {
  document: DocumentItem | null;
  onClose: () => void;
  onDistribute?: (doc: DocumentItem) => void;
}

export const DocumentDetailDrawer: React.FC<DocumentDetailDrawerProps> = ({
  document,
  onClose,
  onDistribute,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'versions' | 'distribution' | 'leak-monitoring'>('overview');
  const [copiedHash, setCopiedHash] = useState(false);

  if (!document) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(document.sha3Fingerprint);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 1500);
  };

  const getClassificationPill = () => {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-purple-50 border border-purple-200 text-purple-700">
        {document.classification}
      </span>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full animate-fadeIn">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 bg-white">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Document Details</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Document Primary Badge */}
        <div className="flex items-start justify-between gap-3 mt-1">
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] leading-tight">
              {document.name}
            </h3>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              {document.id} • {document.version}
            </p>
          </div>

          {getClassificationPill()}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 mt-3 p-1 rounded-lg bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all text-center ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('versions')}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all text-center ${
              activeTab === 'versions'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Versions
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('distribution')}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all text-center ${
              activeTab === 'distribution'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Distribution
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leak-monitoring')}
            className={`flex-1 py-1 px-2 rounded-md font-semibold transition-all text-center relative ${
              activeTab === 'leak-monitoring'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Leaks</span>
            {document.leakAlertCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Body Content */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3.5 bg-[#F8FAFC]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            {/* Description Card */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mission Synopsis</span>
              <p className="text-slate-700 leading-relaxed font-sans">
                {document.description}
              </p>
            </div>

            {/* Metadata Sanitization Badge */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                {document.metadataSanitized ? (
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <div className="font-bold text-[#0F172A]">
                    {document.metadataSanitized ? 'Metadata Sanitized' : 'Metadata Warning'}
                  </div>
                  <div className="text-[10.5px] text-slate-500">
                    {document.metadataSanitized
                      ? 'All EXIF, author IDs, and machine headers stripped.'
                      : 'Non-sanitized author headers present in file stream.'}
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  document.metadataSanitized
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {document.metadataSanitized ? 'SANITIZED' : 'UNSANITIZED'}
              </span>
            </div>

            {/* Steganographic Watermark Coverage */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2 shadow-sm">
              <div className="flex items-center justify-between font-mono">
                <span className="text-slate-800 font-bold font-sans">Watermark Coverage</span>
                <span className="text-emerald-700 font-bold">{document.watermarkCoverage}% of Pages</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${document.watermarkCoverage}%` }}
                />
              </div>
              <p className="text-[10.5px] text-slate-500">
                Recipient-specific cryptographic watermark seeded across micro-kerning and frequency domains.
              </p>
            </div>

            {/* Technical Parameters Matrix */}
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2 font-mono shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px]">SHA3-256 Digest:</span>
                <button
                  type="button"
                  onClick={copyHash}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Copy Hash"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200 text-[10.5px] text-slate-800 font-bold truncate">
                {document.sha3Fingerprint}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-[10.5px]">
                <div>
                  <span className="text-slate-400 block">Created Date:</span>
                  <span className="text-slate-800 font-semibold">{document.createdAt}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">File Size & Pages:</span>
                  <span className="text-slate-800 font-semibold">{document.fileSize} ({document.pageCount} pgs)</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">Distributed By:</span>
                  <span className="text-slate-800 font-semibold truncate block">{document.distributedBy}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERSIONS TIMELINE */}
        {activeTab === 'versions' && (
          <TimelineVersionsTab documentId={document.id} />
        )}

        {/* TAB 3: DISTRIBUTION RECIPIENTS */}
        {activeTab === 'distribution' && (
          <DistributionRecipientsTab documentId={document.id} />
        )}

        {/* TAB 4: LEAK MONITORING */}
        {activeTab === 'leak-monitoring' && (
          <LeakMonitoringTab documentId={document.id} />
        )}
      </div>

      {/* Drawer Bottom Actions */}
      <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            if (onDistribute) {
              onDistribute(document);
            } else {
              navigate('/distribute');
            }
          }}
          className="flex-1 py-2 px-3 rounded-lg bg-[#0F5257] hover:bg-[#0b3e42] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Distribute Replicas</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/investigations/new')}
          className="py-2 px-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Forensic Scan</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentDetailDrawer;
