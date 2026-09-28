import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipientStats } from '../../hooks/useRecipientStats';
import { Users, FileText, KeyRound, ShieldCheck } from 'lucide-react';

interface RecipientStatCardsProps {
  onFilterChange?: (status: string) => void;
}

export const RecipientStatCards: React.FC<RecipientStatCardsProps> = ({ onFilterChange }) => {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useRecipientStats();

  const cards = [
    {
      id: 'total-recipients',
      title: 'Total Recipients',
      value: isLoading ? '...' : (stats?.totalRecipients ?? 86),
      breakdown: isLoading ? 'Loading...' : (stats?.totalBreakdown ?? '52 Active | 24 Restricted | 10 Revoked'),
      icon: Users,
      iconColor: 'bg-blue-50 text-[#2563EB] border-blue-100',
      pill: '45 Units',
      onClick: () => {
        if (onFilterChange) onFilterChange('All Status');
      }
    },
    {
      id: 'documents-shared',
      title: 'Documents Shared',
      value: isLoading ? '...' : (stats?.documentsShared ?? 128),
      breakdown: isLoading ? 'Loading...' : (stats?.documentsBreakdown ?? '96 Active | 32 Expired'),
      icon: FileText,
      iconColor: 'bg-amber-50 text-amber-600 border-amber-100',
      pill: 'Encapsulated',
      onClick: () => {
        navigate('/documents');
      }
    },
    {
      id: 'decryption-ids',
      title: 'Decryption IDs',
      value: isLoading ? '...' : (stats?.decryptionIds ?? 124),
      breakdown: isLoading ? 'Loading...' : (stats?.decryptionBreakdown ?? 'All Unique (Session Based)'),
      icon: KeyRound,
      iconColor: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      pill: 'Zero Leak',
      onClick: () => {
        if (onFilterChange) onFilterChange('Active');
      }
    },
    {
      id: 'watermark-coverage',
      title: 'Dynamic Watermark',
      value: isLoading ? '...' : (stats?.watermarkCoverage ?? '100%'),
      breakdown: isLoading ? 'Loading...' : (stats?.watermarkBreakdown ?? 'Embedded at Decryption (Invisible)'),
      icon: ShieldCheck,
      iconColor: 'bg-purple-50 text-purple-600 border-purple-100',
      pill: 'Dual-Domain',
      onClick: () => {
        navigate('/investigations');
      }
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.onClick}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:border-blue-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div className="text-2xl font-bold text-[#0F172A] font-mono">
                {card.value}
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {card.pill}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 truncate">
              {card.breakdown}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecipientStatCards;
