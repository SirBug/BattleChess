import React, { useState } from 'react';
import { PieceArt } from './PieceArt';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Swords,
  Shield,
  Zap,
  Award,
  Crown,
  Play,
  RotateCcw,
} from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface TutorialModeProps {
  onClose: () => void;
  onStartGame: () => void;
}

interface TutorialStep {
  title: string;
  badge: string;
  headline: string;
  instructions: string[];
  demoType: 'move' | 'cards' | 'abilities' | 'leveling' | 'king';
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: '1. Movement & Capture Duels',
    badge: 'Core Mechanic',
    headline: 'Traditional Chess, but Every Capture is a Real Fight!',
    instructions: [
      'Pieces move according to traditional chess rules (Pawns forward, Knights in L-shapes, Bishops diagonal, etc.).',
      'When you move onto an enemy square, instead of an instant piece capture, you enter an instant Card-Based Combat Duel!',
      'If the Attacker wins the duel, the defender is captured. If the Defender wins, they hold their ground!',
    ],
    demoType: 'move',
  },
  {
    title: '2. Fast-Paced Card Combat',
    badge: 'Duel Mechanics',
    headline: 'Action Points, Attacks & Iron Shields',
    instructions: [
      'Each turn in a duel, your piece receives Action Points (AP).',
      'Play Attack cards (e.g., Swift Strike) to deal damage to the enemy HP bar.',
      'Play Defense cards (e.g., Iron Guard) to gain Block, which absorbs incoming damage.',
      'Press "End Turn" when out of AP to let the opponent counter-attack.',
    ],
    demoType: 'cards',
  },
  {
    title: '3. Unique Piece Abilities',
    badge: 'Rank Strategy',
    headline: 'Higher Ranks Wield Powerful Signature Spells',
    instructions: [
      'Pawns (Vanguard): Cheap strikes with Underdog Fury (+damage against higher rank pieces).',
      'Knights (Cavaliers): Flank Charges that pierce 50% of enemy block armor.',
      'Bishops (Inquisitors): Divine Smites that deal damage while healing your HP.',
      'Rooks (Bastions): Massive armor builds and seismic shockwaves.',
      'Queens & Kings: Multi-hit cosmic cataclysms and devastating last stands.',
    ],
    demoType: 'abilities',
  },
  {
    title: '4. The Balanced Leveling System',
    badge: 'Progression',
    headline: 'Veterans Grow Stronger (Without Breaking Balance)',
    instructions: [
      'Every duel victory grants XP to the victorious piece.',
      'Leveling up (Level 1 to 5) grants +Max HP, starting armor cushions, and signature AP discounts.',
      'The leveling curve keeps matches skill-dependent: a clever player with a Level 1 Pawn can still outplay a Queen!',
    ],
    demoType: 'leveling',
  },
  {
    title: '5. Adaptive AI & Game Flow',
    badge: 'Mastery',
    headline: 'Smart Difficulty That Evolves With Your Skill',
    instructions: [
      'Adaptive Difficulty automatically assesses your win/loss ratio and tactical duel victories.',
      'Beginners start with friendly, forgiving opponents.',
      'As you win, the AI adapts its chess depth and card combat synergies for the ultimate tactical duel.',
    ],
    demoType: 'king',
  },
];

