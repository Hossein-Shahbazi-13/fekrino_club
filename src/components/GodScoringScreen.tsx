import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Crown, 
  Save, 
  RotateCcw, 
  History, 
  ShieldCheck, 
  Skull, 
  CheckCircle2, 
  Plus, 
  Minus, 
  Star, 
  BookOpen,
  ArrowRight,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  ScenarioType, 
  ModeratorAccount, 
  RegisteredPlayer, 
  GameOutcome, 
  PlayerScoreEntry, 
  SavedGameRecord,
  RoleKey
} from '../types/mafia';
import { SCENARIOS, ALL_ROLES } from '../data/scenarioData';
import { saveGameRecord } from '../data/moderators';
import { updateClubPlayersFromGameRecord, getClubPlayers } from '../data/clubPlayers';
import { saveMatchToCloud, savePlayerToCloud } from '../services/firestoreSync';
import { AssignedSeatPair } from '../utils/cryptoShuffle';
import { saveLiveGameState, loadLiveGameState } from '../utils/gameStateStorage';
import { LiveGameStatusChart } from './LiveGameStatusChart';

interface GodScoringScreenProps {
  moderator: ModeratorAccount;
  scenarioType: ScenarioType;
  playerCount: number;
  assignedSeats: AssignedSeatPair[];
  registeredPlayers: RegisteredPlayer[];
  onBackToDistribution: () => void;
  onStartNewGame: () => void;
  onOpenHistory: () => void;
  onOpenGuide: () => void;
  onOpenClubPlayers?: () => void;
}

