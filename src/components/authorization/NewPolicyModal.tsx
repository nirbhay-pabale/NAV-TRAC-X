import React, { useState } from 'react';
import {
  X,
  Shield,
  Eye,
  Download,
  Printer,
  FileCheck,
  CheckCircle2,
  Calendar,
  Lock,
  Loader2
} from 'lucide-react';
import { useCreatePolicy } from '../../hooks/useAuthorizationData';
import type { PolicyScopeType } from '../../types/authorization';

interface NewPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewPolicyModal: React.FC<NewPolicyModalProps> = ({ isOpen, onClose }) => {
  const createPolicyMutation = useCreatePolicy();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeType, setScopeType] = useState<PolicyScopeType>('ROLE');
  const [appliesTo, setAppliesTo] = useState('');
  const [classificationScope, setClassificationScope] = useState<
    'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)'
  >('SECRET');
  const [allowedAccessTypes, setAllowedAccessTypes] = useState<('View' | 'Download' | 'Print' | 'Export')[]>([
    'View',
    'Download',
  ]);
  const [expiryPreset, setExpiryPreset] = useState('7 Days');
  const [requiresDualCustody, setRequiresDualCustody] = useState(false);

  if (!isOpen) return null;

  const accessCards: { id: 'View' | 'Download' | 'Print' | 'Export'; title: string; desc: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'View', title: 'View Only', desc: 'Read only in-memory viewer', icon: Eye },
    { id: 'Download', title: 'Download', desc: 'Allow encrypted file download', icon: Download },
    { id: 'Print', title: 'Print', desc: 'Allow watermark-printed copy', icon: Printer },
    { id: 'Export', title: 'Export', desc: 'Allow cryptographic export', icon: FileCheck },
  ];

  const toggleAccessType = (type: 'View' | 'Download' | 'Print' | 'Export') => {
    if (allowedAccessTypes.includes(type)) {
      if (allowedAccessTypes.length > 1) {
        setAllowedAccessTypes(allowedAccessTypes.filter((t) => t !== type));
      }
    } else {
      setAllowedAccessTypes([...allowedAccessTypes, type]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !appliesTo) return;

    try {
      await createPolicyMutation.mutateAsync({
        name,
        description: description || 'Zero-Trust Naval Policy Rule',
        scopeType,
        appliesTo,
        classificationScope,
        allowedAccessTypes,
        expiryRule: expiryPreset,
        status: 'Active',
        requiresDualCustody,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create policy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">
                Define New Access Policy
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Cryptographic RBAC Clearance Matrix
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Policy Name & Scope Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Policy Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Western Fleet Tactical Codeword Policy"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Scope Target Type
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as PolicyScopeType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="ROLE">Role-Based (Officers / Pilots / Engineers)</option>
                <option value="UNIT">Unit-Based (Vessel / Air Squadron / Base)</option>
                <option value="CLASSIFICATION">Classification-Level Wide</option>
                <option value="MISSION">Mission / Operation Specific</option>
              </select>
            </div>
          </div>

          {/* Applies To & Classification Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Applies To (Target Identity / Units)
              </label>
              <input
                type="text"
                value={appliesTo}
                onChange={(e) => setAppliesTo(e.target.value)}
                placeholder="e.g. Commanding Officers (CO/XO) • Western Fleet"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Classification Scope
              </label>
              <select
                value={classificationScope}
                onChange={(e) =>
                  setClassificationScope(
                    e.target.value as 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'TOP SECRET (CODEWORD)'
                  )
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
              >
                <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                <option value="SECRET">SECRET</option>
                <option value="TOP SECRET">TOP SECRET</option>
                <option value="TOP SECRET (CODEWORD)">TOP SECRET (CODEWORD)</option>
              </select>
            </div>
          </div>

          {/* 4-Card Allowed Access Types Selector */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-2">
              Allowed Access Types (Select All Granted)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {accessCards.map((card) => {
                const isSelected = allowedAccessTypes.includes(card.id);
                const CardIcon = card.icon;
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleAccessType(card.id)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CardIcon
                      className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`}
                    />
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {card.title}
                    </span>
                    <span className="text-[9.5px] text-slate-500 mt-0.5 leading-tight">
                      {card.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expiry Rule & Dual-Custody HSM Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Default Expiry Rule</span>
              </label>
              <select
                value={expiryPreset}
                onChange={(e) => setExpiryPreset(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="12 Hours from Decryption">12 Hours from Decryption</option>
                <option value="24 Hours from Decryption">24 Hours from Decryption</option>
                <option value="7 Days">7 Days</option>
                <option value="14 Days">14 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="Indefinite (Mission Duration)">Indefinite (Mission Duration)</option>
              </select>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between mt-4 sm:mt-0">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-900 block">Dual-Custody HSM Required</span>
                  <span className="text-[10px] text-slate-500 block">Requires 2 authorized keys for decryption</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={requiresDualCustody}
                onChange={(e) => setRequiresDualCustody(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Policy Description & Security Justification
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="State operational context for this clearance policy..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={createPolicyMutation.isPending || !name || !appliesTo}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {createPolicyMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enforcing Policy...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Create Access Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
