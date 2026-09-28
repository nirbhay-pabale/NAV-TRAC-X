import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Users,
  Database,
  Search,
  ArrowRight
} from 'lucide-react';
import type { StatCardData } from '../../types/commandCenter';

interface StatCardProps {
  card: StatCardData;
  index: number;
}

export const StatCard: React.FC<StatCardProps> = ({ card, index }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (card.accentColor) {
      case 'blue':
        return <FileText className="w-5 h-5 text-[#38bdf8]" />;
      case 'green':
        return <Users className="w-5 h-5 text-[#22c55e]" />;
      case 'purple':
        return <Database className="w-5 h-5 text-[#a855f7]" />;
      case 'red':
        return <Search className="w-5 h-5 text-[#ef4444]" />;
      default:
        return <FileText className="w-5 h-5 text-[#38bdf8]" />;
    }
  };

  const getCardClass = () => {
    switch (card.accentColor) {
      case 'blue':
        return 'stat-card-blue';
      case 'green':
        return 'stat-card-green';
      case 'purple':
        return 'stat-card-purple';
      case 'red':
        return 'stat-card-red';
    }
  };

  const getChipBg = () => {
    switch (card.accentColor) {
      case 'blue':
        return 'bg-sky-500/20 border-sky-400/30';
      case 'green':
        return 'bg-emerald-500/20 border-emerald-400/30';
      case 'purple':
        return 'bg-purple-500/20 border-purple-400/30';
      case 'red':
        return 'bg-red-500/20 border-red-400/30';
    }
  };

  const getSparklineColor = () => {
    switch (card.accentColor) {
      case 'blue':
        return '#38bdf8';
      case 'green':
        return '#22c55e';
      case 'purple':
        return '#a855f7';
      case 'red':
        return '#ef4444';
    }
  };

  const maxVal = Math.max(...card.sparkline, 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.05 * index }}
      onClick={() => navigate(card.route)}
      className={`${getCardClass()} rounded-2xl p-5 cursor-pointer transition-all duration-300 relative group overflow-hidden flex flex-col justify-between`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navigate(card.route);
        }
      }}
    >
      {/* Top Header: Icon Chip + Title + Chevron Link */}
      <div>
        <div className="flex items-center justify-between mb-3">
          {/* Icon Chip */}
          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${getChipBg()} transition-transform group-hover:scale-105`}>
            {getIcon()}
          </div>

          {/* Top-Right Chevron Navigation */}
          <button
            type="button"
            className="text-slate-400 group-hover:text-white transition-colors p-1.5 rounded-lg hover:bg-slate-800/40"
            aria-label={`View ${card.title} details`}
          >
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Card Title */}
        <p className="text-[11px] font-bold tracking-wider text-slate-300 uppercase font-['Montserrat']">
          {card.title}
        </p>
      </div>

      {/* Main Stat & Bottom Sparkline */}
      <div className="mt-2 flex items-end justify-between">
        <div>
          {/* Big Number */}
          <span className="text-3xl sm:text-4xl font-black text-white font-['Montserrat'] tracking-tight">
            {card.value}
          </span>
          {/* Subtitle / Trend */}
          <p
            className={`text-xs mt-1 font-medium ${
              card.accentColor === 'blue'
                ? 'text-emerald-400 font-semibold'
                : 'text-[#8EABC1]'
            }`}
          >
            {card.subtitle}
          </p>
        </div>

        {/* Minimalist Sparkline Bars matching screenshot */}
        <div className="flex items-end gap-1 h-9 pb-1">
          {card.sparkline.map((val, i) => {
            const heightPct = Math.max(15, Math.round((val / maxVal) * 100));
            return (
              <div
                key={i}
                className="w-1.5 rounded-t transition-all duration-500 group-hover:opacity-100 opacity-70"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: getSparklineColor(),
                  boxShadow: `0 0 6px ${getSparklineColor()}66`
                }}
              />
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
