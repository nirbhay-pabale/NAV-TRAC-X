import React, { useState } from 'react';
import {
  X,
  MoreHorizontal,
  UserCheck,
  FileText,
  Fingerprint,
  Search,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Ban,
  Download,
  Eye
} from 'lucide-react';
import type { RecipientRecord } from '../../types/recipient';

interface RecipientDetailsDrawerProps {
  recipient: RecipientRecord | null;
  onClose: () => void;
  onOpenWatermarkDemo: (recipient: RecipientRecord) => void;
  onActionRequest: (actionType: 'suspend' | 'revoke' | 'export' | 'rotateKey', recipient: RecipientRecord) => void;
}

export const RecipientDetailsDrawer: React.FC<RecipientDetailsDrawerProps> = ({
  recipient,
  onClose,
  onOpenWatermarkDemo,
  onActionRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'decryptions' | 'access-log'>('overview');
  const [showDrawerMenu, setShowDrawerMenu] = useState(false);

  if (!recipient) return null;

  return (
    <div className="rounded-xl bg-white border border-[#E6EAF2] overflow-hidden shadow-xl flex flex-col h-full animate-fadeIn select-none font-sans text-[#0F172A]">
      {/* Drawer Top Header */}
      <div className="p-4 border-b border-[#E6EAF2] bg-white">
        <div className="flex items-center justify-between pb-3">
          <span className="text-[11px] font-bold text-[#64748B] font-mono tracking-widest uppercase">
            Recipient Details
          </span>
          <div className="flex items-center gap-1.5 relative">
            <button
              type="button"
              onClick={() => setShowDrawerMenu(!showDrawerMenu)}
              className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#CBD5E1] text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              title="Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-[#F8FAFC] hover:bg-red-50 border border-[#CBD5E1] text-slate-600 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Overflow menu */}
            {showDrawerMenu && (
              <div className="absolute right-0 top-8 w-48 rounded-xl bg-white border border-[#E2E8F0] shadow-xl p-1.5 z-50 text-left text-xs font-sans">
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawerMenu(false);
                    onActionRequest('suspend', recipient);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] text-amber-700 hover:bg-amber-50 cursor-pointer font-medium"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Suspend Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawerMenu(false);
                    onActionRequest('revoke', recipient);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Revoke Access</span>
                </button>
                <div className="h-[1px] bg-[#E2E8F0] my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setShowDrawerMenu(false);
                    onActionRequest('export', recipient);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11.5px] text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Recipient Data</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recipient Profile Banner */}
        <div className="flex items-center gap-3.5 pt-1">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-2xs border ${
              recipient.avatarColor || 'bg-blue-100 text-blue-800 border-blue-200'
            }`}
          >
            {recipient.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-[#0F172A] font-['Montserrat'] tracking-wide truncate">
                {recipient.name}, IN
              </h2>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                recipient.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : recipient.status === 'Restricted'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  recipient.status === 'Active' ? 'bg-emerald-500' : recipient.status === 'Restricted' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
                {recipient.status}
              </span>
            </div>
            <div className="text-xs text-[#475569] font-medium mt-0.5">
              {recipient.rank} <span className="text-slate-300 font-mono">|</span> PNo: <span className="font-mono text-blue-600 font-semibold">{recipient.pno}</span>
            </div>
            <div className="text-[11px] text-[#64748B] truncate mt-0.5">
              Unit: {recipient.unitVessel} — {recipient.fleet}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center border-b border-[#E6EAF2] bg-[#F8FAFC] px-4 gap-4 text-xs font-semibold font-['Montserrat']">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`py-2.5 relative transition-colors cursor-pointer ${
            activeTab === 'overview'
              ? 'text-blue-600 font-bold border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          className={`py-2.5 relative transition-colors cursor-pointer ${
            activeTab === 'documents'
              ? 'text-blue-600 font-bold border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Documents ({recipient.documentsCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('decryptions')}
          className={`py-2.5 relative transition-colors cursor-pointer ${
            activeTab === 'decryptions'
              ? 'text-blue-600 font-bold border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Decryption Events (5)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('access-log')}
          className={`py-2.5 relative transition-colors cursor-pointer ${
            activeTab === 'access-log'
              ? 'text-blue-600 font-bold border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Access Log
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 max-h-[640px] bg-white">
        {activeTab === 'overview' && (
          <>
            {/* 1. Identity Information Card */}
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#0F172A] font-['Montserrat']">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Identity Information</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Service PNo</span>
                  <span className="font-mono text-[#0F172A] font-bold">{recipient.pno}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Service Network</span>
                  <span className="font-mono text-slate-800">{recipient.serviceNetworkStation.split('/')[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Rank</span>
                  <span className="text-[#0F172A] font-medium">{recipient.rank}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Station</span>
                  <span className="text-slate-800">{recipient.serviceNetworkStation.split('/')[1] || recipient.fleet}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Unit / Vessel</span>
                  <span className="text-[#0F172A] font-medium">{recipient.unitVessel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">PQC Token</span>
                  <span className="text-emerald-700 font-mono text-[11px] font-semibold">{recipient.pqcTokenStatus}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">Clearance Level</span>
                  <span className="text-amber-700 font-mono text-[11px] font-bold">{recipient.clearanceLevel}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-mono block">ML-DSA-65 Signature</span>
                  <span className="text-emerald-700 font-mono text-[11px] font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Recent Documents Card */}
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] font-['Montserrat']">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Recent Documents</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('documents')}
                  className="text-[10.5px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 text-[9.5px] font-mono text-[#64748B] uppercase">
                      <th className="py-1.5 px-2">DOCUMENT NAME</th>
                      <th className="py-1.5 px-2 font-mono">DECRYPTIVE ID</th>
                      <th className="py-1.5 px-2">ACCESS TYPE</th>
                      <th className="py-1.5 px-2">STATUS</th>
                      <th className="py-1.5 px-2 text-right">ACCESSED (Z)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recipient.recentDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-white transition-colors">
                        <td className="py-2 px-2 text-[#0F172A] font-medium flex items-center gap-1.5 truncate max-w-[120px]">
                          <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{doc.documentName}</span>
                        </td>
                        <td className="py-2 px-2 font-mono text-blue-600 text-[10px] font-semibold">
                          {doc.decryptionId}
                        </td>
                        <td className="py-2 px-2 text-slate-700 text-[10px]">
                          {doc.accessType}
                        </td>
                        <td className="py-2 px-2">
                          <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-700 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {doc.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right font-mono text-slate-500 text-[10px]">
                          {doc.accessedZ}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Dynamic Forensic Watermark Card */}
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] font-['Montserrat']">
                  <Fingerprint className="w-4 h-4 text-blue-600" />
                  <span>Dynamic Forensic Watermark</span>
                  <span className="text-[10px] text-slate-500 font-normal">(Invisible Decryption-Time)</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWatermarkDemo(recipient)}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-[10.5px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Search className="w-3 h-3" />
                  <span>Visualize (Demo)</span>
                </button>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-[#E2E8F0]">
                  <div>
                    <span className="text-[9.5px] text-[#64748B] font-mono block">Decryptive ID</span>
                    <span className="font-mono text-blue-600 font-bold">{recipient.forensicWatermark.decryptionId}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] font-mono block">Embedding Method</span>
                    <span className="text-slate-800 text-[10.5px] font-medium">{recipient.forensicWatermark.embeddingMethod}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] font-mono block">Generated At</span>
                    <span className="font-mono text-slate-700 text-[10.5px]">{recipient.forensicWatermark.generatedAt}</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-[#64748B] font-mono block">Error-Correction</span>
                    <span className="font-mono text-emerald-700 text-[10.5px] font-semibold">{recipient.forensicWatermark.errorCorrection}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5">
                  <div className="flex items-center justify-between text-[10.5px]">
                    <span className="text-[#64748B] font-mono">On-Chain Receipt</span>
                    <a
                      href="#ledger"
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className="font-mono text-blue-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {recipient.forensicWatermark.onChainReceiptBlock} ({recipient.forensicWatermark.onChainReceiptHash})
                    </a>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-100 pt-1">
                    <span>Payload (Hashed):</span>
                    <span className="text-slate-800 truncate max-w-[210px] font-medium">
                      TxHash: {recipient.forensicWatermark.payloadHashed.txHash} Nonce: {recipient.forensicWatermark.payloadHashed.nonce} PNo: {recipient.forensicWatermark.payloadHashed.pno}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Full Documents List */}
        {activeTab === 'documents' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] font-['Montserrat']">
                Authorized Documents ({recipient.documentsCount})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">PKI Clearance L4</span>
            </div>

            <div className="space-y-2">
              {recipient.recentDocuments.map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-blue-300 transition-colors flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-[#0F172A] font-['Montserrat']">{doc.documentName}</div>
                      <div className="text-[10px] font-mono text-slate-500">
                        Decryption ID: <span className="text-blue-600 font-semibold">{doc.decryptionId}</span> | Access: <span className="text-slate-700">{doc.accessType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenWatermarkDemo(recipient)}
                      className="px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-blue-700 text-[10.5px] font-semibold border border-blue-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      Inspect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Decryption Events */}
        {activeTab === 'decryptions' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] font-['Montserrat']">
                Decryption Audit Chain (Last 5 Sessions)
              </span>
              <span className="text-[10px] text-emerald-700 font-mono font-semibold">● Zero-Knowledge Proofs Verified</span>
            </div>

            <div className="space-y-2 font-mono text-[11px]">
              {[
                { time: '27 Sep 2026 04:54:12Z', id: 'DID-7A3F-2901', doc: 'Operation_Alpha.pdf', ip: '10.142.12.89 (INS Visakhapatnam CIC)', status: 'Success' },
                { time: '26 Sep 2026 11:12:05Z', id: 'DID-901C-8F2B', doc: 'Intel_Threat_Assessment.pdf', ip: '10.142.12.89 (INS Visakhapatnam CIC)', status: 'Success' },
                { time: '25 Sep 2026 08:33:41Z', id: 'DID-3C7E-6A10', doc: 'Mission_Plan_Bravo.pdf', ip: '10.142.12.89 (INS Visakhapatnam CIC)', status: 'Success' },
                { time: '24 Sep 2026 19:20:19Z', id: 'DID-1102-8FA1', doc: 'Tactical_Grid_Delta.pdf', ip: '10.142.12.89 (INS Visakhapatnam CIC)', status: 'Success' },
                { time: '23 Sep 2026 14:02:50Z', id: 'DID-99AF-3321', doc: 'Fleet_Movement_Order.pdf', ip: '10.142.12.89 (INS Visakhapatnam CIC)', status: 'Success' },
              ].map((ev, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-800">
                    <span className="text-blue-600 font-bold">{ev.id}</span>
                    <span className="text-[10px] text-slate-500">{ev.time}</span>
                  </div>
                  <div className="text-[10.5px] text-[#0F172A] font-semibold">{ev.doc}</div>
                  <div className="flex items-center justify-between text-[9.5px] text-slate-500">
                    <span>Node: {ev.ip}</span>
                    <span className="text-emerald-700 font-semibold">● {ev.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Access Log */}
        {activeTab === 'access-log' && (
          <div className="space-y-3 animate-fadeIn text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F172A] font-['Montserrat']">
                On-Chain Merkle Ledger Entries
              </span>
              <button
                type="button"
                onClick={() => onActionRequest('export', recipient)}
                className="text-[10.5px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Download className="w-3 h-3" />
                Export Ledger
              </button>
            </div>

            <div className="space-y-2 font-mono text-[10.5px]">
              {[
                { block: '#4,192', hash: '0x7a3f8921e...889a', event: 'RECIPIENT_DECRYPT_EVENT', verified: 'ML-DSA-65 Valid' },
                { block: '#4,188', hash: '0x33bca1120...55f1', event: 'POLICY_EVALUATION_PASS', verified: 'EMCON Normal' },
                { block: '#4,175', hash: '0x991afc220...11e3', event: 'KEY_EXCHANGE_KYBER768', verified: 'PQC Authenticated' },
              ].map((log, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-between shadow-2xs">
                  <div>
                    <div className="text-blue-600 font-bold">{log.block} — {log.event}</div>
                    <div className="text-[9.5px] text-slate-500">{log.hash}</div>
                  </div>
                  <div className="text-emerald-700 text-[10px] font-semibold">
                    {log.verified}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
