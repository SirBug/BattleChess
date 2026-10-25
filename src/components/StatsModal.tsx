import React from 'react';
import { DifficultyMode, PlayerStats } from '../types';
import {
  X,
  Trophy,
  Swords,
  Shield,
  TrendingUp,
  Target,
  Sliders,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

interface StatsModalProps {
  stats: PlayerStats;
  difficulty: DifficultyMode;
  onDifficultyChange: (mode: DifficultyMode) => void;
  onResetStats: () => void;
  onClose: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  stats,
  difficulty,
  onDifficultyChange,
  onResetStats,
  onClose,
}) => {
  const gameWinRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const duelWinRate = stats.duelsPlayed > 0 ? Math.round((stats.duelsWon / stats.duelsPlayed) * 100) : 0;

  const difficultyLevels: { id: DifficultyMode; label: string; desc: string; badge: string }[] = [
    {
      id: 'adaptive',
      label: 'Adaptive AI (Dynamic MMR)',
      desc: 'Automatically adjusts in real-time based on your duel win rates and match outcomes.',
      badge: `Current MMR: ${stats.adaptiveRating}`,
    },
    {
      id: 'easy',
      label: 'Recruit (Beginner)',
      desc: 'Forgiving chess evaluation and relaxed card combat. Great for learning.',
      badge: 'Casual',
    },
    {
      id: 'medium',
      label: 'Knight Commander (Standard)',
      desc: 'Balanced chess depth with tactical card counters and smart combos.',
      badge: 'Competitive',
    },
    {
      id: 'hard',
      label: 'Grandmaster (Veteran)',
      desc: 'Deep 3-ply minimax chess calculations and lethal combat card synergies.',
      badge: 'Hardcore',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-black text-slate-100">Player Record & AI Tuning</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-400">Match Victories</span>
            <span className="text-xl font-black text-amber-400">{stats.gamesWon}</span>
            <span className="text-[10px] text-slate-500">{stats.gamesPlayed} Matches</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-400">Match Win Rate</span>
            <span className="text-xl font-black text-emerald-400">{gameWinRate}%</span>
            <span className="text-[10px] text-slate-500">Streak: {stats.winStreak}</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-400">Duel Clashes</span>
            <span className="text-xl font-black text-blue-400">{stats.duelsWon}</span>
            <span className="text-[10px] text-slate-500">{stats.duelsPlayed} Fought</span>
          </div>

          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center">
            <span className="text-[11px] font-bold text-slate-400">Duel Win Rate</span>
            <span className="text-xl font-black text-purple-400">{duelWinRate}%</span>
            <span className="text-[10px] text-slate-500">Captured: {stats.piecesCaptured}</span>
          </div>
        </div>

        {/* Difficulty Setting Selector */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>AI DIFFICULTY ENGINE</span>
          </div>

          <div className="flex flex-col gap-2">
            {difficultyLevels.map((lvl) => {
              const isSelected = difficulty === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => onDifficultyChange(lvl.id)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-slate-100 shadow-md ring-1 ring-amber-400'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm">{lvl.label}</span>
                      {isSelected && (
                        <span className="px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[10px]">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{lvl.desc}</p>
                  </div>

                  <span className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-mono text-amber-300 shrink-0">
                    {lvl.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            onClick={onResetStats}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 px-3 py-1.5 bg-red-950/40 border border-red-900 rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
