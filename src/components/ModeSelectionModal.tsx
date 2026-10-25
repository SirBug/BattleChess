import React, { useState } from 'react';
import { DifficultyMode, GameMode, PieceType, PlayerProfile } from '../types';
import {
  createNewPlayerProfile,
  deletePlayerProfile,
  formatPlayerDisplayName,
  getRankInfo,
  loadPlayerProfiles,
} from '../utils/storage';
import { BattleArtIllustration } from './BattleArtIllustration';
import { PieceArt } from './PieceArt';
import { sound } from '../utils/soundEffects';
import {
  Swords,
  Users,
  Bot,
  Plus,
  Trash2,
  Trophy,
  Award,
  Crown,
  Shield,
  Zap,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Sliders,
  ChevronRight,
  Flame,
} from 'lucide-react';

interface ModeSelectionModalProps {
  initialMode?: GameMode;
  currentMode?: GameMode;
  initialPlayer1Id?: string;
  currentP1Id?: string;
  initialPlayer2Id?: string | null;
  currentP2Id?: string | null;
  initialDifficulty?: DifficultyMode;
  difficulty?: DifficultyMode;
  profiles?: PlayerProfile[];
  onStartGame?: (
    mode: GameMode,
    player1Id: string,
    player2Id: string,
    difficulty: DifficultyMode
  ) => void;
  onConfirm?: (
    mode: GameMode,
    player1Id: string,
    player2Id: string | null,
    difficulty: DifficultyMode
  ) => void;
  onUpdateProfiles?: (updatedProfiles: PlayerProfile[]) => void;
  onClose?: () => void;
  isClosable?: boolean;
}

