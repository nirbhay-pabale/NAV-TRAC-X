import React, { useState } from 'react';
import {
  Key,
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  HardDrive
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyKeyInfo, useReportLostKey } from '../../hooks/useMyKeys';

export const MyKeysPage: React.FC = () => {
  const { user } = useAuth();
  const { data: keyInfo, isLoading } = useMyKeyInfo();
  const reportLostKeyMutation = useReportLostKey();

  const [isLostKeyModalOpen, setIsLostKeyModalOpen] = useState(false);
  const [lostKeyReason, setLostKeyReason] = useState('');
  const [lostKeyConfirmChecked, setLostKeyConfirmChecked] = useState(false);

  const handleReportLostKey = async () => {
    if (!keyInfo || !lostKeyConfirmChecked) return;

    await reportLostKeyMutation.mutateAsync({
      keyId: keyInfo.keyId,
      reason: lostKeyReason || 'Reported lost/stolen hardware token by officer',
      officerName: user?.name || 'Officer',
    });

    setIsLostKeyModalOpen(false);
    setLostKeyReason('');
    setLostKeyConfirmChecked(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          My Cryptographic Keys & Hardware
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Post-Quantum ML-KEM-768 & ML-DSA-65 public credentials bound to your certified naval terminal
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          Loading cryptographic key records…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── LEFT: ACTIVE KEY STATUS CARD (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Primary Key Status Box */}
            <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                      Active Operational Key
                    </h2>
                    <span className="text-[11px] text-[#64748B]">
                      Post-Quantum FIPS 203/204 Standard
                    </span>
                  </div>
                </div>

                <span className={keyInfo?.status === 'Active' ? 'pill-green' : 'pill-red'}>
                  {keyInfo?.status || 'Active'}
                </span>
              </div>

              {/* Key Details Grid */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Public Key Fingerprint (ML-KEM-768)
                  </span>
                  <span className="font-bold text-slate-900 break-all text-xs">
                    {keyInfo?.keyId || '0xKEM-768: 33BB:7711:00AA:55FF'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Encapsulation Algorithm
                    </span>
                    <span className="font-semibold text-slate-800 text-[11.5px]">
                      {keyInfo?.kemAlgorithm}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Digital Signature Algorithm
                    </span>
                    <span className="font-semibold text-slate-800 text-[11.5px]">
                      {keyInfo?.dsaAlgorithm}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <span className="text-slate-500 text-[11px]">Valid Until:</span>
                  <span className="font-bold text-slate-900">{keyInfo?.validUntil}</span>
                </div>
              </div>

              {/* Security Policy Reminder */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Private key material resides exclusively within hardware memory isolated enclaves and is never transmitted over network links.
                </span>
              </div>

              {/* Emergency Action */}
              <div className="pt-3 border-t border-[#E6EAF2]">
                <button
                  type="button"
                  onClick={() => setIsLostKeyModalOpen(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold font-['Montserrat'] border border-red-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-red-600" />
                  <span>Report Lost Device / Key (Emergency Blacklist)</span>
                </button>
              </div>
            </div>

            {/* Key History Table */}
            <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#E6EAF2]">
                <RotateCw className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                  Key Rotation History
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold text-[#64748B] uppercase font-mono border-b border-[#E6EAF2]">
                      <th className="py-2">Date</th>
                      <th className="py-2">Event Action</th>
                      <th className="py-2">Reason</th>
                      <th className="py-2 text-right">Authorized By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EAF2]">
                    {keyInfo?.keyHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-2.5 font-mono text-[11px] text-slate-600">{item.rotatedOn}</td>
                        <td className="py-2.5 font-semibold text-slate-800">{item.action}</td>
                        <td className="py-2.5 text-slate-600 text-[11px]">{item.reason}</td>
                        <td className="py-2.5 text-right text-slate-500 font-mono text-[11px]">{item.actor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ── RIGHT: REGISTERED DEVICES (5 COLS) ── */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E6EAF2]">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
                    Registered Hardware Device
                  </h3>
                </div>
                <span className="pill-green">Verified</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Device ID:</span>
                  <span className="font-bold text-slate-900">{keyInfo?.registeredDevice.id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Device Name:</span>
                  <span className="font-semibold text-slate-800">{keyInfo?.registeredDevice.name}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Hardware Type:</span>
                  <span className="text-slate-700">{keyInfo?.registeredDevice.type}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">MAC / Node:</span>
                  <span className="text-slate-700">{keyInfo?.registeredDevice.macAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Attestation:</span>
                  <span className="text-slate-700">{keyInfo?.registeredDevice.lastAttestation}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
                <strong>Terminal Binding Notice:</strong> Decryption sessions are bound by hardware PUF (Physically Unclonable Function) to this console node.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ── LOST DEVICE / KEY CONFIRMATION MODAL ── */}
      {isLostKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-['Montserrat']">
                  Confirm Key & Device Revocation
                </h3>
                <p className="text-xs text-red-600 font-semibold font-mono">
                  CRITICAL DEFENSE ACTION • IMMEDIATE BLACKLIST
                </p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 leading-relaxed">
              Reporting this hardware token or key as lost will immediately revoke its cryptographic clearance across all Naval Task Force nodes. All active ephemeral sessions will terminate instantly.
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-[10.5px] font-bold text-slate-600 uppercase font-mono block">
                Incident Description / Circumstances:
              </label>
              <textarea
                rows={2}
                value={lostKeyReason}
                onChange={(e) => setLostKeyReason(e.target.value)}
                placeholder="Describe when and where the device was misplaced..."
                className="w-full p-2 border border-slate-300 rounded-lg text-xs resize-none"
              />
            </div>

            <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={lostKeyConfirmChecked}
                onChange={(e) => setLostKeyConfirmChecked(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-red-600 focus:ring-red-500"
              />
              <span className="font-semibold">
                I understand that this action is irreversible and immediately notifies the Naval Security Operations Center.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsLostKeyModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!lostKeyConfirmChecked || reportLostKeyMutation.isPending}
                onClick={handleReportLostKey}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold font-['Montserrat'] disabled:opacity-50 cursor-pointer"
              >
                {reportLostKeyMutation.isPending ? 'Revoking…' : 'Revoke Key Immediately'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