export const GodScoringScreen: React.FC<GodScoringScreenProps> = ({
  moderator,
  scenarioType,
  playerCount,
  assignedSeats,
  registeredPlayers,
  onBackToDistribution,
  onStartNewGame,
  onOpenHistory,
  onOpenGuide,
  onOpenClubPlayers
}) => {
  const currentScenario = SCENARIOS[scenarioType] || SCENARIOS.BAZPORS;

  const [playerScores, setPlayerScores] = useState<PlayerScoreEntry[]>(() => {
    const saved = loadLiveGameState();
    if (saved?.scoringState?.playerScores && saved.scoringState.playerScores.length > 0) {
      return saved.scoringState.playerScores;
    }
    return assignedSeats.map((pair) => {
      const reg = registeredPlayers.find((p) => p.seatNumber === pair.seatNumber);
      return {
        seatNumber: pair.seatNumber,
        playerName: reg?.name || `صندلی ${pair.seatNumber}`,
        roleKey: pair.roleKey,
        score: 0,
        isBestPlayer: false,
        notes: '',
        playerId: reg?.playerId
      };
    }).sort((a, b) => a.seatNumber - b.seatNumber);
  });

  const [outcome, setOutcome] = useState<GameOutcome>(() => {
    const saved = loadLiveGameState();
    return saved?.scoringState?.outcome || 'CITIZEN_WIN';
  });

  const [generalNotes, setGeneralNotes] = useState<string>(() => {
    const saved = loadLiveGameState();
    return saved?.scoringState?.generalNotes || '';
  });

  const [aliveSeats, setAliveSeats] = useState<number[]>(() => {
    const saved = loadLiveGameState();
    if (saved?.scoringState?.aliveSeats && saved.scoringState.aliveSeats.length > 0) {
      return saved.scoringState.aliveSeats;
    }
    return assignedSeats.map((p) => p.seatNumber);
  });

  const [saveSuccessNotice, setSaveSuccessNotice] = useState<boolean>(false);

  useEffect(() => {
    saveLiveGameState({
      currentScreen: 'SCORING',
      scenarioType,
      playerCount,
      registeredPlayers,
      assignedSeats,
      scoringState: {
        playerScores,
        outcome,
        generalNotes,
        aliveSeats
      }
    });
  }, [playerScores, outcome, generalNotes, aliveSeats, scenarioType, playerCount, registeredPlayers, assignedSeats]);

  const handleToggleAlive = (seatNumber: number) => {
    setAliveSeats((prev) =>
      prev.includes(seatNumber)
        ? prev.filter((s) => s !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleScoreChange = (seatNumber: number, delta: number) => {
    setPlayerScores((prev) =>
      prev.map((entry) =>
        entry.seatNumber === seatNumber
          ? { ...entry, score: entry.score + delta }
          : entry
      )
    );
  };

  const handleManualScoreInput = (seatNumber: number, val: number) => {
    const numeric = isNaN(val) ? 0 : val;
    setPlayerScores((prev) =>
      prev.map((entry) =>
        entry.seatNumber === seatNumber
          ? { ...entry, score: numeric }
          : entry
      )
    );
  };

  const handleToggleBestPlayer = (seatNumber: number) => {
    setPlayerScores((prev) =>
      prev.map((entry) =>
        entry.seatNumber === seatNumber
          ? { ...entry, isBestPlayer: !entry.isBestPlayer }
          : { ...entry, isBestPlayer: false }
      )
    );
  };

  const handlePlayerNotesChange = (seatNumber: number, val: string) => {
    setPlayerScores((prev) =>
      prev.map((entry) =>
        entry.seatNumber === seatNumber
          ? { ...entry, notes: val }
          : entry
      )
    );
  };

  const bestPlayerEntry = playerScores.find((p) => p.isBestPlayer);

  const handleSaveGame = () => {
    const now = new Date();
    const dateFa = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now);
    const timeFa = new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(now);

    const record: SavedGameRecord = {
      id: `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: now.toISOString(),
      dateFa,
      timeFa,
      moderatorUsername: moderator.username,
      moderatorNameFa: moderator.nameFa,
      scenarioType,
      playerCount,
      outcome,
      bestPlayerName: bestPlayerEntry ? bestPlayerEntry.playerName : 'تعیین نشده',
      bestPlayerRole: bestPlayerEntry ? bestPlayerEntry.roleKey : ('CITIZEN_SIMPLE' as RoleKey),
      bestPlayerSeat: bestPlayerEntry ? bestPlayerEntry.seatNumber : 0,
      playerScores,
      generalNotes
    };

    saveGameRecord(record);
    saveMatchToCloud(record).catch((err) => console.warn('Cloud match save notice:', err));

    updateClubPlayersFromGameRecord(
      record.id,
      dateFa,
      timeFa,
      currentScenario.nameFa,
      playerScores,
      outcome,
      moderator.nameFa
    );

    const allPlayersAfterGame = getClubPlayers();
    for (const ps of playerScores) {
      const matchP = allPlayersAfterGame.find((p) => p.id === ps.playerId || p.name === ps.playerName);
      if (matchP) {
        savePlayerToCloud(matchP).catch((err) => console.warn('Cloud player sync notice:', err));
      }
    }

    setSaveSuccessNotice(true);
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe
    }
    setTimeout(() => setSaveSuccessNotice(false), 3000);
  };

  return (
    <div className="min-h-screen bg-wood-pattern text-[#faf6f0] flex flex-col justify-between max-w-xl mx-auto relative px-3 sm:px-4 py-3 select-none font-['Vazirmatn'] pb-safe" dir="rtl">
      {/* 1. TOP HEADER & SETTINGS */}
      <div className="w-full space-y-2.5 z-10">
        <div className="bg-wood-card rounded-2xl p-3 border border-[#523321] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToDistribution}
              title="بازگشت به کارت‌ها"
              className="p-2 rounded-xl bg-[#140804] hover:bg-[#250f08] border border-[#3d1f10] text-[#c9b7a2] hover:text-amber-300 cursor-pointer shadow"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <div>
              <div className="text-[11px] text-[#c9b7a2]">پنل هدایت و امتیازدهی گاد</div>
              <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <span>{moderator.nameFa}</span>
                <span className="text-[10px] text-amber-500/80 font-mono">({moderator.username})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenClubPlayers && (
              <button
                type="button"
                onClick={onOpenClubPlayers}
                className="px-2.5 py-1.5 rounded-xl bg-[#1c0c07] hover:bg-[#2b140b] border border-[#523321] text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
              >
                <Users className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">اعضا</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenHistory}
              className="px-2.5 py-1.5 rounded-xl bg-[#1c0c07] hover:bg-[#2b140b] border border-[#523321] text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تاریخچه</span>
            </button>

            <button
              type="button"
              onClick={onOpenGuide}
              className="p-2 rounded-xl bg-[#1c0c07] hover:bg-[#2b140b] border border-[#523321] text-amber-300 cursor-pointer shadow"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Outcome Selector */}
        <div className="bg-wood-card rounded-2xl p-3 border border-[#523321] shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-amber-300">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>نتیجه نهایی بازی {currentScenario.nameFa} ({playerCount} نفره):</span>
            </div>

            {bestPlayerEntry && (
              <div className="text-[11px] text-amber-300 font-bold flex items-center gap-1 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-400/40">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>MVP: {bestPlayerEntry.playerName}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setOutcome('CITIZEN_WIN')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all cursor-pointer ${
                outcome === 'CITIZEN_WIN'
                  ? 'bg-blue-900/90 text-cyan-300 border-cyan-400 shadow-md font-black'
                  : 'bg-[#140804] text-[#a89582] border-[#3d1f10] hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>برد شهروند</span>
            </button>

            <button
              type="button"
              onClick={() => setOutcome('MAFIA_WIN')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all cursor-pointer ${
                outcome === 'MAFIA_WIN'
                  ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-md font-black'
                  : 'bg-[#140804] text-[#a89582] border-[#3d1f10] hover:text-white'
              }`}
            >
              <Skull className="w-4 h-4" />
              <span>برد مافیا</span>
            </button>

            <button
              type="button"
              onClick={() => setOutcome('DRAW')}
              className={`py-2 px-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold border transition-all cursor-pointer ${
                outcome === 'DRAW'
                  ? 'bg-amber-600/90 text-white border-amber-300 shadow-md font-black'
                  : 'bg-[#140804] text-[#a89582] border-[#3d1f10] hover:text-white'
              }`}
            >
              <RotateCcw className="w-4 h-4" />
              <span>تساوی</span>
            </button>
          </div>
        </div>

        {/* Live Status Chart */}
        <LiveGameStatusChart
          playerScores={playerScores}
          aliveSeats={aliveSeats}
          onToggleAlive={handleToggleAlive}
        />
      </div>

      {/* 2. PLAYERS SCORING LIST */}
      <div className="my-3 space-y-2 max-h-[460px] overflow-y-auto pr-1 z-10">
        <div className="text-xs font-bold text-[#c9b7a2] px-1 flex items-center justify-between">
          <span>لیست صندلی‌ها و ثبت نمرات:</span>
          <span className="text-[11px] text-amber-400">ستاره را جهت تعیین برترین بازیکن بزنید</span>
        </div>

        {playerScores.map((entry) => {
          const roleDef = ALL_ROLES[entry.roleKey];
          const isMafia = roleDef?.side === 'MAFIA';
          const isAlive = aliveSeats.includes(entry.seatNumber);

          return (
            <div
              key={entry.seatNumber}
              className={`p-2.5 rounded-2xl border transition-all space-y-2 ${
                entry.isBestPlayer
                  ? 'bg-[#2b170c] border-amber-400/90 shadow-lg'
                  : 'bg-wood-card border-[#482816]'
              }`}
            >
              {/* Row 1: Seat, Name, Role, Alive status, MVP */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleAlive(entry.seatNumber)}
                    title={isAlive ? 'بازیکن زنده (کلیک برای حذف)' : 'بازیکن حذف‌شده (کلیک برای بازگردانی)'}
                    className={`w-7 h-7 rounded-lg font-mono font-black text-xs flex items-center justify-center cursor-pointer transition-all ${
                      isAlive
                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/70 shadow'
                        : 'bg-black/60 text-zinc-600 border border-zinc-700 line-through'
                    }`}
                  >
                    {entry.seatNumber}
                  </button>

                  <div>
                    <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                      <span className={!isAlive ? 'line-through opacity-70' : ''}>{entry.playerName}</span>
                      {entry.isBestPlayer && (
                        <span className="text-[10px] bg-amber-500 text-[#140a05] px-1 rounded font-black">
                          MVP
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                    isMafia 
                      ? 'bg-rose-950/80 text-rose-300 border-rose-600/50'
                      : 'bg-blue-950/80 text-cyan-300 border-cyan-600/50'
                  }`}>
                    {roleDef?.nameFa || entry.roleKey}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggleBestPlayer(entry.seatNumber)}
                    className={`p-1 rounded-lg border cursor-pointer transition-colors ${
                      entry.isBestPlayer
                        ? 'bg-amber-500 text-[#140a05] border-amber-300'
                        : 'bg-[#140804] text-[#786455] border-[#3d1f10] hover:text-amber-400'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              {/* Row 2: Score Stepper & Notes Input */}
              <div className="flex items-center gap-2 pt-1 border-t border-[#3d1f10]">
                <div className="flex items-center bg-[#140804] rounded-lg border border-[#3d1f10] p-0.5">
                  <button
                    type="button"
                    onClick={() => handleScoreChange(entry.seatNumber, -1)}
                    className="w-7 h-7 rounded-md bg-[#1f0d06] hover:bg-rose-950/70 text-rose-300 flex items-center justify-center font-bold cursor-pointer active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    value={entry.score}
                    onChange={(e) => handleManualScoreInput(entry.seatNumber, parseInt(e.target.value, 10))}
                    className="w-10 text-center bg-transparent font-mono font-black text-amber-300 text-xs sm:text-sm outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleScoreChange(entry.seatNumber, 1)}
                    className="w-7 h-7 rounded-md bg-[#1f0d06] hover:bg-emerald-950/70 text-emerald-300 flex items-center justify-center font-bold cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="text"
                  value={entry.notes || ''}
                  onChange={(e) => handlePlayerNotesChange(entry.seatNumber, e.target.value)}
                  placeholder="یادداشت داوری..."
                  className="flex-1 bg-black/40 border border-[#3d1f10] focus:border-amber-400 rounded-lg px-2.5 py-1 text-xs text-[#ded0be] placeholder-[#6b5a4e] outline-none"
                />
              </div>
            </div>
          );
        })}

        <div className="pt-1">
          <textarea
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            rows={2}
            placeholder="یادداشت و نکات کلی این دست بازی مافیا..."
            className="w-full bg-[#180c07] border border-[#442616] focus:border-amber-400 rounded-xl p-2.5 text-xs text-amber-100 placeholder-[#756456] outline-none"
          />
        </div>
      </div>

      {/* 3. BOTTOM ACTIONS: Save & New Game */}
      <div className="w-full space-y-2 pt-2 border-t border-[#482816] z-10">
        <AnimatePresence>
          {saveSuccessNotice && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-bold py-2 px-3 rounded-xl text-center shadow-lg flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>اطلاعات و نمرات با موفقیت در پایگاه ابری فایربیس ثبت شد!</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveGame}
            className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-[#140a05] font-black text-xs sm:text-sm shadow-xl shadow-amber-950/80 border border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>ثبت نهایی و ذخیره بازی</span>
          </button>

          <button
            type="button"
            onClick={onStartNewGame}
            className="py-3 px-4 rounded-2xl bg-[#241108] hover:bg-[#34180b] text-amber-300 font-bold text-xs sm:text-sm border border-[#523321] flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>بازی جدید</span>
          </button>
        </div>
      </div>
    </div>
  );
};
