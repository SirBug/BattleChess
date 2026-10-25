import React from 'react';
import { PieceColor, PieceType } from '../types';

interface PieceArtProps {
  type: PieceType;
  color: PieceColor;
  level?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLevelBadge?: boolean;
}

export const PieceArt: React.FC<PieceArtProps> = ({
  type,
  color,
  level = 1,
  className = '',
  size = 'md',
  showLevelBadge = true,
}) => {
  const isWhite = color === 'white';

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  // Colors
  const primaryColor = isWhite ? '#F8FAFC' : '#1E293B';
  const secondaryColor = isWhite ? '#E2E8F0' : '#0F172A';
  const strokeColor = isWhite ? '#D97706' : '#EF4444'; // Gold for white / Red for black
  const accentColor = isWhite ? '#FDE68A' : '#F87171';
  const innerFill = isWhite ? '#FFFBEB' : '#334155';

  const renderIcon = () => {
    switch (type) {
      case 'pawn':
        return (
          <g>
            {/* Helm / Round Head */}
            <circle cx="50" cy="30" r="16" fill={innerFill} stroke={strokeColor} strokeWidth="3" />
            {/* Visor slit */}
            <path d="M 40 30 L 60 30" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" />
            {/* Shoulder guard / Body */}
            <path
              d="M 32 46 C 32 46, 38 42, 50 42 C 62 42, 68 46, 68 46 L 72 74 C 72 74, 50 72, 28 74 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Chest crest */}
            <circle cx="50" cy="56" r="4" fill={accentColor} />
            {/* Base Pedestal */}
            <rect x="22" y="74" width="56" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );

      case 'knight':
        return (
          <g>
            {/* Horse Mane & Head */}
            <path
              d="M 30 76 C 30 76, 28 52, 38 40 C 44 32, 48 20, 60 16 C 68 14, 74 20, 72 28 C 70 34, 62 38, 64 44 C 66 50, 76 54, 76 64 C 76 74, 70 76, 70 76 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Snout */}
            <path
              d="M 38 40 C 32 44, 24 50, 24 58 C 24 64, 30 66, 36 64"
              fill={innerFill}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Eye / Visor */}
            <circle cx="52" cy="32" r="3.5" fill={accentColor} />
            {/* Mane Tufts */}
            <path d="M 66 22 L 74 20" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 68 32 L 76 30" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 70 42 L 78 40" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            {/* Base Pedestal */}
            <rect x="20" y="76" width="60" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );

      case 'bishop':
        return (
          <g>
            {/* Mitre Cap */}
            <path
              d="M 50 16 C 40 22, 30 36, 30 52 C 30 68, 42 74, 50 74 C 58 74, 70 68, 70 52 C 70 36, 60 22, 50 16 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Mitre Slit / Cross */}
            <path d="M 50 28 L 50 62" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            <path d="M 40 42 L 60 42" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" />
            {/* Holy Top Jewel */}
            <circle cx="50" cy="14" r="5" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
            {/* Base Pedestal */}
            <rect x="22" y="74" width="56" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );

      case 'rook':
        return (
          <g>
            {/* Castle Crenellations */}
            <path
              d="M 26 24 L 34 24 L 34 32 L 44 32 L 44 24 L 56 24 L 56 32 L 66 32 L 66 24 L 74 24 L 74 40 L 68 46 L 68 74 L 32 74 L 32 46 L 26 40 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Tower Arrow Slit */}
            <rect x="47" y="48" width="6" height="14" rx="2" fill={innerFill} stroke={strokeColor} strokeWidth="2" />
            {/* Heavy Reinforcement Bands */}
            <line x1="32" y1="46" x2="68" y2="46" stroke={accentColor} strokeWidth="2.5" />
            {/* Base Pedestal */}
            <rect x="18" y="74" width="64" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );

      case 'queen':
        return (
          <g>
            {/* Crown Spikes */}
            <path
              d="M 24 38 L 30 20 L 40 34 L 50 16 L 60 34 L 70 20 L 76 38 C 76 38, 70 74, 50 74 C 30 74, 24 38, 24 38 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Crown Jewels on points */}
            <circle cx="30" cy="18" r="3.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
            <circle cx="50" cy="14" r="4.5" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
            <circle cx="70" cy="18" r="3.5" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Royal Bodice Gem */}
            <polygon points="50,46 56,54 50,62 44,54" fill={accentColor} stroke={strokeColor} strokeWidth="1.5" />
            {/* Base Pedestal */}
            <rect x="18" y="74" width="64" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );

      case 'king':
        return (
          <g>
            {/* High Royal Cross */}
            <path d="M 50 8 L 50 22 M 42 14 L 58 14" stroke={strokeColor} strokeWidth="3.5" strokeLinecap="round" />
            {/* Grand Crown Dome */}
            <path
              d="M 26 34 C 26 24, 38 22, 50 22 C 62 22, 74 24, 74 34 L 70 74 L 30 74 Z"
              fill={primaryColor}
              stroke={strokeColor}
              strokeWidth="3"
            />
            {/* Imperial Velvet Crest */}
            <path d="M 32 38 C 40 34, 60 34, 68 38 L 64 68 C 56 70, 44 70, 36 68 Z" fill={innerFill} />
            {/* Center Heart Emblem */}
            <circle cx="50" cy="48" r="6" fill={accentColor} stroke={strokeColor} strokeWidth="2" />
            {/* Base Pedestal */}
            <rect x="16" y="74" width="68" height="12" rx="4" fill={secondaryColor} stroke={strokeColor} strokeWidth="3" />
          </g>
        );
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 100 96"
        className={`${sizeClasses} drop-shadow-md transition-transform duration-200`}
      >
        {renderIcon()}
      </svg>

      {/* Level Star Badge */}
      {showLevelBadge && level > 1 && (
        <div
          className={`absolute -top-1 -right-1 flex items-center justify-center font-bold rounded-full border shadow-sm ${
            size === 'sm' ? 'w-3.5 h-3.5 text-[8px]' : size === 'lg' || size === 'xl' ? 'w-6 h-6 text-xs' : 'w-4 h-4 text-[10px]'
          } ${
            isWhite
              ? 'bg-amber-400 text-amber-950 border-amber-200'
              : 'bg-red-500 text-white border-red-300'
          }`}
          title={`Level ${level} Piece`}
        >
          ★{level}
        </div>
      )}
    </div>
  );
};
