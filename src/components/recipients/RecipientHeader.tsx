import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { RecipientDirectoryModal } from '../modals/RecipientDirectoryModal';

export const RecipientHeader: React.FC = () => {
  const [directoryOpen, setDirectoryOpen] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
              Recipient & Unit Registry
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200">
              45 Registered Units
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Track authorized naval recipients, vessel communications nodes, and cryptographic decryption events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDirectoryOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#0F5257] hover:bg-[#0b3e42] text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Open Recipient Directory</span>
          </button>
        </div>
      </div>

      <RecipientDirectoryModal
        isOpen={directoryOpen}
        onClose={() => setDirectoryOpen(false)}
      />
    </>
  );
};

export default RecipientHeader;
