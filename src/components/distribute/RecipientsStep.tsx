import React, { useState } from 'react';
import { Search, Check } from 'lucide-react';
import type { RecipientCategory, RecipientItem } from '../../types/distribution';

interface RecipientsStepProps {
  selectedRecipientIds: string[];
  onToggleRecipient: (id: string) => void;
}

const mockDirectory: RecipientItem[] = [
  // Users
  {
    id: 'user-01',
    name: 'Cdr. A. Mehta',
    unit: 'NAV-OPS-042',
    role: 'Operations',
    category: 'Users',
    initials: 'AM',
    isAuthorized: true,
    clearanceLevel: 'LEVEL 4'
  },
  {
    id: 'user-02',
    name: 'Lt. Priya Singh',
    unit: 'NAV-INTEL-018',
    role: 'Intelligence',
    category: 'Users',
    initials: 'PS',
    isAuthorized: true,
    clearanceLevel: 'LEVEL 4'
  },
  {
    id: 'user-03',
    name: 'Lt. Rohan Kumar',
    unit: 'NAV-LOG-031',
    role: 'Logistics',
    category: 'Users',
    initials: 'RK',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 3'
  },
  {
    id: 'user-04',
    name: 'Cdr. Sneha Menon',
    unit: 'INHQ-207',
    role: 'Headquarters',
    category: 'Users',
    initials: 'SM',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 4'
  },
  // Groups
  {
    id: 'group-01',
    name: 'Western Fleet Tactical Taskforce',
    unit: 'WNC-TF-01',
    role: 'Fleet Command',
    category: 'Groups',
    initials: 'WF',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 4'
  },
  {
    id: 'group-02',
    name: 'Eastern Littoral Intel Cell',
    unit: 'ENC-INT-09',
    role: 'Cryptanalysis',
    category: 'Groups',
    initials: 'EL',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 4'
  },
  // Units
  {
    id: 'unit-01',
    name: 'INS Vikrant (R11)',
    unit: 'FLAGSHIP-R11',
    role: 'Carrier Strike Group',
    category: 'Units',
    initials: 'VK',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 4'
  },
  {
    id: 'unit-02',
    name: 'INS Chennai (D65)',
    unit: 'DESTROYER-D65',
    role: 'Guided Missile Defense',
    category: 'Units',
    initials: 'CH',
    isAuthorized: false,
    clearanceLevel: 'LEVEL 4'
  }
];

export const RecipientsStep: React.FC<RecipientsStepProps> = ({
  selectedRecipientIds,
  onToggleRecipient
}) => {
  const [activeCategory, setActiveCategory] = useState<RecipientCategory>('Users');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: RecipientCategory[] = ['Users', 'Groups', 'Units', 'External Agencies'];

  const filteredDirectory = mockDirectory.filter((item) => {
    const matchesCategory = item.category === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between h-full shadow-sm">
      <div>
        {/* Step Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] font-bold text-xs flex items-center justify-center border border-blue-200">
              2
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-wider text-[#0F172A] uppercase">
                RECIPIENTS
              </h3>
              <p className="text-[11px] text-slate-500">
                Authorized sovereign endpoints
              </p>
            </div>
          </div>

          <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            {selectedRecipientIds.length} Selected
          </span>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-lg bg-slate-100 mb-3 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`py-1 rounded-md font-semibold text-[11px] transition-all text-center ${
                activeCategory === cat
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
          />
        </div>

        {/* List of Recipients */}
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {filteredDirectory.map((item) => {
            const isSelected = selectedRecipientIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onToggleRecipient(item.id)}
                className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10.5px] border ${
                    isSelected ? 'bg-blue-600 text-white border-blue-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {item.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {item.unit} • {item.role}
                    </p>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-300 bg-white'
                }`}>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecipientsStep;