export const ModeSelectionModal: React.FC<ModeSelectionModalProps> = ({
  initialMode,
  currentMode,
  initialPlayer1Id,
  currentP1Id,
  initialPlayer2Id,
  currentP2Id,
  initialDifficulty,
  difficulty: incomingDifficulty,
  profiles: incomingProfiles,
  onStartGame,
  onConfirm,
  onUpdateProfiles,
  onClose,
  isClosable = true,
}) => {
  const profileList = (incomingProfiles && incomingProfiles.length > 0)
    ? incomingProfiles
    : loadPlayerProfiles();

  const modeToUse = initialMode || currentMode || 'pvai';
  const p1ToUse = initialPlayer1Id || currentP1Id || profileList[0]?.id || '';
  const p2ToUse = initialPlayer2Id || currentP2Id || profileList[1]?.id || profileList[0]?.id || '';
  const diffToUse = initialDifficulty || incomingDifficulty || 'adaptive';

  const [selectedMode, setSelectedMode] = useState<GameMode>(modeToUse);
  const [player1Id, setPlayer1Id] = useState<string>(
    profileList.some((p) => p.id === p1ToUse) ? p1ToUse : profileList[0]?.id || ''
  );
  const [player2Id, setPlayer2Id] = useState<string>(
    profileList.some((p) => p.id === p2ToUse) ? p2ToUse : profileList[1]?.id || profileList[0]?.id || ''
  );
  const [difficulty, setDifficulty] = useState<DifficultyMode>(diffToUse);

  // New Champion Creation Form State
  const [isCreatingPlayer, setIsCreatingPlayer] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerAvatar, setNewPlayerAvatar] = useState<PieceType>('knight');
  const [creationError, setCreationError] = useState<string>('');

  const handleCreateChampion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPlayerName.trim();
    if (!trimmed) {
      setCreationError('Please enter a champion name.');
      return;
    }
    if (trimmed.length > 18) {
      setCreationError('Name must be 18 characters or fewer.');
      return;
    }

    const created = createNewPlayerProfile(trimmed, newPlayerAvatar);
    const updated = [created, ...profileList];
    if (onUpdateProfiles) {
      onUpdateProfiles(updated);
    }
    sound.playLevelUp();

    // Auto select created champion
    if (!player1Id) {
      setPlayer1Id(created.id);
    } else if (selectedMode === 'pvp' && (!player2Id || player2Id === player1Id)) {
      setPlayer2Id(created.id);
    }

    setNewPlayerName('');
    setIsCreatingPlayer(false);
    setCreationError('');
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profileList.length <= 1) {
      alert('You must keep at least one champion profile.');
      return;
    }
    const updated = deletePlayerProfile(id);
    if (onUpdateProfiles) {
      onUpdateProfiles(updated);
    }
    if (player1Id === id) {
      setPlayer1Id(updated[0]?.id || '');
    }
    if (player2Id === id) {
      setPlayer2Id(updated[1]?.id || updated[0]?.id || '');
    }
  };

  const handleLaunch = () => {
    sound.playDuelClash();
    if (onConfirm) {
      onConfirm(selectedMode, player1Id, selectedMode === 'pvp' ? player2Id : null, difficulty);
    } else if (onStartGame) {
      onStartGame(selectedMode, player1Id, player2Id, difficulty);
    }
  };

  const p1Profile = profileList.find((p) => p.id === player1Id) || profileList[0];
  const p2Profile = profileList.find((p) => p.id === player2Id) || profileList[1] || profileList[0];

  const p1Rank = p1Profile ? getRankInfo(p1Profile.rating) : null;
  const p2Rank = p2Profile ? getRankInfo(p2Profile.rating) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto select-none">
      <div className="w-full max-w-4xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 text-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Artistic Hero Header with Battling Chess Figures */}
        <div className="relative rounded-2xl overflow-hidden border border-amber-500/30 shadow-lg">
          <BattleArtIllustration variant="hero" className="w-full h-36 sm:h-48" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4 sm:p-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-amber-500 text-slate-950 font-black rounded-md text-[10px] sm:text-xs tracking-wider uppercase">
                Combat Arena Setup
              </span>
              <span className="text-xs text-amber-300 font-bold hidden sm:inline">
                Ranked Tactical Chess Duel
              </span>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-100 drop-shadow-md">
              Choose Battlefield Mode & Champions
            </h1>
          </div>
        </div>

        {/* Step 1: Game Mode Selection Tabs */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-amber-400" />
            1. Select Battle Mode
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Solo vs AI Card */}
            <button
              type="button"
              id="mode-select-pvai"
              onClick={() => {
                setSelectedMode('pvai');
                sound.playCardWhoosh();
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                selectedMode === 'pvai'
                  ? 'bg-gradient-to-br from-amber-950/60 to-slate-900 border-amber-400 shadow-lg ring-2 ring-amber-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
              }`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  selectedMode === 'pvai'
                    ? 'bg-amber-500 text-slate-950 border-amber-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Bot className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm sm:text-base text-slate-100">
                    Player vs AI (Solo)
                  </span>
                  {selectedMode === 'pvai' && (
                    <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black rounded text-[10px]">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Command the Radiant White army against the computer-controlled Dread Black forces with dynamic card AI.
                </p>
                <div className="mt-2 text-[11px] text-amber-300/90 font-medium">
                  • Duel wins increase your Difficulty Rating & Rank Title
                </div>
              </div>
            </button>

            {/* 2-Player Hotseat Card */}
            <button
              type="button"
              id="mode-select-pvp"
              onClick={() => {
                setSelectedMode('pvp');
                sound.playCardWhoosh();
              }}
              className={`p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                selectedMode === 'pvp'
                  ? 'bg-gradient-to-br from-indigo-950/60 to-slate-900 border-indigo-400 shadow-lg ring-2 ring-indigo-400/40'
                  : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
              }`}
            >
              <div
                className={`p-3 rounded-xl border ${
                  selectedMode === 'pvp'
                    ? 'bg-indigo-500 text-white border-indigo-300'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm sm:text-base text-slate-100">
                    Two Player (Pass & Play)
                  </span>
                  {selectedMode === 'pvp' && (
                    <span className="px-2 py-0.5 bg-indigo-400 text-slate-950 font-black rounded text-[10px]">
                      SELECTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Two champions clash on the same screen! Each player commands their side on the board and in combat duels.
                </p>
                <div className="mt-2 text-[11px] text-indigo-300/90 font-medium">
                  • Both champions gain or lose Difficulty Rating and Titles
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: AI Calibration (If Solo Mode) */}
        {selectedMode === 'pvai' && (
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                AI Difficulty Engine
              </span>
              <span className="text-[11px] text-slate-400">
                Calibrates chess depth and card synergies
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(
                [
                  { id: 'adaptive', label: 'Adaptive MMR', sub: 'Dynamic AI' },
                  { id: 'easy', label: 'Recruit', sub: 'Novice Depth' },
                  { id: 'medium', label: 'Knight', sub: 'Balanced Depth' },
                  { id: 'hard', label: 'Grandmaster', sub: 'Lethal 3-Ply' },
                ] as const
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`p-2 rounded-xl border text-center transition-all ${
                    difficulty === lvl.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{lvl.label}</div>
                  <div className="text-[10px] text-slate-400">{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Champion Roster & Selection */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              2. Champion Roster & Rank Titles
            </label>

            <button
              type="button"
              onClick={() => setIsCreatingPlayer(!isCreatingPlayer)}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingPlayer ? 'Cancel' : 'New Champion'}</span>
            </button>
          </div>

          {/* New Champion Creation Form */}
          {isCreatingPlayer && (
            <form
              onSubmit={handleCreateChampion}
              className="p-4 bg-slate-950 border border-amber-500/50 rounded-2xl flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="text-xs font-black text-amber-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                CREATE NEW CHAMPION
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Champion Name (Rank Title is uneditable and granted by Difficulty Rating)
                  </label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="e.g. Lancelot, Athena, Caesar"
                    maxLength={18}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                  {creationError && (
                    <span className="text-[10px] text-red-400 font-bold mt-1 block">{creationError}</span>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Signature Crest Avatar
                  </label>
                  <div className="flex gap-2">
                    {(['knight', 'queen', 'king', 'bishop', 'rook', 'pawn'] as PieceType[]).map((piece) => (
                      <button
                        key={piece}
                        type="button"
                        onClick={() => setNewPlayerAvatar(piece)}
                        className={`p-1.5 rounded-xl border transition-all ${
                          newPlayerAvatar === piece
                            ? 'bg-amber-500/25 border-amber-400 ring-2 ring-amber-400/50'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <PieceArt type={piece} color="white" size="sm" showLevelBadge={false} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingPlayer(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md"
                >
                  Enroll Champion (Starts as Squire)
                </button>
              </div>
            </form>
          )}

          {/* Player Selection Dropdowns & Active Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Player 1 Card (White Side) */}
            <div className="p-3.5 bg-slate-950/80 border border-amber-500/40 rounded-2xl flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5" />
                  PLAYER 1 (Radiant White)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                  {selectedMode === 'pvp' ? 'Player 1' : 'You'}
                </span>
              </div>

              {/* Selector */}
              <select
                id="player-1-select"
                value={player1Id}
                onChange={(e) => setPlayer1Id(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                {profileList.map((p) => (
                  <option key={`p1-${p.id}`} value={p.id}>
                    {formatPlayerDisplayName(p)} (Rating: {p.rating})
                  </option>
                ))}
              </select>

              {/* Active Profile Snapshot */}
              {p1Profile && p1Rank && (
                <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-slate-800 rounded-lg border border-amber-400/40">
                      <PieceArt type={p1Profile.avatarPiece} color="white" size="sm" showLevelBadge={false} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${p1Rank.badgeBg} ${p1Rank.badgeText} ${p1Rank.borderColor}`}>
                          {p1Rank.icon} {p1Rank.title}
                        </span>
                        <span className="text-xs font-black text-slate-100">{p1Profile.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>Difficulty Level: <strong className="text-amber-300">{p1Profile.rating}</strong></span>
                        <span>•</span>
                        <span>{p1Profile.wins}W - {p1Profile.losses}L</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">Next Title</span>
                    <span className="text-[10px] text-slate-300 font-mono">
                      {p1Rank.tier < 6 ? `${p1Rank.progressPercent}% to next rank` : '⭐ Max Title'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Player 2 Card (Black Side in PvP) or AI Card */}
            {selectedMode === 'pvp' ? (
              <div className="p-3.5 bg-slate-950/80 border border-indigo-500/40 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5" />
                    PLAYER 2 (Dread Black)
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300">
                    Opponent Champion
                  </span>
                </div>

                {/* Selector */}
                <select
                  id="player-2-select"
                  value={player2Id}
                  onChange={(e) => setPlayer2Id(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs font-bold focus:outline-none focus:border-indigo-400"
                >
                  {profileList.map((p) => (
                    <option key={`p2-${p.id}`} value={p.id}>
                      {formatPlayerDisplayName(p)} (Rating: {p.rating})
                    </option>
                  ))}
                </select>

                {/* Active Profile Snapshot */}
                {p2Profile && p2Rank && (
                  <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-slate-800 rounded-lg border border-red-400/40">
                        <PieceArt type={p2Profile.avatarPiece} color="black" size="sm" showLevelBadge={false} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black border ${p2Rank.badgeBg} ${p2Rank.badgeText} ${p2Rank.borderColor}`}>
                            {p2Rank.icon} {p2Rank.title}
                          </span>
                          <span className="text-xs font-black text-slate-100">{p2Profile.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>Difficulty Level: <strong className="text-indigo-300">{p2Profile.rating}</strong></span>
                          <span>•</span>
                          <span>{p2Profile.wins}W - {p2Profile.losses}L</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">Next Title</span>
                      <span className="text-[10px] text-slate-300 font-mono">
                        {p2Rank.tier < 6 ? `${p2Rank.progressPercent}% to next rank` : '⭐ Max Title'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-slate-950/80 border border-red-500/40 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-black text-red-400 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      DREAD BLACK ARMY (AI Opponent)
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-red-950 border border-red-800 rounded text-red-300">
                      Computer AI
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    The Dread Black AI adapts its chess calculations and tactical card synergies to challenge your champion.
                  </p>
                </div>

                <div className="mt-3 p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <span>Engine Mode:</span>
                  <span className="font-black text-amber-300 capitalize">{difficulty} Mode</span>
                </div>
              </div>
            )}
          </div>

          {/* Full Player Roster Table */}
          <div className="mt-1 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>PERSISTED CHAMPIONS ROSTER ({profileList.length})</span>
              <span className="text-[11px] text-slate-500">Titles update dynamically based on rating</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
              {profileList.map((p) => {
                const rank = getRankInfo(p.rating);
                return (
                  <div
                    key={`roster-${p.id}`}
                    className="p-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-1.5"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <PieceArt type={p.avatarPiece} color="white" size="sm" showLevelBadge={false} />
                      <div className="overflow-hidden">
                        <div className="text-xs font-black text-slate-200 truncate">
                          <span className={`text-[10px] mr-1 ${rank.badgeText}`}>{rank.title}</span>
                          {p.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Rating: <span className="font-bold text-amber-300">{p.rating}</span> ({p.wins}W/{p.losses}L)
                        </div>
                      </div>
                    </div>

                    {profileList.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteProfile(p.id, e)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          {isClosable && onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 font-bold text-xs sm:text-sm text-slate-200 rounded-xl transition-colors"
            >
              Resume Current Game
            </button>
          ) : (
            <div className="text-xs text-slate-500">
              Ready to take command of the battlefield
            </div>
          )}

          <button
            type="button"
            id="start-battle-button"
            onClick={handleLaunch}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all active:scale-95 flex items-center gap-2"
          >
            <Swords className="w-4 h-4" />
            <span>Deploy to Battlefield</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
