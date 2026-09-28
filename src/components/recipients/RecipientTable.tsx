import React, { useState } from 'react';
import { FileText, Link2, MoreHorizontal, ChevronLeft, ChevronRight, ShieldAlert, Ban, Download, RefreshCw } from 'lucide-react';
import type { RecipientRecord } from '../../types/recipient';

interface RecipientTableProps {
  recipients: RecipientRecord[];
  selectedRecipientId: string | null;
  onSelectRecipient: (recipient: RecipientRecord) => void;
  onOpenDocuments: (recipient: RecipientRecord) => void;
  onOpenChain: (recipient: RecipientRecord) => void;
  onActionRequest: (actionType: 'suspend' | 'revoke' | 'export' | 'rotateKey', recipient: RecipientRecord) => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const RecipientTable: React.FC<RecipientTableProps> = ({
  recipients,
  selectedRecipientId,
  onSelectRecipient,
  onOpenDocuments,
  onOpenChain,
  onActionRequest,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>(['REC-001']);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const toggleSelectAll = () => {
    if (selectedRowIds.length === recipients.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(recipients.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((rowId) => rowId !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  const getStatusBadge = (status: RecipientRecord['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Restricted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Restricted
          </span>
        );
      case 'Revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Revoked
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Scrollable Table Area */}
      <div className="overflow-x-auto min-h-[460px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedRowIds.length === recipients.length && recipients.length > 0}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-3">RECIPIENT</th>
              <th className="py-3 px-3">RANK / DESIGNATION</th>
              <th className="py-3 px-3">UNIT / VESSEL</th>
              <th className="py-3 px-3 text-center">DOCUMENTS</th>
              <th className="py-3 px-3 font-mono">DECRYPTIVE ID</th>
              <th className="py-3 px-3">STATUS</th>
              <th className="py-3 px-3 text-center">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {recipients.map((recipient) => {
              const isSelected = selectedRecipientId === recipient.id;
              const isChecked = selectedRowIds.includes(recipient.id);

              return (
                <tr
                  key={recipient.id}
                  onClick={() => onSelectRecipient(recipient)}
                  className={`cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-50/70 border-l-[3px] border-l-[#2563EB]'
                      : 'hover:bg-slate-50/70 border-l-[3px] border-l-transparent'
                  }`}
                >
                  {/* Checkbox */}
                  <td className="py-3 px-3.5 text-center" onClick={(e) => toggleSelectRow(recipient.id, e)}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Recipient */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-200">
                        {recipient.initials}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 truncate">
                          {recipient.name}
                        </div>
                        <div className="text-[10.5px] font-mono text-slate-500">
                          {recipient.pno}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Rank */}
                  <td className="py-3 px-3 text-slate-700 font-medium">
                    {recipient.rank}
                  </td>

                  {/* Unit / Vessel */}
                  <td className="py-3 px-3">
                    <span className="text-slate-800 font-semibold">{recipient.unitVessel}</span>
                    <span className="text-[10px] block text-slate-400">{recipient.serviceNetworkStation}</span>
                  </td>

                  {/* Documents count */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDocuments(recipient);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-mono text-[11px] font-semibold transition-colors"
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span>{recipient.documentsCount} Active</span>
                    </button>
                  </td>

                  {/* Decryptive ID */}
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenChain(recipient);
                      }}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-700 hover:text-blue-600 transition-colors"
                      title="Inspect Decryption Event Chain"
                    >
                      <span className="font-semibold text-slate-900">{recipient.latestDecryptionId}</span>
                      <Link2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-3">
                    {getStatusBadge(recipient.status)}
                  </td>

                  {/* Action Menu */}
                  <td className="py-3 px-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === recipient.id ? null : recipient.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="More Actions"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {/* Popover Actions Menu */}
                    {activeMenuId === recipient.id && (
                      <div className="absolute right-3 top-10 w-44 rounded-xl bg-white border border-slate-200 shadow-xl z-30 p-1 space-y-0.5 text-xs animate-fadeIn">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onActionRequest('suspend', recipient);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-amber-700 flex items-center gap-2 font-medium"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Suspend Access</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onActionRequest('revoke', recipient);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-red-50 text-red-700 flex items-center gap-2 font-medium"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Revoke Key</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onActionRequest('rotateKey', recipient);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 text-blue-700 flex items-center gap-2 font-medium"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Rotate Key</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onActionRequest('export', recipient);
                          }}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-slate-700 flex items-center gap-2 font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export Ledger Proof</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-100 bg-white flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing <strong className="text-slate-900">{recipients.length}</strong> of{' '}
          <strong className="text-slate-900">{totalCount}</strong> recipients
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipientTable;
