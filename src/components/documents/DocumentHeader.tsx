import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

interface DocumentHeaderProps {
  onDistributeClick?: () => void;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({ onDistributeClick }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Document Registry & Lifecycle
          </h1>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
            Sovereign Ledger
          </span>
        </div>
        <p className="text-xs text-[#64748B] mt-0.5">
          Track every classified document lifecycle from cryptographic ingestion to multi-band watermarked distribution.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (onDistributeClick) {
              onDistributeClick();
            } else {
              navigate('/distribute');
            }
          }}
          className="px-4 py-2 rounded-lg bg-[#0F5257] hover:bg-[#0b3e42] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Distribute Document</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentHeader;
