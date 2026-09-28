import React from 'react';
import {
  Radio,
  Lock,
  Key,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

export const SecurityGuidelinesPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#E6EAF2] shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
          Security Guidelines & Operating Procedures
        </h1>
        <p className="text-xs text-[#64748B] mt-1">
          Standard operating guidelines for recipient officers handling classified materials under NAV-TRAC X
        </p>
      </div>

      {/* Guidelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Section 1: In-Memory Decryption Rules */}
        <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E6EAF2]">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              1. In-Memory Ephemeral Decryption
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            All document viewing occurs in ephemeral RAM. No decrypted payload is written to persistent hard drives or external solid-state caches.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
            <li>Never attempt to capture or photograph console screens.</li>
            <li>Close active document viewports prior to leaving your workstation.</li>
            <li>The viewer will automatically lock after 5 minutes of inactivity.</li>
          </ul>
        </div>

        {/* Section 2: Post-Quantum Digital Signatures */}
        <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E6EAF2]">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              2. Digital Signature & Provenance
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every decryption event is signed with your hardware-bound ML-DSA-65 key, generating an immutable access receipt.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
            <li>Your signature is permanently logged to the distributed ledger.</li>
            <li>You can review your own access receipts under the Activity tab.</li>
            <li>Signatures cannot be forged or transferred across devices.</li>
          </ul>
        </div>

        {/* Section 3: EMCON Operating Protocols */}
        <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E6EAF2]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Radio className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              3. Emission Control (EMCON)
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            During EMCON Bravo, Charlie, or Delta conditions, local access receipts are encrypted in local secure storage.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
            <li>Receipts will automatically batch synchronize when RF links resume.</li>
            <li>Do not modify terminal network interfaces during EMCON drills.</li>
            <li>Follow the instructions of your vessel's Information Warfare Officer.</li>
          </ul>
        </div>

        {/* Section 4: Incident Reporting */}
        <div className="bg-white rounded-xl border border-[#E6EAF2] shadow-2xs p-5 space-y-3">
          <div className="flex items-center gap-2.5 pb-2.5 border-b border-[#E6EAF2]">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h2 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider font-mono">
              4. Immediate Incident Reporting
            </h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Any suspected token loss, compromised workstation, or unauthorized access prompt must be reported immediately.
          </p>
          <ul className="text-xs text-slate-700 space-y-1.5 list-disc pl-4">
            <li>Use the "Report Lost Device / Key" button on your Keys dashboard.</li>
            <li>Submit confidential reports via the "Report a Concern" tool.</li>
            <li>Contact Western/Eastern Command SOC on internal extension 2200.</li>
          </ul>
        </div>

      </div>

      {/* Classification Card */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span className="text-xs font-mono text-slate-700">
          ALL PERSONNEL ARE SUBJECT TO AUDIT MONITORING UNDER NAVAL DEFENSE COMPUTER SECURITY PROTOCOL 2026.
        </span>
      </div>
    </div>
  );
};
