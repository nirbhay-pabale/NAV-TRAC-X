import React from 'react';

export const EmconLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 4 Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-44 rounded-2xl bg-[#08162b]/60 border border-slate-800 p-4 space-y-3">
            <div className="h-4 w-28 bg-slate-800 rounded" />
            <div className="h-20 bg-slate-800/40 rounded-xl" />
            <div className="h-4 w-40 bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Middle Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 xl:col-span-7 h-[460px] rounded-2xl bg-[#08162b]/60 border border-slate-800" />
        <div className="lg:col-span-5 xl:col-span-5 space-y-4">
          <div className="h-[222px] rounded-2xl bg-[#08162b]/60 border border-slate-800" />
          <div className="h-[222px] rounded-2xl bg-[#08162b]/60 border border-slate-800" />
        </div>
      </div>

      {/* Bottom Log Skeleton */}
      <div className="h-64 rounded-2xl bg-[#08162b]/60 border border-slate-800" />
    </div>
  );
};
