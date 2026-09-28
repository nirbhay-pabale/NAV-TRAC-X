import React, { useState } from 'react';
import {
  Radio,
  Globe,
  Shield,
  Layers
} from 'lucide-react';
import { CommsControlConfirmModal } from './CommsControlConfirmModal';
import {
  useEmconStatus,
  useUpdateCommsControl
} from '../../hooks/useEmconData';
import type { CommsControlItem, CommsControlState } from '../../types/emcon';

export const EmconStatusCards: React.FC = () => {
  const { data: emconStatus } = useEmconStatus();
  const updateCommsMutation = useUpdateCommsControl();
  const [selectedControl, setSelectedControl] = useState<CommsControlItem | null>(null);

  const handleConfirmControlChange = async (targetState: CommsControlState, rationale: string) => {
    if (!selectedControl) return;
    await updateCommsMutation.mutateAsync({
      id: selectedControl.id,
      newState: targetState,
      rationale
    });
    setSelectedControl(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Card 1: EMCON Condition */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current EMCON Level</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-bold text-[#0F172A]">
              {emconStatus?.currentPosture || 'EMCON BRAVO'}
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {emconStatus?.emconLevel ? `Level ${emconStatus.emconLevel}` : 'Restricted RF'}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            {emconStatus?.scope || 'Western Fleet Tactical Taskforce'}
          </div>
        </div>

        {/* Card 2: Vessel Connectivity */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Vessel Connectivity</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center border border-blue-200">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F172A] font-mono">
              18 / 24
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              6 Silent
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            6 Units in Radio-Silent Patrol
          </div>
        </div>

        {/* Card 3: Offline Queued Packets */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Queued Packets (Offline)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F172A] font-mono">
              42
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Encrypted
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            Auto-sync upon RF reconnection
          </div>
        </div>

        {/* Card 4: Emission Breaches */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Emission Anomalies</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-[#0F172A] font-mono">
              0
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Zero Breach
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
            No unauthorized transmissions detected
          </div>
        </div>
      </div>

      {/* Comms Controls Confirmation Modal */}
      {selectedControl && (
        <CommsControlConfirmModal
          isOpen={!!selectedControl}
          onClose={() => setSelectedControl(null)}
          control={selectedControl}
          onConfirm={handleConfirmControlChange}
        />
      )}
    </>
  );
};

export default EmconStatusCards;
