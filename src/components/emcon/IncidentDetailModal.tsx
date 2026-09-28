import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Search, Key, CheckCircle2 } from 'lucide-react';
import type { EmconIncident } from '../../types/emcon';

interface IncidentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: EmconIncident | null;
  onAcknowledge?: (incidentId: string) => void;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  isOpen,
  onClose,
  incident,
  onAcknowledge
}) => {
  const navigate = useNavigate();
  const [acknowledged, setAcknowledged] = useState(false);

  if (!isOpen || !incident) return null;

  const handleInvestigate = () => {
    onClose();
    navigate('/investigations/new');
  };

  const handleAck = () => {
    setAcknowledged(true);
    if (onAcknowledge) onAcknowledge(incident.id);
    setTimeout(() => {
      setAcknowledged(false);
      onClose();
    }, 800);
  };

  const getSeverityBadge = () => {
    if (incident.severity === 'High') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          High Severity
        </span>
      );
    }
    if (incident.severity === 'Medium') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium Severity
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        Low Severity
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
                  Incident Review #{incident.id}
                </h3>
                {getSeverityBadge()}
              </div>
              <p className="text-[11px] text-[#64748B]">
                Communication Anomaly & Provenance Discrepancy Analysis
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description Banner */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Incident Summary</span>
          <p className="text-xs text-slate-800 font-medium leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Technical Parameters Grid */}
        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Unit / Vessel:</span>
            <span className="text-[#0F172A] font-bold">{incident.unitVessel}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Detected Time:</span>
            <span className="text-[#0F172A] font-bold">{incident.timeZ} (Local: {incident.timeLocal})</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Frequency Band:</span>
            <span className="text-amber-700 font-bold">{incident.frequency || 'N/A (Multi-spectral)'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 block">Source IP / Node:</span>
            <span className="text-blue-700 font-bold truncate block">{incident.sourceIp || '10.14.88.21'}</span>
          </div>
        </div>

        {/* Cryptographic Evaluation */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2.5">
          <Key className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-blue-950 leading-relaxed">
            <strong className="text-blue-900">Zero-Trust Signature Check:</strong> PQC ML-DSA validation flagged an unauthenticated handshake packet from an external terminal lacking proper naval cryptographic credentials.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleAck}
            disabled={acknowledged}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {acknowledged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Acknowledged</span>
              </>
            ) : (
              <span>Acknowledge Alert</span>
            )}
          </button>

          <button
            type="button"
            onClick={handleInvestigate}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Escalate to Forensic Investigation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