export const TutorialMode: React.FC<TutorialModeProps> = ({ onClose, onStartGame }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [interactiveAp, setInteractiveAp] = useState(3);
  const [interactiveHp, setInteractiveHp] = useState(25);
  const [enemyHp, setEnemyHp] = useState(25);
  const [interactiveBlock, setInteractiveBlock] = useState(0);
  const [demoLog, setDemoLog] = useState('Interactive Sandbox Ready. Try playing a card below!');

  const step = TUTORIAL_STEPS[currentStepIndex];

  const handleNext = () => {
    sound.playMove();
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      resetDemo();
    } else {
      onStartGame();
    }
  };

  const handlePrev = () => {
    sound.playMove();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      resetDemo();
    }
  };

  const resetDemo = () => {
    setInteractiveAp(3);
    setInteractiveHp(25);
    setEnemyHp(25);
    setInteractiveBlock(0);
    setDemoLog('Sandbox reset. Select an action card!');
  };

  const handleDemoStrike = () => {
    if (interactiveAp < 1) return;
    sound.playAttackHit();
    setInteractiveAp((prev) => prev - 1);
    setEnemyHp((prev) => Math.max(0, prev - 8));
    setDemoLog('⚔️ You played [Swift Strike] dealing 8 damage to the opponent!');
  };

  const handleDemoGuard = () => {
    if (interactiveAp < 1) return;
    sound.playBlockClang();
    setInteractiveAp((prev) => prev - 1);
    setInteractiveBlock((prev) => prev + 7);
    setDemoLog('🛡️ You played [Iron Guard] gaining +7 Block to absorb incoming hits!');
  };

  const handleDemoSpecial = () => {
    if (interactiveAp < 2) return;
    sound.playSpellCast();
    setInteractiveAp((prev) => prev - 2);
    setEnemyHp((prev) => Math.max(0, prev - 15));
    setInteractiveHp((prev) => Math.min(30, prev + 5));
    setDemoLog('✨ You unleashed [Divine Smite]! Dealt 15 damage and healed +5 HP!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-slate-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold uppercase tracking-wider text-amber-400">
              Interactive Academy • Step {currentStepIndex + 1} of {TUTORIAL_STEPS.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 bg-slate-800 rounded-lg"
          >
            Skip to Game
          </button>
        </div>

        {/* Step Content */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
              {step.badge}
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-100">{step.title}</h2>
          </div>
          <p className="text-sm font-semibold text-amber-300">{step.headline}</p>

          <div className="mt-2 space-y-2 text-xs sm:text-sm text-slate-300">
            {step.instructions.map((ins, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Playground Box */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>LIVE INTERACTIVE PREVIEW</span>
            <button
              onClick={resetDemo}
              className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Sandbox Visuals */}
          <div className="flex items-center justify-around py-2 border-y border-slate-900">
            {/* Player Piece */}
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-slate-900 border border-amber-400/40 rounded-xl relative">
                <PieceArt type={currentStepIndex === 2 ? 'bishop' : 'pawn'} color="white" level={currentStepIndex === 3 ? 3 : 1} size="md" />
              </div>
              <span className="text-xs font-bold text-amber-200">You (White)</span>
              <span className="text-[11px] text-emerald-400">HP: {interactiveHp}/30</span>
              {interactiveBlock > 0 && <span className="text-[10px] text-blue-400">🛡️ {interactiveBlock} Block</span>}
            </div>

            <Swords className="w-6 h-6 text-red-400 animate-pulse" />

            {/* Enemy Piece */}
            <div className="flex flex-col items-center gap-1">
              <div className="p-2 bg-slate-900 border border-red-500/40 rounded-xl relative">
                <PieceArt type="knight" color="black" level={1} size="md" />
              </div>
              <span className="text-xs font-bold text-red-300">Enemy Knight</span>
              <span className="text-[11px] text-red-400">HP: {enemyHp}/25</span>
            </div>
          </div>

          {/* Interactive Card Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              disabled={interactiveAp < 1}
              onClick={handleDemoStrike}
              className="p-2 rounded-xl bg-slate-900 border border-red-500/50 hover:border-red-400 text-left transition-all active:scale-95 disabled:opacity-40"
            >
              <div className="flex justify-between items-center text-xs font-bold text-slate-100">
                <span>Strike</span>
                <span className="text-amber-400 font-mono text-[10px]">1 AP</span>
              </div>
              <div className="text-[10px] text-red-300">Deal 8 DMG</div>
            </button>

            <button
              disabled={interactiveAp < 1}
              onClick={handleDemoGuard}
              className="p-2 rounded-xl bg-slate-900 border border-blue-500/50 hover:border-blue-400 text-left transition-all active:scale-95 disabled:opacity-40"
            >
              <div className="flex justify-between items-center text-xs font-bold text-slate-100">
                <span>Guard</span>
                <span className="text-amber-400 font-mono text-[10px]">1 AP</span>
              </div>
              <div className="text-[10px] text-blue-300">+7 Block</div>
            </button>

            <button
              disabled={interactiveAp < 2}
              onClick={handleDemoSpecial}
              className="p-2 rounded-xl bg-slate-900 border border-amber-500/50 hover:border-amber-400 text-left transition-all active:scale-95 disabled:opacity-40"
            >
              <div className="flex justify-between items-center text-xs font-bold text-amber-200">
                <span>Smite</span>
                <span className="text-amber-400 font-mono text-[10px]">2 AP</span>
              </div>
              <div className="text-[10px] text-amber-300">15 DMG + Heal 5</div>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs px-2 py-1 bg-slate-900 rounded-lg text-slate-300">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-amber-400" /> AP Remaining: {interactiveAp}/3
            </span>
            <span className="text-slate-400 truncate max-w-[200px] text-[11px]">{demoLog}</span>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            disabled={currentStepIndex === 0}
            onClick={handlePrev}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex gap-1.5">
            {TUTORIAL_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStepIndex ? 'w-6 bg-amber-400' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
          >
            <span>{currentStepIndex === TUTORIAL_STEPS.length - 1 ? 'Start Game' : 'Next Step'}</span>
            {currentStepIndex === TUTORIAL_STEPS.length - 1 ? (
              <Play className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
