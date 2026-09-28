import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Copy,
  Check,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Database
} from 'lucide-react';

interface RecipientDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRecipient?: (recipientId: string) => void;
}

interface DirectoryUnit {
  id: string;
  name: string;
  unitCode: string;
  sahyogNode: string;
  badge: string;
  status: 'AUTHORIZED' | 'RESTRICTED' | 'REVOKED';
  officerName: string;
  officerRole: string;
  email: string;
  phone: string;
  stationAddress: string;
  command: 'Western Fleet' | 'Eastern Fleet' | 'Southern Command' | 'Submarine Arm' | 'Naval HQ';
  clearance: string;
  keyVersion: string;
}

const MOCK_UNITS: DirectoryUnit[] = [
  {
    id: 'UNIT-01',
    name: 'INS Vikramaditya (Carrier Strike Group)',
    unitCode: 'IND-NAV-004',
    sahyogNode: 'NAVTRAC-RE-VIKRAM-004',
    badge: '⚓',
    status: 'AUTHORIZED',
    officerName: 'Cdr. A. Mehta',
    officerRole: 'Chief Operations Officer',
    email: 'a.mehta@navy.mil.in',
    phone: '+91-22-2275-4001',
    stationAddress: 'Naval Dockyard, Mumbai, Maharashtra 400001',
    command: 'Western Fleet',
    clearance: 'Level 4 (Top Secret Codeword)',
    keyVersion: 'ML-KEM-768 v2.4'
  },
  {
    id: 'UNIT-02',
    name: 'INS Vikrant (Indigenous Aircraft Carrier)',
    unitCode: 'IND-NAV-002',
    sahyogNode: 'NAVTRAC-RE-VIKRANT-002',
    badge: '⚓',
    status: 'AUTHORIZED',
    officerName: 'Capt. Siddharth Verma',
    officerRole: 'Head of Communications & Cryptography',
    email: 's.verma@navy.mil.in',
    phone: '+91-484-287-2100',
    stationAddress: 'Southern Naval Command, Kochi, Kerala 682004',
    command: 'Southern Command',
    clearance: 'Level 4 (Top Secret Codeword)',
    keyVersion: 'ML-KEM-768 v2.4'
  },
  {
    id: 'UNIT-03',
    name: 'INS Visakhapatnam (P15B Guided Missile Destroyer)',
    unitCode: 'IND-NAV-007',
    sahyogNode: 'NAVTRAC-RE-VISAKH-007',
    badge: '🚢',
    status: 'AUTHORIZED',
    officerName: 'Lt. Cdr. Pooja Kulkarni',
    officerRole: 'Chief Tactical Warfare Officer',
    email: 'p.kulkarni@navy.mil.in',
    phone: '+91-891-281-3300',
    stationAddress: 'Eastern Naval Command, Visakhapatnam, AP 530014',
    command: 'Eastern Fleet',
    clearance: 'Level 3 (Secret - Tactical)',
    keyVersion: 'ML-KEM-768 v2.2'
  },
  {
    id: 'UNIT-04',
    name: 'INS Arihant (Strategic Strike Submarine)',
    unitCode: 'IND-NAV-001',
    sahyogNode: 'NAVTRAC-RE-ARIHANT-001',
    badge: '🛡️',
    status: 'AUTHORIZED',
    officerName: 'Cdr. Rohan Gupta',
    officerRole: 'Executive Security & Strategic Comms Officer',
    email: 'r.gupta@navy.mil.in',
    phone: '+91-891-281-5500',
    stationAddress: 'Submarine Base INS Virbahu, Visakhapatnam 530014',
    command: 'Submarine Arm',
    clearance: 'Level 5 (Cosmic Naval Top Secret)',
    keyVersion: 'ML-KEM-768 v3.0'
  },
  {
    id: 'UNIT-05',
    name: 'Directorate of Naval Intelligence (DNI)',
    unitCode: 'IND-NAV-010',
    sahyogNode: 'NAVTRAC-RE-DNI-010',
    badge: '🏛️',
    status: 'AUTHORIZED',
    officerName: 'Commodore R. Sharma',
    officerRole: 'Fleet Intelligence Officer',
    email: 'dni.ops@navy.mil.in',
    phone: '+91-11-2301-4422',
    stationAddress: 'Sena Bhawan, Integrated HQ MoD (Navy), New Delhi 110011',
    command: 'Naval HQ',
    clearance: 'Level 4 (Top Secret Codeword)',
    keyVersion: 'ML-KEM-768 v2.4'
  },
  {
    id: 'UNIT-06',
    name: 'INS Kolkata (P15A Stealth Destroyer)',
    unitCode: 'IND-NAV-008',
    sahyogNode: 'NAVTRAC-RE-KOLKATA-008',
    badge: '🚢',
    status: 'RESTRICTED',
    officerName: 'Lt. Priya Singh',
    officerRole: 'Signals & Cryptographic Officer',
    email: 'priya.singh@navy.mil.in',
    phone: '+91-22-2275-4088',
    stationAddress: 'Western Naval Command, Mumbai 400001',
    command: 'Western Fleet',
    clearance: 'Level 3 (Secret - Tactical)',
    keyVersion: 'ML-KEM-768 v2.1'
  }
];

