import React from 'react';

interface BattleArtIllustrationProps {
  variant?: 'hero' | 'pvp' | 'pvai' | 'compact';
  className?: string;
}

export const BattleArtIllustration: React.FC<BattleArtIllustrationProps> = ({
  variant = 'hero',
  className = '',
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl select-none ${className}`}>
      <svg
        viewBox="0 0 800 320"
        className="w-full h-full object-cover"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="bgGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="35%" stopColor="#1e1b4b" />
            <stop offset="70%" stopColor="#31102b" />
            <stop offset="100%" stopColor="#18070d" />
          </linearGradient>

          <linearGradient id="whiteGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="blackCrimsonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#450a0a" />
          </linearGradient>

          <linearGradient id="bladeWhiteGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="bladeDarkGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
          </linearGradient>

          <radialGradient id="clashBurst" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="25%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>

          {/* Glow Filters */}
          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Dark Atmospheric Background */}
        <rect width="800" height="320" fill="url(#bgGlow)" />

        {/* Isometric Battle Grid Floor */}
        <g opacity="0.18" stroke="#cbd5e1" strokeWidth="1">
          <line x1="0" y1="280" x2="800" y2="280" />
          <line x1="0" y1="240" x2="800" y2="240" />
          <line x1="0" y1="200" x2="800" y2="200" />
          <line x1="100" y1="180" x2="0" y2="320" />
          <line x1="250" y1="180" x2="150" y2="320" />
          <line x1="400" y1="180" x2="400" y2="320" />
          <line x1="550" y1="180" x2="650" y2="320" />
          <line x1="700" y1="180" x2="800" y2="320" />
        </g>

        {/* Left Faction Aura (Radiant Gold / Cyan) */}
        <circle cx="200" cy="160" r="140" fill="#38bdf8" opacity="0.12" filter="url(#glowEffect)" />
        <circle cx="240" cy="140" r="100" fill="#fbbf24" opacity="0.15" filter="url(#glowEffect)" />

        {/* Right Faction Aura (Dread Crimson / Purple) */}
        <circle cx="600" cy="160" r="140" fill="#ef4444" opacity="0.15" filter="url(#glowEffect)" />
        <circle cx="560" cy="140" r="100" fill="#a855f7" opacity="0.15" filter="url(#glowEffect)" />

        {/* Radiant Vanguard (White Knight Champion) */}
        <g id="radiant-knight" transform="translate(140, 45)">
          {/* Shield */}
          <path
            d="M 120 90 Q 150 70 170 95 Q 185 160 145 200 Q 115 160 120 90 Z"
            fill="url(#whiteGoldGrad)"
            stroke="#f59e0b"
            strokeWidth="3"
          />
          {/* Shield Emblem */}
          <path d="M 145 110 L 145 160 M 130 130 L 160 130" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
          <circle cx="145" cy="130" r="12" fill="none" stroke="#b45309" strokeWidth="2.5" />

          {/* Horse Knight Head & Armor */}
          <path
            d="M 50 180 C 50 140 40 90 70 60 C 90 40 120 30 135 50 C 145 65 140 85 125 100 C 135 120 155 130 160 170 C 160 190 140 210 130 210 Z"
            fill="#f8fafc"
            stroke="#f59e0b"
            strokeWidth="4"
          />
          {/* Knight Mane */}
          <path d="M 120 40 L 140 30 M 110 55 L 135 48 M 100 75 L 128 68" stroke="#d97706" strokeWidth="4" strokeLinecap="round" />
          {/* Visor & Eye */}
          <circle cx="105" cy="72" r="5" fill="#38bdf8" filter="url(#glowEffect)" />
          {/* Armored Chest & Pauldron */}
          <path d="M 40 210 L 160 210 L 150 245 L 30 245 Z" fill="#e2e8f0" stroke="#f59e0b" strokeWidth="3.5" />

          {/* Radiant Broadsword Clashing Forward */}
          <g transform="rotate(35 160 120)">
            <rect x="150" y="30" width="14" height="150" rx="3" fill="url(#bladeWhiteGlow)" stroke="#fef08a" strokeWidth="2" filter="url(#glowEffect)" />
            <polygon points="157,10 148,32 166,32" fill="#ffffff" />
            <rect x="135" y="178" width="44" height="8" rx="2" fill="#d97706" />
            <rect x="153" y="186" width="8" height="30" rx="2" fill="#78350f" />
            <circle cx="157" cy="220" r="7" fill="#f59e0b" />
          </g>
        </g>

        {/* Dread Vanguard (Black King / Warlord Champion) */}
        <g id="dread-king" transform="translate(480, 40)">
          {/* Dark Cape */}
          <path
            d="M 60 100 C 30 140 10 200 0 240 L 140 240 C 130 180 120 120 100 100 Z"
            fill="#18070d"
            stroke="#991b1b"
            strokeWidth="2.5"
          />

          {/* Dread King Body Armor */}
          <path
            d="M 40 90 L 140 90 L 150 220 L 30 220 Z"
            fill="url(#blackCrimsonGrad)"
            stroke="#ef4444"
            strokeWidth="3.5"
          />

          {/* Imperial Spiked Crown & Visor */}
          <path
            d="M 40 70 L 50 30 L 70 55 L 90 20 L 110 55 L 130 30 L 140 70 Z"
            fill="#1e293b"
            stroke="#ef4444"
            strokeWidth="3.5"
          />
          <circle cx="90" cy="15" r="5" fill="#ef4444" filter="url(#glowEffect)" />
          <circle cx="50" cy="25" r="3.5" fill="#f87171" />
          <circle cx="130" cy="25" r="3.5" fill="#f87171" />
          {/* Glowing Red Gaze Visor */}
          <path d="M 65 75 L 115 75" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" filter="url(#glowEffect)" />

          {/* Dread Greatsword Clashing Back */}
          <g transform="rotate(-38 20 120)">
            <rect x="15" y="30" width="16" height="160" rx="3" fill="url(#bladeDarkGlow)" stroke="#fca5a5" strokeWidth="2" filter="url(#glowEffect)" />
            <polygon points="23,8 13,32 33,32" fill="#fee2e2" />
            <rect x="-2" y="188" width="50" height="10" rx="2" fill="#7f1d1d" />
            <rect x="19" y="198" width="8" height="32" rx="2" fill="#1e293b" />
            <circle cx="23" cy="235" r="8" fill="#ef4444" />
          </g>
        </g>

        {/* Central Kinetic Clash Spark & Impact */}
        <circle cx="400" cy="140" r="70" fill="url(#clashBurst)" filter="url(#glowEffect)" />

        {/* Spark Bolts */}
        <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="url(#glowEffect)">
          <line x1="400" y1="140" x2="360" y2="80" />
          <line x1="400" y1="140" x2="440" y2="70" />
          <line x1="400" y1="140" x2="350" y2="190" />
          <line x1="400" y1="140" x2="460" y2="180" />
          <line x1="400" y1="140" x2="400" y2="40" stroke="#fde047" strokeWidth="4" />
          <line x1="400" y1="140" x2="320" y2="140" stroke="#38bdf8" strokeWidth="3.5" />
          <line x1="400" y1="140" x2="480" y2="140" stroke="#ef4444" strokeWidth="3.5" />
        </g>

        {/* Dynamic Energy Embers */}
        <circle cx="370" cy="110" r="3" fill="#fde047" />
        <circle cx="430" cy="115" r="3.5" fill="#f87171" />
        <circle cx="390" cy="175" r="2.5" fill="#67e8f9" />
        <circle cx="420" cy="165" r="3" fill="#c084fc" />
        <circle cx="340" cy="95" r="2" fill="#ffffff" />
        <circle cx="470" cy="105" r="2" fill="#fca5a5" />

        {/* Title Watermark Typography in SVG */}
        <text
          x="400"
          y="295"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize="14"
          fontWeight="900"
          letterSpacing="4"
          opacity="0.9"
        >
          TACTICAL BATTLEFIELD • DECK & CLASH
        </text>
      </svg>
    </div>
  );
};
