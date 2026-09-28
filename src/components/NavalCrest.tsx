import React from 'react';

interface NavalCrestProps {
  className?: string;
  size?: number;
}

export const NavalCrest: React.FC<NavalCrestProps> = ({ className = '', size = 52 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_2px_12px_rgba(245,186,66,0.45)] ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Rich Gold Gradients */}
        <linearGradient id="goldGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="35%" stopColor="#F5BA42" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        <linearGradient id="goldGradientLight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF4D0" />
          <stop offset="60%" stopColor="#F5BA42" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="goldGradientDark" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#92400E" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#FBBF24" />
        </linearGradient>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#F5BA42" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Top Naval Crown / Ashoka Lion Capital Inspired Finial */}
      <g filter="url(#goldGlow)">
        {/* Crown Base */}
        <path
          d="M38 23 H62 L60 27 H40 L38 23Z"
          fill="url(#goldGradientMain)"
        />
        {/* Crown Peaks */}
        <path
          d="M36 21 L42 12 L46 19 L50 9 L54 19 L58 12 L64 21 Z"
          fill="url(#goldGradientLight)"
          stroke="#92400E"
          strokeWidth="0.8"
        />
        {/* Crown Jewels / Dots */}
        <circle cx="50" cy="8" r="2" fill="#FFFBEB" />
        <circle cx="42" cy="11" r="1.5" fill="#FFFBEB" />
        <circle cx="58" cy="11" r="1.5" fill="#FFFBEB" />
      </g>

      {/* Anchor Ring at Top */}
      <circle
        cx="50"
        cy="33"
        r="6.5"
        stroke="url(#goldGradientMain)"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="50"
        cy="33"
        r="3.5"
        fill="#041427"
      />

      {/* Anchor Crossbar (Stock) */}
      <rect
        x="32"
        y="41"
        width="36"
        height="5"
        rx="2"
        fill="url(#goldGradientMain)"
        stroke="#78350F"
        strokeWidth="0.5"
      />
      {/* Crossbar End Caps */}
      <circle cx="32" cy="43.5" r="3.2" fill="url(#goldGradientLight)" />
      <circle cx="68" cy="43.5" r="3.2" fill="url(#goldGradientLight)" />

      {/* Central Anchor Shank / Post */}
      <path
        d="M47.5 37 H52.5 V77 H47.5 Z"
        fill="url(#goldGradientMain)"
      />

      {/* Fouled Anchor Rope wrapping around shank */}
      <path
        d="M48 34 C43 38 41 47 52 49 C62 51 60 62 48 65 C41 67 43 75 51 77"
        stroke="url(#goldGradientLight)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="1.5 0.5"
      />

      {/* Anchor Curved Arms (Flukes) */}
      <path
        d="M22 61 C26 77 37 87 50 87 C63 87 74 77 78 61 C76 62 70 66 67 67 C59 79 41 79 33 67 C30 66 24 62 22 61 Z"
        fill="url(#goldGradientMain)"
        stroke="#92400E"
        strokeWidth="0.75"
      />

      {/* Left Palm / Fluke Tip */}
      <path
        d="M20 62 L27 55 L28 66 Z"
        fill="url(#goldGradientLight)"
        stroke="#78350F"
        strokeWidth="0.5"
      />

      {/* Right Palm / Fluke Tip */}
      <path
        d="M80 62 L73 55 L72 66 Z"
        fill="url(#goldGradientLight)"
        stroke="#78350F"
        strokeWidth="0.5"
      />

      {/* Bottom Anchor Crown Point */}
      <path
        d="M47 86 L50 91 L53 86 Z"
        fill="url(#goldGradientLight)"
      />

      {/* Laurel Wreath / Shield Border accents on sides */}
      <g fill="url(#goldGradientMain)" opacity="0.9">
        {/* Left Laurel leaves */}
        <path d="M22 40 C17 46 17 54 22 60 C20 54 20 46 22 40 Z" />
        <path d="M16 46 C12 51 13 58 17 62 C15 57 15 51 16 46 Z" />
        {/* Right Laurel leaves */}
        <path d="M78 40 C83 46 83 54 78 60 C80 54 80 46 78 40 Z" />
        <path d="M84 46 C88 51 87 58 83 62 C85 57 85 51 84 46 Z" />
      </g>
    </svg>
  );
};
