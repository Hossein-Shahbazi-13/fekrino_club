import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Sparkles, 
  BookOpen, 
  LogOut, 
  History, 
  ArrowLeft, 
  Trash2, 
  UserCheck, 
  Shield,
  Layers,
  X,
  Star,
  Check,
  Crown
} from 'lucide-react';
import { ScenarioType, ModeratorAccount, RegisteredPlayer, ClubPlayer } from '../types/mafia';
import { SCENARIOS } from '../data/scenarioData';
import { getClubPlayers } from '../data/clubPlayers';
import { saveLiveGameState, loadLiveGameState } from '../utils/gameStateStorage';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';

interface PlayerRegistrationScreenProps {
  moderator: ModeratorAccount;
  initialScenario: ScenarioType;
  initialPlayerCount: number;
  onStartDistribution: (scenario: ScenarioType, count: number, players: RegisteredPlayer[]) => void;
  onOpenGuide: () => void;
  onOpenHistory: () => void;
  onLogout: () => void;
  onOpenClubPlayers?: () => void;
  onOpenAdmin?: () => void;
}

const DEFAULT_SAMPLE_NAMES = [
  'علی', 'مهسا', 'آرش', 'سارا', 'رضا', 'نیلوفر', 'امیر', 'الهام', 'حسین', 'مریم', 'پویا', 'پریا', 'سینا'
];

