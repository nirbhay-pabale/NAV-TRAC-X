import React, { useState } from 'react';
import {
  Eye,
  Download,
  Printer,
  Edit3,
  Shield,
  ChevronDown,
  ChevronUp,
  Calendar,
  Send,
  Loader2,
  Info
} from 'lucide-react';
import type { AccessType, AdvancedRestrictions } from '../../types/distribution';

interface AccessPermissionsStepProps {
  accessType: AccessType;
  onAccessTypeChange: (type: AccessType) => void;
  restrictions: AdvancedRestrictions;
  onToggleRestriction: (key: keyof AdvancedRestrictions) => void;
  validityPreset: string;
  onValidityPresetChange: (preset: string) => void;
  dateRangeText: string;
  accessReason: string;
  onAccessReasonChange: (reason: string) => void;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const AccessPermissionsStep: React.FC<AccessPermissionsStepProps> = ({
  accessType,
  onAccessTypeChange,
  restrictions,
  onToggleRestriction,
  validityPreset,
  onValidityPresetChange,
  dateRangeText,
  accessReason,
  onAccessReasonChange,
  canSubmit,
  isSubmitting,
  onSubmit
}) => {
  const [advancedExpanded, setAdvancedExpanded] = useState(true);

  const accessOptions: { id: AccessType; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'view', title: 'View Only', desc: 'Read only, no downloads', icon: Eye },
    { id: 'download', title: 'Download', desc: 'Allow download', icon: Download },
    { id: 'print', title: 'Print', desc: 'Allow printing', icon: Printer },
    { id: 'edit', title: 'Edit', desc: 'Allow editing', icon: Edit3 },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-full shadow-sm">
      <div>
        {/* Step Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-blue-200">
            3
          </div>
          <div>
            <h3 className="text-xs font-bold tracking-wider text-[#0F172A] uppercase">
              ACCESS & PERMISSIONS
            </h3>
            <p className="text-[11px] text-slate-500">
              Define how recipients can access and use the document
            </p>
          </div>
        </div>

        {/* Access Type Cards */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Access Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {accessOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = accessType === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onAccessTypeChange(opt.id)}
                  className={`p-2.5 rounded-lg border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#2563EB] text-[#2563EB] ring-1 ring-blue-500 shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                >
                  <Icon
                    className={`w-4 h-4 mb-1 ${
                      isSelected ? 'text-[#2563EB]' : 'text-slate-500'
                    }`}
                  />
                  <span
                    className={`text-xs font-bold block ${
                      isSelected ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {opt.title}
                  </span>
                  <span className="text-[9.5px] text-slate-500 block mt-0.5 leading-tight">
                    {opt.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Advanced Restrictions */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/50 mb-4 overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvancedExpanded(!advancedExpanded)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs font-bold text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Advanced Restrictions & Cryptographic Marking</span>
            </div>
            {advancedExpanded ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {advancedExpanded && (
            <div className="p-3.5 pt-1 space-y-3 text-xs border-t border-slate-200 bg-white">
              {/* Toggle 1: Invisible Forensic Marking */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 font-medium text-[11.5px]">
                    Invisible Forensic Marking - Unique per recipient, per session
                  </span>
                  <div className="group relative cursor-help">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-white rounded-lg text-[10px] shadow-xl z-50">
                      Cryptographic forensic mark embedded on server at decryption time. Invisible on recipient display.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleRestriction('dynamicWatermarking')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ml-2 ${
                    restrictions.dynamicWatermarking ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle invisible forensic marking"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      restrictions.dynamicWatermarking ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 2: Screen Capture Protection */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 font-medium text-[11.5px]">Screen Capture Protection</span>
                  <div className="group relative cursor-help">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white rounded-lg text-[10px] shadow-xl z-50">
                      Block screenshots, recording tools, and external capture cards.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleRestriction('screenCaptureProtection')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    restrictions.screenCaptureProtection ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle screen capture protection"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      restrictions.screenCaptureProtection ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Toggle 3: Device Binding */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-800 font-medium text-[11.5px]">Device Binding</span>
                  <div className="group relative cursor-help">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-slate-900 text-white rounded-lg text-[10px] shadow-xl z-50">
                      Allow access only on registered naval HSM hardware terminals.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleRestriction('deviceBinding')}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    restrictions.deviceBinding ? 'bg-[#2563EB]' : 'bg-slate-300'
                  }`}
                  aria-label="Toggle device binding"
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      restrictions.deviceBinding ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Access Validity Dropdown & Date Range */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Access Validity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  <div className="sm:col-span-5 relative">
                    <select
                      value={validityPreset}
                      onChange={(e) => onValidityPresetChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div className="sm:col-span-7 flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-mono">
                    <span>{dateRangeText}</span>
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Access Reason (Mandatory) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700">
              Access Reason (Mandatory)
            </label>
            <span className="text-[10px] font-mono text-slate-400">
              {accessReason.length}/200
            </span>
          </div>
          <textarea
            value={accessReason}
            onChange={(e) => onAccessReasonChange(e.target.value.slice(0, 200))}
            placeholder="State the operational justification for cryptographic distribution…"
            rows={2}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 resize-none font-normal"
            required
          />
        </div>
      </div>

      {/* Primary Distribute Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full h-10 rounded-lg text-white font-bold text-xs uppercase flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-[#0F5257] hover:bg-[#0b3e42] cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sealing & Distributing…</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 fill-current" />
              <span>Distribute Document</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AccessPermissionsStep;
