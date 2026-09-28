import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  ExternalLink,
  Laptop,
  AlertTriangle,
  Clock,
  FileText
} from 'lucide-react';
import { useAccessDeniedLog } from '../../hooks/useAuthorizationData';
import type { AccessDeniedEntry } from '../../types/authorization';

export const AccessDeniedLogTab: React.FC = () => {
  const navigate = useNavigate();

  const [reasonFilter, setReasonFilter] = useState<string>('All Reasons');
  const [documentFilter, setDocumentFilter] = useState<string>('All Documents');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: logs = [], isLoading } = useAccessDeniedLog({
    reason: reasonFilter,
    documentId: documentFilter,
  });

  const filteredLogs = logs.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.requester.toLowerCase().includes(q) ||
      item.deviceId.toLowerCase().includes(q) ||
      item.documentName.toLowerCase().includes(q) ||
      item.terminalNode.toLowerCase().includes(q) ||
      item.reasonForDenial.toLowerCase().includes(q)
    );
  });

  const handleFlagSuspicious = (entry: AccessDeniedEntry) => {
    // Escalates to investigations new page pre-loaded with incident context
    navigate('/investigations/new', {
      state: {
        prefillEvidence: {
          source: 'Access Denied Log Anomaly',
          requester: entry.requester,
          deviceId: entry.deviceId,
          document: entry.documentName,
          reason: entry.reasonForDenial,
          timestamp: `${entry.timeZ}Z / ${entry.timeLocal}`,
        },
      },
    });
  };

  const getReasonBadge = (reason: string) => {
    switch (reason) {
      case 'EMCON Restriction':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Revoked PKI':
      case 'Not Authorized':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Expired Certificate':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Filter Bar */}
      <div className="bg-white border border-[#E6EAF2] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-sm">
        {/* Left: Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by terminal, officer, or document..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 font-sans"
          />
        </div>

        {/* Right: Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Reason Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Reason:</span>
            <select
              value={reasonFilter}
              onChange={(e) => setReasonFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
            >
              <option value="All Reasons">All Reasons</option>
              <option value="EMCON Restriction">EMCON Restriction</option>
              <option value="Not Authorized">Not Authorized</option>
              <option value="Expired Certificate">Expired Certificate</option>
              <option value="Revoked PKI">Revoked PKI</option>
              <option value="Security Policy Mismatch">Security Policy Mismatch</option>
            </select>
          </div>

          {/* Document Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">Document:</span>
            <select
              value={documentFilter}
              onChange={(e) => setDocumentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
            >
              <option value="All Documents">All Documents</option>
              <option value="NAV-DOC-2026-0042">Mission_Plan_Bravo.pdf</option>
              <option value="NAV-DOC-2026-0029">Tactical_Satcom_Frequency_Allocation.docx</option>
              <option value="NAV-DOC-2026-0055">Submarine_Acoustic_Signature_Profile.pdf</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
          <span>
            Every rejected cryptographic decryption event is immutably logged and correlated across naval nodes.
          </span>
        </div>
        <span className="text-[11px] font-mono text-blue-700">
          Showing <strong>{filteredLogs.length}</strong> security events
        </span>
      </div>

      {/* Access Denied Table */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-500 text-xs font-mono animate-pulse">
          Loading access denial security logs...
        </div>
      ) : (
        <div className="bg-white border border-[#E6EAF2] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="p-3.5">TIME (Z / IST)</th>
                  <th className="p-3.5">REQUESTER / TERMINAL ID</th>
                  <th className="p-3.5">ATTEMPTED DOCUMENT</th>
                  <th className="p-3.5">DENIAL REASON</th>
                  <th className="p-3.5">SECURITY ALERT</th>
                  <th className="p-3.5 text-right">INVESTIGATION ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{entry.timeZ}Z</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{entry.timeLocal}</div>
                    </td>

                    {/* Requester / Device */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#0F172A] flex items-center gap-1.5">
                        <Laptop className="w-3.5 h-3.5 text-blue-600" />
                        <span>{entry.requester}</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {entry.rank} • {entry.unit}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Node: {entry.deviceId} ({entry.ipAddress})
                      </div>
                    </td>

                    {/* Document */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[220px]">{entry.documentName}</span>
                      </div>
                      <div className="text-[10px] font-mono text-blue-600">{entry.documentId}</div>
                    </td>

                    {/* Reason */}
                    <td className="p-3.5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold border ${getReasonBadge(
                          entry.reasonForDenial
                        )}`}
                      >
                        {entry.reasonForDenial}
                      </span>
                    </td>

                    {/* Alert Fired */}
                    <td className="p-3.5 font-mono">
                      {entry.alertFired ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>ALERT FIRED</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-[10px]">
                          <span>Logged</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleFlagSuspicious(entry)}
                        className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-1.5 ml-auto transition-all cursor-pointer"
                        title="Escalate incident to Forensic Leak Investigation"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Flag as Suspicious</span>
                        <ExternalLink className="w-3 h-3 text-red-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
