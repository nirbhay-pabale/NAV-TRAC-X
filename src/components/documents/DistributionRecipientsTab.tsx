import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useDocumentRecipients } from '../../hooks/useDocumentData';

interface DistributionRecipientsTabProps {
  documentId: string;
}

export const DistributionRecipientsTab: React.FC<DistributionRecipientsTabProps> = ({ documentId }) => {
  const { data: recipients, isLoading } = useDocumentRecipients(documentId);

  if (isLoading) {
    return (
      <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
        Retrieving recipient dispatch matrix…
      </div>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        No recipients assigned to this document yet.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-1 animate-fadeIn">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1 border-b border-slate-200">
        <span>Authorized Recipients ({recipients.length})</span>
        <span className="text-[11px] text-emerald-700 font-mono flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Zero-Trust Watermarked
        </span>
      </div>

      <div className="space-y-2">
        {recipients.map((rec) => {
          const isDecrypted = rec.status === 'Decrypted';
          return (
            <div
              key={rec.id}
              className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all flex flex-col justify-between space-y-2 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {rec.recipientName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs">
                      {rec.recipientName}
                    </div>
                    <div className="text-[10.5px] text-slate-500">
                      {rec.rank} • PNo: <span className="font-mono text-slate-700 font-semibold">{rec.pno}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
                    isDecrypted
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                >
                  {rec.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10.5px] font-mono bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Unit / Vessel:</span>
                  <span className="truncate block font-semibold text-slate-800">{rec.unitVessel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Access Scope:</span>
                  <span className="text-blue-700 font-bold block">{rec.accessType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Device ID:</span>
                  <span className="text-slate-600 block truncate">{rec.deviceId}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9.5px]">Decrypted At:</span>
                  <span className="text-emerald-700 font-semibold block">{rec.decryptedAt || 'Pending Open'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DistributionRecipientsTab;
