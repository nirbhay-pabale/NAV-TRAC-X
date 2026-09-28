import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileUp,
  Search,
  UserPlus,
  Database,
  ArrowRight
} from 'lucide-react';

interface QuickActionsProps {
  onOpenDistributeModal?: () => void;
  onOpenAddRecipientModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenAddRecipientModal
}) => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'distribute',
      title: 'Distribute Document',
      subtitle: 'Secure and authorize distribution',
      icon: FileUp,
      iconColor: 'text-[#2563EB]',
      iconBg: 'bg-blue-50 border-blue-100',
      action: () => navigate('/distribute')
    },
    {
      id: 'investigate',
      title: 'Investigate Leak',
      subtitle: 'Analyze leaked artifact',
      icon: Search,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-100',
      action: () => navigate('/investigations/new')
    },
    {
      id: 'recipient',
      title: 'Add Recipient',
      subtitle: 'Authorize new recipient',
      icon: UserPlus,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
      action: () => onOpenAddRecipientModal()
    },
    {
      id: 'ledger',
      title: 'View Ledger',
      subtitle: 'Explore provenance events',
      icon: Database,
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50 border-purple-100',
      action: () => navigate('/ledger')
    }
  ];

  return (
    <div className="mb-6">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            Quick Actions
          </h2>
          <p className="text-xs text-[#64748B]">
            Start your next operational workflow
          </p>
        </div>
      </div>

      {/* 4 Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 + idx * 0.05 }}
              onClick={item.action}
              className="bg-white rounded-xl border border-slate-200 p-5 cursor-pointer flex flex-col justify-between group min-h-[130px] shadow-sm hover:border-blue-400 hover:shadow-md transition-all"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  item.action();
                }
              }}
            >
              {/* Icon */}
              <div className="flex items-start justify-between">
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${item.iconBg}`}>
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
              </div>

              {/* Title, Subtitle, & Arrow */}
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {item.subtitle}
                  </p>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all shrink-0 ml-2 shadow-xs">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
