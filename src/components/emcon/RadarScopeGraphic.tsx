import React from 'react';

interface RadarScopeGraphicProps {
  size?: number;
  className?: string;
  isRestricted?: boolean;
}

export const RadarScopeGraphic: React.FC<RadarScopeGraphicProps> = ({
  size = 64,
  className = '',
  isRestricted = true
}) => {
  return (
    <div
      className={`relative rounded-full overflow-hidden flex items-center justify-center bg-[#03151b] border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)] flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label="Tactical radar scope display"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle grid pattern background */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#064e3b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#022c22" stopOpacity="0.3" />
          </radialGradient>
          <linearGradient id="sweepGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Radar Background */}
        <circle cx="50" cy="50" r="48" fill="url(#radarGlow)" />

        {/* Concentric Range Rings */}
        <circle cx="50" cy="50" r="14" fill="none" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.45" />
        <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3,3" />
        <circle cx="50" cy="50" r="47" fill="none" stroke="#10b981" strokeWidth="1.2" strokeOpacity="0.6" />

        {/* Crosshair Lines */}
        <line x1="50" y1="3" x2="50" y2="97" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="3" y1="50" x2="97" y2="50" stroke="#10b981" strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="16" y1="16" x2="84" y2="84" stroke="#10b981" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="2,2" />
        <line x1="16" y1="84" x2="84" y2="16" stroke="#10b981" strokeWidth="0.4" strokeOpacity="0.2" strokeDasharray="2,2" />

        {/* Fixed target blips */}
        <circle cx="36" cy="42" r="2.2" fill="#34d399" className="animate-pulse" />
        <circle cx="68" cy="34" r="1.8" fill="#10b981" />
        <circle cx="58" cy="66" r="2.2" fill={isRestricted ? '#ef4444' : '#34d399'} className="animate-ping" />
        <circle cx="58" cy="66" r="1.8" fill={isRestricted ? '#f87171' : '#34d399'} />

        {/* Center Origin Dot */}
        <circle cx="50" cy="50" r="2.5" fill="#34d399" />

        {/* Rotating Radar Sweep Cone */}
        <g className="origin-center animate-[spin_4s_linear_infinite]">
          <path
            d="M 50 50 L 50 4 A 46 46 0 0 1 84 20 Z"
            fill="url(#sweepGradient)"
          />
          <line x1="50" y1="50" x2="84" y2="20" stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
};