export const RecipientDirectoryModal: React.FC<RecipientDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectRecipient
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'Western Fleet' | 'Eastern Fleet' | 'Southern Command' | 'Submarine Arm' | 'Naval HQ'>('ALL');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(id);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const filteredUnits = MOCK_UNITS.filter((u) => {
    const matchesFilter = activeFilter === 'ALL' || u.command === activeFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      u.name.toLowerCase().includes(q) ||
      u.officerName.toLowerCase().includes(q) ||
      u.unitCode.toLowerCase().includes(q) ||
      u.stationAddress.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none animate-fadeIn">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Centered White Modal */}
      <div className="relative w-full max-w-[1140px] bg-white rounded-2xl shadow-2xl border border-[#E6EAF2] flex flex-col max-h-[90vh] overflow-hidden z-10 font-sans">
        
        {/* ── 1. MODAL HEADER ── */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-[#E6EAF2]">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E0EDFF] text-[#1D4ED8] flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Registered Recipient Directory (NAV-TRAC X)
                </h2>
                <span className="pill-blue">
                  45 Registered Units
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Official Naval Command Nodal Officers & Cryptographic Terminals under Naval PKI / EMCON Gateway
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. TOOLBAR (Search + Filter Chips) ── */}
        <div className="p-4 px-6 bg-[#F8FAFC] border-b border-[#E6EAF2] flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by unit, vessel, officer, or station…"
              className="w-full h-9 pl-9 pr-3 text-xs bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-[#64748B] mr-1 hidden sm:inline">Command:</span>
            {(['ALL', 'Western Fleet', 'Eastern Fleet', 'Southern Command', 'Submarine Arm', 'Naval HQ'] as const).map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setActiveFilter(chip)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === chip
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-[#475569] border border-[#CBD5E1] hover:bg-[#F1F5F9]'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* ── 3. BODY: 2-COLUMN CARD GRID ── */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className="navtrac-card p-4 sm:p-5 flex flex-col justify-between hover:border-[#94A3B8]/60 transition-all group"
              >
                {/* Card Top: Unit Badge, Name, Code, Status */}
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-sm flex-shrink-0">
                        {unit.badge}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate">
                          {unit.name}
                        </h4>
                        <div className="text-[10.5px] font-mono text-[#64748B] flex items-center gap-1.5 truncate">
                          <span className="text-[#2563EB] font-semibold">{unit.unitCode}</span>
                          <span>•</span>
                          <span className="truncate">{unit.sahyogNode}</span>
                        </div>
                      </div>
                    </div>

                    <span className={unit.status === 'AUTHORIZED' ? 'pill-green' : unit.status === 'RESTRICTED' ? 'pill-amber' : 'pill-red'}>
                      {unit.status}
                    </span>
                  </div>

                  {/* Officer Info Light Box */}
                  <div className="my-3 p-3 rounded-lg bg-[#F8FAFC] border border-[#E6EAF2] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-[#0F172A]">
                        {unit.officerName}
                        <span className="text-[11px] font-normal text-[#64748B] ml-1.5">
                          ({unit.officerRole})
                        </span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
                        OFFICIAL NODAL OFFICER
                      </span>
                    </div>

                    {/* Email & Phone Rows */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-[#334155] pt-1">
                      <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3 text-[#64748B] flex-shrink-0" />
                          <span className="truncate text-[11px]">{unit.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(unit.email, `${unit.id}-email`)}
                          className="text-[#94A3B8] hover:text-[#2563EB] p-0.5 ml-1"
                          title="Copy email"
                        >
                          {copiedField === `${unit.id}-email` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-[#E2E8F0]">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-[#64748B] flex-shrink-0" />
                          <span className="truncate text-[11px]">{unit.phone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(unit.phone, `${unit.id}-phone`)}
                          className="text-[#94A3B8] hover:text-[#2563EB] p-0.5 ml-1"
                          title="Copy phone"
                        >
                          {copiedField === `${unit.id}-phone` ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Station Address */}
                    <div className="text-[10.5px] text-[#64748B] flex items-center gap-1.5 pt-0.5 truncate">
                      <Building2 className="w-3 h-3 text-[#94A3B8] flex-shrink-0" />
                      <span className="truncate">{unit.stationAddress}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Metadata + Review Access Button */}
                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between gap-2 text-[10.5px] font-mono text-[#64748B]">
                  <div className="truncate">
                    <span>Clearance: {unit.clearance}</span>
                    <span className="mx-1">•</span>
                    <span>Key: {unit.keyVersion}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectRecipient) onSelectRecipient(unit.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#2563EB] font-bold text-xs flex items-center gap-1 transition-colors flex-shrink-0"
                  >
                    <span>Review Access</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredUnits.length === 0 && (
            <div className="text-center py-12 text-xs text-[#64748B]">
              No naval recipient units matched your search criteria.
            </div>
          )}
        </div>

        {/* ── 4. MODAL FOOTER ── */}
        <div className="p-4 px-6 bg-[#F8FAFC] border-t border-[#E6EAF2] flex items-center justify-between text-xs font-mono text-[#64748B]">
          <span>
            Showing {filteredUnits.length} of {MOCK_UNITS.length} registered units
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-[#F1F5F9] text-[#0F172A] font-semibold transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