export const PlayerRegistrationScreen: React.FC<PlayerRegistrationScreenProps> = ({
  moderator,
  initialScenario,
  initialPlayerCount,
  onStartDistribution,
  onOpenGuide,
  onOpenHistory,
  onLogout,
  onOpenClubPlayers,
  onOpenAdmin
}) => {
  const [scenarioType, setScenarioType] = useState<ScenarioType>(() => {
    const saved = loadLiveGameState();
    return saved?.scenarioType || initialScenario;
  });
  const [playerCount, setPlayerCount] = useState<number>(() => {
    const saved = loadLiveGameState();
    return saved?.playerCount || initialPlayerCount;
  });
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    const saved = loadLiveGameState();
    if (saved?.registeredPlayers && saved.registeredPlayers.length > 0) {
      const names = Array.from({ length: 14 }, (_, i) => `بازیکن ${i + 1}`);
      saved.registeredPlayers.forEach((p) => {
        if (p.seatNumber >= 1 && p.seatNumber <= 14 && p.name) {
          names[p.seatNumber - 1] = p.name;
        }
      });
      return names;
    }
    return Array.from({ length: 14 }, (_, i) => `بازیکن ${i + 1}`);
  });
  const [seatPlayerIds, setSeatPlayerIds] = useState<(string | undefined)[]>(() => {
    const saved = loadLiveGameState();
    if (saved?.registeredPlayers && saved.registeredPlayers.length > 0) {
      const ids = Array.from({ length: 14 }, () => undefined as string | undefined);
      saved.registeredPlayers.forEach((p) => {
        if (p.seatNumber >= 1 && p.seatNumber <= 14) {
          ids[p.seatNumber - 1] = p.playerId;
        }
      });
      return ids;
    }
    return Array.from({ length: 14 }, () => undefined);
  });
  const [clubPlayers] = useState<ClubPlayer[]>(() => getClubPlayers());
  const [activeSeatDropdown, setActiveSeatDropdown] = useState<number | null>(null);

  useEffect(() => {
    const registered: RegisteredPlayer[] = Array.from({ length: playerCount }, (_, idx) => ({
      seatNumber: idx + 1,
      name: playerNames[idx]?.trim() || `صندلی ${idx + 1}`,
      playerId: seatPlayerIds[idx]
    }));
    saveLiveGameState({
      currentScreen: 'REGISTRATION',
      scenarioType,
      playerCount,
      registeredPlayers: registered
    });
  }, [playerNames, seatPlayerIds, playerCount, scenarioType]);

  const currentScenario = SCENARIOS[scenarioType] || SCENARIOS.BAZPORS;

  const handleNameChange = (index: number, val: string) => {
    setPlayerNames((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
    setSeatPlayerIds((prev) => {
      const copy = [...prev];
      copy[index] = undefined;
      return copy;
    });
  };

  const handleAssignClubPlayerToSeat = (player: ClubPlayer, seatIndex: number) => {
    setPlayerNames((prev) => {
      const copy = [...prev];
      copy[seatIndex] = player.name;
      return copy;
    });
    setSeatPlayerIds((prev) => {
      const copy = [...prev];
      for (let i = 0; i < copy.length; i++) {
        if (copy[i] === player.id) {
          copy[i] = undefined;
          setPlayerNames((pNames) => {
            const pCopy = [...pNames];
            pCopy[i] = `بازیکن ${i + 1}`;
            return pCopy;
          });
        }
      }
      copy[seatIndex] = player.id;
      return copy;
    });
    setActiveSeatDropdown(null);
  };

  const handleClearSeatClubPlayer = (seatIndex: number) => {
    setSeatPlayerIds((prev) => {
      const copy = [...prev];
      copy[seatIndex] = undefined;
      return copy;
    });
  };

  const handleAutoFillSampleNames = () => {
    setPlayerNames((prev) => {
      const copy = [...prev];
      for (let i = 0; i < playerCount; i++) {
        copy[i] = DEFAULT_SAMPLE_NAMES[i % DEFAULT_SAMPLE_NAMES.length];
      }
      return copy;
    });
    setSeatPlayerIds(Array.from({ length: 14 }, () => undefined));
  };

  const handleResetToDefaultNumbers = () => {
    setPlayerNames(Array.from({ length: 14 }, (_, i) => `بازیکن ${i + 1}`));
    setSeatPlayerIds(Array.from({ length: 14 }, () => undefined));
  };

  const handleClearAll = () => {
    setPlayerNames(Array.from({ length: 14 }, () => ''));
    setSeatPlayerIds(Array.from({ length: 14 }, () => undefined));
  };

  const handleQuickAssignToNextEmptySeat = (player: ClubPlayer) => {
    const currentSeatIdx = seatPlayerIds.findIndex((id) => id === player.id);
    if (currentSeatIdx !== -1) {
      handleClearSeatClubPlayer(currentSeatIdx);
      setPlayerNames((prev) => {
        const copy = [...prev];
        copy[currentSeatIdx] = `بازیکن ${currentSeatIdx + 1}`;
        return copy;
      });
      return;
    }

    let targetIdx = -1;
    for (let i = 0; i < playerCount; i++) {
      if (!seatPlayerIds[i] && (!playerNames[i] || playerNames[i].startsWith('بازیکن ') || playerNames[i].startsWith('صندلی '))) {
        targetIdx = i;
        break;
      }
    }
    if (targetIdx === -1) {
      for (let i = 0; i < playerCount; i++) {
        if (!seatPlayerIds[i]) {
          targetIdx = i;
          break;
        }
      }
    }
    if (targetIdx !== -1) {
      handleAssignClubPlayerToSeat(player, targetIdx);
    }
  };

  const handleFillFromClubPlayers = () => {
    const copyNames = [...playerNames];
    const copyIds = [...seatPlayerIds];
    const availableClub = [...clubPlayers];

    for (let i = 0; i < playerCount && i < availableClub.length; i++) {
      copyNames[i] = availableClub[i].name;
      copyIds[i] = availableClub[i].id;
    }

    setPlayerNames(copyNames);
    setSeatPlayerIds(copyIds);
  };

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const registered: RegisteredPlayer[] = Array.from({ length: playerCount }, (_, idx) => ({
      seatNumber: idx + 1,
      name: playerNames[idx]?.trim() || `صندلی ${idx + 1}`,
      playerId: seatPlayerIds[idx]
    }));
    onStartDistribution(scenarioType, playerCount, registered);
  };

  return (
    <div className="min-h-screen bg-wood-pattern text-[#faf6f0] flex flex-col justify-between max-w-xl mx-auto relative px-3 sm:px-4 py-3 select-none font-['Vazirmatn'] pb-safe" dir="rtl">
      {/* 1. TOP HEADER & MODERATOR BAR */}
      <div className="w-full space-y-2.5 z-10">
        <div className="bg-wood-card rounded-2xl p-3 border border-[#523321] flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400/80 bg-black p-0.5 shadow shrink-0">
              <img
                src={officialLogoImg}
                alt="فکری نو"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="text-[11px] text-[#c9b7a2]">میز گردانندگی کافه فکری نو</div>
              <div className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <span>{moderator.nameFa}</span>
                <span className="text-[10px] text-amber-500/80 font-mono">({moderator.username})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenAdmin && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow"
              >
                <Crown className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مدیریت</span>
              </button>
            )}

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

            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 cursor-pointer shadow"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scenario Switcher Tabs */}
        <div className="grid grid-cols-3 p-1 bg-wood-inset rounded-2xl border border-[#482816]">
          {(['BAZPORS', 'TAKAVER', 'NAMAYANDEH'] as ScenarioType[]).map((st) => {
            const sc = SCENARIOS[st];
            const isSelected = scenarioType === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => {
                  setScenarioType(st);
                  if (!sc.availablePlayerCounts.includes(playerCount)) {
                    setPlayerCount(sc.availablePlayerCounts[0]);
                  }
                }}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md font-black border border-amber-400/50'
                    : 'text-[#c9b7a2] hover:text-white'
                }`}
              >
                {sc.nameFa.replace('سناریو ', '')}
              </button>
            );
          })}
        </div>

        {/* Player Count Selector */}
        <div className="flex items-center justify-between bg-wood-card px-3.5 py-2 rounded-2xl border border-[#523321]">
          <span className="text-xs font-bold text-[#c9b7a2]">تعداد صندلی‌ها:</span>
          <div className="flex items-center gap-1.5">
            {currentScenario.availablePlayerCounts.map((cnt) => {
              const isSelected = playerCount === cnt;
              return (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setPlayerCount(cnt)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-[#140a05] shadow-md font-black border border-amber-300'
                      : 'bg-[#140804] text-[#a89582] border border-[#3d1f10] hover:text-white'
                  }`}
                >
                  <span>{cnt} نفره</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. REGISTRATION FORM & SEATS */}
      <form onSubmit={handleProceed} className="my-3 space-y-3 z-10 flex-1 flex flex-col justify-between">
        <div className="bg-wood-card rounded-3xl p-4 border border-[#523321] shadow-xl space-y-3">
          {/* Header & Quick Action Buttons */}
          <div className="flex items-center justify-between border-b border-[#482816] pb-2.5">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-black text-white">ثبت‌نام و اسامی صندلی‌ها</h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleAutoFillSampleNames}
                className="px-2 py-1 rounded-lg bg-[#140804] hover:bg-[#250f08] border border-[#3d1f10] text-[#c9b7a2] text-[10px] font-bold cursor-pointer"
              >
                نمونه
              </button>
              <button
                type="button"
                onClick={handleResetToDefaultNumbers}
                className="px-2 py-1 rounded-lg bg-[#140804] hover:bg-[#250f08] border border-[#3d1f10] text-[#c9b7a2] text-[10px] font-bold cursor-pointer"
              >
                شماره صندلی
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-2 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>حذف</span>
              </button>
            </div>
          </div>

          {/* Club Members Quick Select Shelf */}
          {clubPlayers.length > 0 && (
            <div className="bg-wood-inset rounded-2xl p-2.5 border border-[#482816] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>اعضای ثبت‌نامی باشگاه (لمس جهت انتخاب صندلی):</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillFromClubPlayers}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold cursor-pointer"
                >
                  پر کردن خودکار
                </button>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {clubPlayers.map((player) => {
                  const assignedSeatIdx = seatPlayerIds.findIndex((id) => id === player.id);
                  const isAssigned = assignedSeatIdx !== -1;

                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => handleQuickAssignToNextEmptySeat(player)}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 border cursor-pointer transition-colors ${
                        isAssigned
                          ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                          : 'bg-[#180c07] border-[#482816] text-[#e0c7a8] hover:border-amber-400'
                      }`}
                    >
                      <span>{player.name}</span>
                      {isAssigned && (
                        <span className="text-[10px] font-mono bg-emerald-900/80 px-1 rounded flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" />
                          ص{assignedSeatIdx + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-[#140804] rounded-xl p-2 text-right border border-[#3d1f10] flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#c9b7a2] leading-relaxed">
              اسامی ثبت‌شده فقط در پایان بازی و در پنل امتیازدهی گاد نمایش داده می‌شوند. در حین پخش کارت‌ها، فقط شماره صندلی نمایش داده خواهد شد.
            </p>
          </div>

          {/* Seats Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-1">
            {Array.from({ length: playerCount }, (_, idx) => {
              const seatNum = idx + 1;
              const assignedPlayerId = seatPlayerIds[idx];
              const isDropdownOpen = activeSeatDropdown === idx;

              return (
                <div
                  key={seatNum}
                  className="relative flex flex-col bg-wood-inset rounded-xl p-1.5 border border-[#482816] focus-within:border-amber-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#241108] border border-amber-600/50 flex items-center justify-center font-mono font-black text-amber-400 text-xs shrink-0 shadow">
                      {seatNum}
                    </div>

                    {assignedPlayerId && (
                      <div className="flex items-center gap-1 bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 px-1.5 py-0.5 rounded-lg text-[10px] font-bold shrink-0">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                        <span>عضو</span>
                        <button
                          type="button"
                          onClick={() => handleClearSeatClubPlayer(idx)}
                          className="hover:text-rose-400 cursor-pointer mr-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <input
                      type="text"
                      value={playerNames[idx] || ''}
                      onChange={(e) => handleNameChange(idx, e.target.value)}
                      placeholder={`نام بازیکن صندلی ${seatNum}`}
                      className="w-full bg-transparent text-xs text-white placeholder-[#786455] outline-none font-medium text-right h-8"
                    />

                    {clubPlayers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveSeatDropdown(isDropdownOpen ? null : idx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          assignedPlayerId 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-[#180c07] hover:bg-[#2b140b] text-[#c9b7a2] border border-[#523321]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown to pick club member for this seat */}
                  {isDropdownOpen && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#482816] max-h-36 overflow-y-auto space-y-1 bg-[#120704] p-1.5 rounded-lg z-20 shadow-xl">
                      <div className="text-[10px] text-amber-300 font-bold mb-1">
                        انتخاب عضو برای صندلی {seatNum}:
                      </div>
                      {clubPlayers.map((cp) => {
                        const isThisSeat = seatPlayerIds[idx] === cp.id;
                        return (
                          <button
                            key={cp.id}
                            type="button"
                            onClick={() => handleAssignClubPlayerToSeat(cp, idx)}
                            className={`w-full text-right px-2 py-1 rounded text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isThisSeat ? 'bg-amber-600/30 text-amber-300 font-black' : 'hover:bg-white/5 text-[#d6d3d1]'
                            }`}
                          >
                            <span>{cp.name}</span>
                            <span className="text-[10px] font-mono text-amber-300">
                              {isThisSeat ? 'انتخاب شده' : `${cp.totalScore} امتیاز`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. PROCEED CTA */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-[#140a05] font-black text-sm shadow-xl shadow-amber-950/80 border border-amber-300/90 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Layers className="w-5 h-5" />
          <span>تأیید و شروع پخش تصادفی کارت‌ها</span>
          <ArrowLeft className="w-4 h-4" />
        </button>
      </form>

      {/* Footer Branding */}
      <div className="text-center pt-1 text-[10px] text-[#8c796b] tracking-wider font-mono uppercase">
        FEKRI NO • OFFICIAL MAFIA GAME MODERATION SYSTEM
      </div>
    </div>
  );
};
