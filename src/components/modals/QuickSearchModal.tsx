import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  FileText,
  Users,
  Database,
  ShieldAlert,
  X,
  ArrowRight,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { centralStore } from '../../data/centralStore';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const state = centralStore.getState();

  const searchResults = useMemo(() => {
    if (!query || query.trim() === '') {
      return [
        { title: 'NAV-DOC-2026-0042: Mission_Plan_Bravo.pdf', subtitle: 'TOP SECRET (CODEWORD) • Distributed', category: 'Document', icon: FileText, route: '/documents/NAV-DOC-2026-0042' },
        { title: 'Cdr. A. Mehta (04821-K)', subtitle: 'INS Vikramaditya (R33) • Active', category: 'Recipient', icon: Users, route: '/recipients' },
        { title: 'Ledger Block #4192 (Verified)', subtitle: 'Merkle Root: 0x88f21ac0... • 4 Events', category: 'Ledger', icon: Database, route: '/ledger/4192' },
        { title: 'NAVX-0042: Operation Strike Plan Leak', subtitle: 'Verdict: PROVENANCE VERIFIED (99.8%)', category: 'Investigation', icon: ShieldAlert, route: '/investigations/NAVX-0042' },
        { title: 'CAPSULE-2026-0042-REC-01', subtitle: 'Provenance Capsule • ML-DSA-65 Signed', category: 'Provenance Capsule', icon: ShieldCheck, route: '/recipients' },
      ];
    }

    const q = query.toLowerCase();
    const results: any[] = [];

    // Documents
    state.documents.forEach((d) => {
      if (
        d.id.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.masterDocId.toLowerCase().includes(q)
      ) {
        results.push({
          title: `${d.id}: ${d.name}`,
          subtitle: `${d.classification} • ${d.status}`,
          category: 'Document',
          icon: FileText,
          route: `/documents/${d.id}`,
        });
      }
    });

    // Recipients
    state.recipients.forEach((r) => {
      if (
        r.name.toLowerCase().includes(q) ||
        r.pno.toLowerCase().includes(q) ||
        r.unit.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      ) {
        results.push({
          title: `${r.name} (${r.pno})`,
          subtitle: `${r.unit} • ${r.status}`,
          category: 'Recipient',
          icon: Users,
          route: `/recipients`,
        });
      }
    });

    // Investigations
    state.investigations.forEach((inv) => {
      if (
        inv.id.toLowerCase().includes(q) ||
        inv.title.toLowerCase().includes(q) ||
        inv.filename.toLowerCase().includes(q)
      ) {
        results.push({
          title: `${inv.id}: ${inv.title}`,
          subtitle: `Verdict: ${inv.verdict} (${inv.confidenceScore}%)`,
          category: 'Investigation',
          icon: ShieldAlert,
          route: `/investigations/${inv.id}`,
        });
      }
    });

    // Ledger Blocks
    state.ledgerBlocks.forEach((b) => {
      if (
        b.blockNumber.toString().includes(q) ||
        b.merkleRootHash.toLowerCase().includes(q) ||
        b.events.some((e) => e.eventId.toLowerCase().includes(q) || e.recipientPseudonym.toLowerCase().includes(q))
      ) {
        results.push({
          title: `Ledger Block #${b.blockNumber}`,
          subtitle: `${b.validatingNode} • ${b.status}`,
          category: 'Ledger Block',
          icon: Database,
          route: `/ledger/${b.blockNumber}`,
        });
      }
    });

    // Provenance Capsules
    state.provenanceCapsules.forEach((c) => {
      if (
        c.capsuleId.toLowerCase().includes(q) ||
        c.recipientPseudonym.toLowerCase().includes(q) ||
        c.documentName.toLowerCase().includes(q)
      ) {
        results.push({
          title: c.capsuleId,
          subtitle: `Bound to ${c.recipientPseudonym} • ${c.documentName}`,
          category: 'Provenance Capsule',
          icon: Layers,
          route: `/documents/${c.documentId}`,
        });
      }
    });

    return results;
  }, [query, state]);

  if (!isOpen) return null;

  const handleSelect = (route: string) => {
    navigate(route);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-4 overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-3 pb-3 border-b border-slate-100">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Document ID, Recipient, Case ID, Event ID, Capsule, or Hash…"
            className="w-full bg-transparent text-slate-900 text-sm focus:outline-none placeholder:text-slate-400 font-medium"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 max-h-96 overflow-y-auto space-y-1">
          <p className="px-3 text-[10.5px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            {query ? `Search Results (${searchResults.length})` : 'Recommended Naval Records & Commands'}
          </p>
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No records found matching "{query}". Try a document ID (e.g. NAV-DOC-2026-0042) or case (NAVX-0042).
            </div>
          ) : (
            searchResults.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(item.route)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer text-xs transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 group-hover:text-blue-600 block truncate max-w-md">
                        {item.title}
                      </span>
                      <span className="text-[10.5px] text-slate-500 font-mono">{item.subtitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {item.category}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
