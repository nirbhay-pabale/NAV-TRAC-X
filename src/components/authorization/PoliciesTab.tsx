import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Users,
  Lock,
  Plus,
  Ban,
  FileCheck,
  Eye,
  Download,
  Printer
} from 'lucide-react';
import { usePolicies } from '../../hooks/useAuthorizationData';
import type { AccessPolicy } from '../../types/authorization';
import { RevocationWarningModal } from './RevocationWarningModal';

interface PoliciesTabProps {
  onNewPolicyClick: () => void;
}

export const PoliciesTab: React.FC<PoliciesTabProps> = ({ onNewPolicyClick }) => {
  const { data: policies = [], isLoading } = usePolicies();

  const [revocationTarget, setRevocationTarget] = useState<{ name: string; scope: string } | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleOpenRevoke = (policy: AccessPolicy) => {
    setRevocationTarget({
      name: policy.name,
      scope: policy.appliesTo,
    });
  };

  const handleConfirmRevoke = async (_reason: string) => {
    setIsRevoking(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsRevoking(false);
    setRevocationTarget(null);
  };

  const getClassificationBadge = (classification: string) => {
    if (classification.includes('TOP SECRET')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    if (classification.includes('SECRET')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const renderAccessIcons = (types: ('View' | 'Download' | 'Print' | 'Export')[]) => {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {types.map((t) => {
          if (t === 'View') {
            return (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-mono font-semibold">
                <Eye className="w-3 h-3" /> View
              </span>
            );
          }
          if (t === 'Download') {
            return (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-mono font-semibold">
                <Download className="w-3 h-3" /> Download
              </span>
            );
          }
          if (t === 'Print') {
            return (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10.5px] font-mono font-semibold">
                <Printer className="w-3 h-3" /> Print
              </span>
            );
          }
          return (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-mono font-semibold">
              <FileCheck className="w-3 h-3" /> Export
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Banner with Summary & Action */}
      <div className="bg-white border border-[#E6EAF2] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] font-['Montserrat']">
              Active Access Policy Rules ({policies.length})
            </h3>
            <p className="text-xs text-[#64748B]">
              Cryptographically enforced document distribution and role permissions
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewPolicyClick}
          className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Policy</span>
        </button>
      </div>

      {/* Policies Grid / List */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono animate-pulse">
          Loading active access policies...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => (
            <div
              key={policy.id}
              className="bg-white border border-[#E6EAF2] hover:border-blue-300 rounded-xl p-5 shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      {policy.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${getClassificationBadge(
                        policy.classificationScope
                      )}`}
                    >
                      {policy.classificationScope}
                    </span>
                  </div>

                  {policy.requiresDualCustody && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-700 flex items-center gap-1 font-mono">
                      <Lock className="w-2.5 h-2.5" /> DUAL-CUSTODY
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-[#0F172A] font-['Montserrat'] mb-1">
                  {policy.name}
                </h4>

                <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                  {policy.description}
                </p>

                {/* Applies to & Expiry details */}
                <div className="bg-[#F8FAFC] rounded-lg p-3 border border-[#E2E8F0] space-y-2 text-xs font-mono mb-3">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[#64748B] text-[10px] uppercase">Scope Target:</span>
                    <span className="text-[#0F172A] font-sans font-medium text-right max-w-[240px] truncate">
                      {policy.appliesTo}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-[#64748B] text-[10px] uppercase">Session Expiry:</span>
                    <span className="text-blue-600 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-blue-500" />
                      {policy.expiryRule}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-700 pt-1.5 border-t border-[#E2E8F0]">
                    <span className="text-[#64748B] text-[10px] uppercase">Granted Actions:</span>
                    {renderAccessIcons(policy.allowedAccessTypes)}
                  </div>
                </div>
              </div>

              {/* Card Footer: Active Users & Actions */}
              <div className="pt-3 border-t border-[#E6EAF2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#64748B] font-mono text-[11px]">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>{policy.activeRecipientsCount} cleared recipients</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenRevoke(policy)}
                    className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Revoke clearance authorization for this scope"
                  >
                    <Ban className="w-3 h-3" />
                    <span>Revoke Clearance</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revocation Warning Modal */}
      {revocationTarget && (
        <RevocationWarningModal
          isOpen={!!revocationTarget}
          onClose={() => setRevocationTarget(null)}
          onConfirmRevoke={handleConfirmRevoke}
          targetName={revocationTarget.name}
          targetScope={revocationTarget.scope}
          isRevoking={isRevoking}
        />
      )}
    </div>
  );
};
