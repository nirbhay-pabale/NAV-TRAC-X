import React from 'react';
import { Clock, User, ShieldAlert, Key, ArrowRight } from 'lucide-react';
import { useDocumentVersions } from '../../hooks/useDocumentData';
import { useNavigate } from 'react-router-dom';

interface TimelineVersionsTabProps {
  documentId: string;
}

export const TimelineVersionsTab: React.FC<TimelineVersionsTabProps> = ({ documentId }) => {
  const navigate = useNavigate();
  const { data: versions, isLoading } = useDocumentVersions(documentId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        Retrieving cryptographic version lineage…
      </div>
    );
  }

  if (!versions || versions.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        No historical versions recorded for this document.
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-1 animate-fadeIn">
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pb-2">
        {versions.map((ver, idx) => {
          const isLatest = idx === 0;
          return (
            <div key={ver.version} className="relative pl-6 group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  ver.isLeakedMatch
                    ? 'bg-red-500 border-red-200 shadow-sm'
                    : isLatest
                    ? 'bg-blue-600 border-blue-200 shadow-sm'
                    : 'bg-white border-slate-300'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isLatest || ver.isLeakedMatch ? 'bg-white' : 'bg-slate-400'}`} />
              </div>

              {/* Version Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
                      {ver.version}
                    </span>
                    {isLatest && (
                      <span className="text-[10.5px] font-bold text-blue-600 font-mono">
                        (Active Master)
                      </span>
                    )}
                    {ver.isLeakedMatch && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3 text-red-600" />
                        Matched Leaked Artifact
                      </span>
                    )}
                  </div>

                  <span className="text-[10.5px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {ver.releasedAt}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {ver.changeNotes}
                </p>

                <div className="text-[10.5px] text-slate-500 font-mono flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Author: <strong className="text-slate-800">{ver.author}</strong></span>
                </div>

                <div className="text-[10px] font-mono text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block">SHA-256 Digest:</span>
                  <span className="text-slate-800 font-bold truncate block">{ver.fileHash}</span>
                </div>

                {/* Linked Decryption Events */}
                {ver.linkedDecryptionEvents && ver.linkedDecryptionEvents.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10.5px] font-bold text-slate-500 font-mono uppercase tracking-wider block">
                      Decryption Sessions on this Version ({ver.linkedDecryptionEvents.length})
                    </span>

                    <div className="space-y-1">
                      {ver.linkedDecryptionEvents.map((evt) => (
                        <div
                          key={evt.eventId}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-[11px] font-mono hover:bg-blue-50/50 border border-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            <Key className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="text-blue-700 font-bold">{evt.eventId}</span>
                            <span className="text-slate-600 truncate">({evt.recipientName})</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-slate-400">{evt.decryptedAt}</span>
                            {evt.matchedLeakArtifact && (
                              <button
                                type="button"
                                onClick={() => navigate('/investigations/INV-2026-0042')}
                                className="text-[10px] text-red-600 hover:text-red-800 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                              >
                                <span>Trace</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVersionsTab;
