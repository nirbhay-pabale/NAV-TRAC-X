import React, { useState } from 'react';
import {
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ArrowUp
} from 'lucide-react';
import { useLedgerBlocks } from '../../hooks/useLedgerData';

interface BlockExplorerProps {
  initialBlockId?: string;
}

export const BlockExplorer: React.FC<BlockExplorerProps> = ({ initialBlockId }) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialBlockId || '');
  const { data: blocks, isLoading } = useLedgerBlocks(searchQuery);

  const [expandedBlocks, setExpandedBlocks] = useState<Record<number, boolean>>({
    4192: true, // Expand top block by default
  });

  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const toggleExpand = (blockNum: number) => {
    setExpandedBlocks((prev) => ({ ...prev, [blockNum]: !prev[blockNum] }));
  };

  const copyToClipboard = (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 1500);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search Bar */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Merkle Root Hash, Event ID, or Document name..."
            className="w-full bg-slate-50/70 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong className="text-slate-900">{blocks?.length || 0}</strong> sealed blocks
        </div>
      </div>

      {/* Block Sequence Flow */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-mono">
          Querying PBFT Merkle DAG sequence…
        </div>
      ) : (
        <div className="space-y-4">
          {blocks?.map((block, idx) => {
            const isExpanded = !!expandedBlocks[block.blockNumber];
            const isTampered = !!block.isTampered;
            const hasPrevious = idx < (blocks.length - 1);

            return (
              <div key={block.blockNumber} className="relative">
                {/* Visual Cryptographic Link Connecting Line */}
                {hasPrevious && (
                  <div className="absolute -bottom-4 left-8 w-0.5 h-4 bg-slate-300 z-0 pointer-events-none" />
                )}

                {/* Block Card */}
                <div
                  className={`rounded-xl border transition-all p-5 shadow-sm relative z-10 ${
                    isTampered
                      ? 'bg-red-50/70 border-red-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Block Header Row */}
                  <div
                    onClick={() => toggleExpand(block.blockNumber)}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                          isTampered
                            ? 'bg-red-600 text-white'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        #{block.blockNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-[#0F172A]">
                            Block #{block.blockNumber}
                          </h3>
                          {isTampered ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                              Tampered Digest Mismatch
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Sealed & Attested
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {block.timestamp} • {block.eventCount} Events • Validator: {block.validatingNode}
                        </p>
                      </div>
                    </div>

                    {/* Hashes Summary */}
                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block uppercase">Merkle Root</span>
                        <div className="flex items-center gap-1">
                          <span className={`font-semibold ${isTampered ? 'text-red-700' : 'text-slate-800'}`}>
                            {block.merkleRootHash.slice(0, 16)}...
                          </span>
                          <button
                            type="button"
                            onClick={(e) => copyToClipboard(e, block.merkleRootHash)}
                            className="p-1 text-slate-400 hover:text-slate-700"
                            title="Copy Merkle Root"
                          >
                            {copiedHash === block.merkleRootHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Block Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fadeIn text-xs">
                      {/* Previous Block Reference */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-slate-500">Previous Hash:</span>
                          <span className="text-slate-800 font-semibold">{block.previousBlockHash}</span>
                        </div>
                        <span className="text-[10.5px] text-slate-500">SHA3-256 Link</span>
                      </div>

                      {/* Transactions Table inside Block */}
                      <div className="rounded-lg border border-slate-200 overflow-hidden bg-white">
                        <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                          Transactions & Decryption Events ({block.events?.length || 0})
                        </div>
                        <div className="divide-y divide-slate-100 font-mono">
                          {block.events?.map((tx) => (
                            <div key={tx.eventId} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900">{tx.eventId}</span>
                                  <span className="text-slate-400">•</span>
                                  <span className="text-slate-700 font-sans font-medium">{tx.accessType}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                                    {tx.recipientPseudonym}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-slate-500 font-sans mt-0.5">
                                  Document: {tx.documentName} • Nonce: <span className="font-mono">{tx.nonce}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                                  {tx.signatureStatus}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlockExplorer;
