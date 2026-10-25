import React, { useState } from 'react';
import { DifficultyMode, GameMode, PlayerStats } from '../types';
import { sound } from '../utils/soundEffects';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Trophy,
  Layers,
  RotateCcw,
  Sliders,
  Users,
  Bot,
  User,
  ShieldAlert,
} from 'lucide-react';

interface GameNavbarProps {
  difficulty: DifficultyMode;
  stats: PlayerStats;
  gameMode?: GameMode;
  player1DisplayName?: string;
  player2DisplayName?: string;
  onOpenTutorial: () => void;
  onOpenRoster: () => void;
  onOpenStats: () => void;
  onOpenModeSelect: () => void;
  onNewGame: () => void;
}

export const GameNavbar: React.FC<GameNavbarProps> = ({
  difficulty,
  stats,
  gameMode = 'pvai',
  player1DisplayName = 'Radiant White',
  player2DisplayName = 'Dread Black AI',
  onOpenTutorial,
  onOpenRoster,
  onOpenStats,
  onOpenModeSelect,
  onNewGame,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'adaptive':
        return `Adaptive (${stats.adaptiveRating})`;
      case 'easy':
        return 'Recruit';
      case 'medium':
        return 'Knight';
      case 'hard':
        return 'Master';
    }
  };

  const isPvP = gameMode === 'pvp';

  return (
    <header className="w-full bg-slate-900/70 border border-slate-800 backdrop-blur-md px-3 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xl mb-4">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-950 font-black text-lg shadow-[0_0_18px_rgba(245,158,11,0.35)] shrink-0 select-none">
          TC
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              TACTICAL CHESS
            </h1>
            <span
              onClick={onOpenModeSelect}
              className={`cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all hover:scale-105 flex items-center gap-1 ${
                isPvP
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/50'
              }`}
              title="Click to Switch Mode / Players"
            >
              {isPvP ? <Users className="w-3 h-3 text-indigo-400" /> : <Bot className="w-3 h-3 text-amber-400" />}
              <span>{isPvP ? '2-Player PvP' : 'vs AI'}</span>
            </span>
          </div>
          <div className="text-[10px] sm:text-xs text-slate-400 font-medium truncate max-w-[280px] sm:max-w-none">
            {isPvP ? `${player1DisplayName} vs ${player2DisplayName}` : 'Turn-Based Battlefield with Fast Card Duels'}
          </div>
        </div>
      </div>

      {/* Adaptive Rating & Action Buttons Hub */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Game Mode / Player Profiles Switch Button */}
        <button
          onClick={onOpenModeSelect}
          className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 active:scale-95 shadow-sm ${
            isPvP
              ? 'bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-200 border-indigo-500/50'
              : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
          }`}
          title="Select Mode (PvAI / PvP) & Switch Players"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Mode & Players</span>
        </button>

        {/* Adaptive Difficulty Badge */}
        {!isPvP && (
          <div
            onClick={onOpenStats}
            className="hidden md:flex flex-col items-end cursor-pointer hover:opacity-90 transition-opacity bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800/80"
            title="Click to view & change difficulty"
          >
            <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">
              Difficulty
            </span>
            <span className="text-amber-400 font-mono text-[11px] font-bold flex items-center gap-1">
              <Sliders className="w-2.5 h-2.5 text-amber-500" />
              {getDifficultyLabel()}
            </span>
          </div>
        )}

        {/* Academy Tutorial Button */}
        <button
          onClick={onOpenTutorial}
          className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
          title="Tactical Academy & Combat Guide"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">Academy</span>
        </button>

        {/* Army Spellbook & Roster */}
        <button
          onClick={onOpenRoster}
          className="bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
          title="Army Roster & Card Decks"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">Roster</span>
        </button>

        {/* Stats & Profiles */}
        <button
          onClick={onOpenStats}
          className="p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl text-slate-300 transition-all active:scale-95"
          title="Statistics & Calibration"
        >
          <Trophy className="w-4 h-4 text-amber-400" />
        </button>

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 sm:p-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 rounded-xl text-slate-300 transition-all active:scale-95"
          title={isMuted ? 'Unmute Audio FX' : 'Mute Audio FX'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* New Match */}
        <button
          onClick={onNewGame}
          className="p-1.5 sm:p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.25)] transition-all active:scale-95"
          title="Start Fresh Match"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
