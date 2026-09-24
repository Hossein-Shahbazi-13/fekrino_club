import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Gamepad2, 
  Star, 
  LogOut, 
  Search, 
  Eye, 
  Crown, 
  Sparkles, 
  Flame, 
  BarChart3, 
  History,
  X,
  Phone,
  Moon,
  Sun,
  RefreshCw,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { ClubPlayer, SavedGameRecord } from '../types/mafia';
import { getClubPlayers } from '../data/clubPlayers';
import { getSavedGames } from '../data/moderators';
import { 
  subscribeToPlayers, 
  subscribeToMatches, 
  syncPlayersFromCloud, 
  syncMatchesFromCloud 
} from '../services/firestoreSync';
import { PlayerSkillBarChart } from './PlayerSkillBarChart';
import { useTheme } from '../context/ThemeContext';
import { maskPhoneNumber, sanitizeInput } from '../utils/securityUtils';
import { TableRowsSkeleton } from './LoadingSkeleton';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';

interface PlayerHallScreenProps {
  player: ClubPlayer;
  onLogout: () => void;
}

type HallTab = 'MY_STATS' | 'LEADERBOARD' | 'ALL_MATCHES';

export const PlayerHallScreen: React.FC<PlayerHallScreenProps> = ({ player, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<HallTab>('MY_STATS');
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [allPlayers, setAllPlayers] = useState<ClubPlayer[]>(() => getClubPlayers());
  const [savedGamesList, setSavedGamesList] = useState<SavedGameRecord[]>(() => getSavedGames());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'SCORE' | 'GAMES' | 'BEST_PLAYER'>('SCORE');
  const [inspectedPlayer, setInspectedPlayer] = useState<ClubPlayer | null>(null);

  useEffect(() => {
    const unsubP = subscribeToPlayers((freshList) => setAllPlayers(freshList));
    const unsubM = subscribeToMatches((freshMatches) => setSavedGamesList(freshMatches));
    return () => {
      unsubP();
      unsubM();
    };
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [freshPlayers, freshMatches] = await Promise.all([
        syncPlayersFromCloud(),
        syncMatchesFromCloud()
      ]);
      setAllPlayers(freshPlayers);
      setSavedGamesList(freshMatches);
    } catch (e) {
      console.warn('Sync notice:', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const handleTabChange = (newTab: HallTab) => {
    if (newTab === activeTab) return;
    setIsTabLoading(true);
    setActiveTab(newTab);
    setTimeout(() => setIsTabLoading(false), 200);
  };

  const currentPlayer = allPlayers.find((p) => p.id === player.id) || player;

  const filteredPlayers = allPlayers
    .filter((p) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'GAMES') return b.totalGames - a.totalGames;
      if (sortBy === 'BEST_PLAYER') return b.bestPlayerCount - a.bestPlayerCount;
      return b.totalScore - a.totalScore;
    });

  const rankedAll = [...allPlayers].sort((a, b) => b.totalScore - a.totalScore);
  const myRank = rankedAll.findIndex((p) => p.id === currentPlayer.id) + 1;

  const avgScore = currentPlayer.totalGames > 0 
    ? (currentPlayer.totalScore / currentPlayer.totalGames).toFixed(1) 
    : '0';

  return (
    <div className="min-h-screen bg-wood-pattern text-[#faf6f0] select-none font-['Vazirmatn'] relative pb-12" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#140804]/90 backdrop-blur-md border-b border-[#523321] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400/80 p-0.5 bg-black shrink-0">
              <img
                src={officialLogoImg}
                alt="فکری نو"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-amber-300">تالار بازی‌ها و رتبه‌بندی</span>
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/40">
                  فکری نو
                </span>
              </div>
              <div className="text-[11px] text-[#a89582] hidden sm:block">
                سامانه اختصاصی اعضای باشگاه و رده‌بندی فکری نو
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div 
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs font-bold"
              title="پایگاه داده ابری فعال"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>ابری فعال</span>
            </div>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-[#1c0c07] hover:bg-[#2b140b] border border-[#523321] text-amber-300 flex items-center justify-center cursor-pointer transition-colors shadow"
              title="بروزرسانی داده‌ها"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-[#1c0c07] hover:bg-[#2b140b] border border-[#523321] text-amber-300 flex items-center justify-center cursor-pointer transition-colors shadow"
              title="تغییر تم"
            >
              {theme === 'MAHOGANY' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 border border-rose-800/60 text-rose-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-5">
        {/* Hero Player Dossier Card */}
        <div className="bg-wood-card border border-[#523321] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentPlayer.avatarColor || 'from-amber-600 to-rose-700'} flex items-center justify-center text-white font-black text-2xl shadow-lg border-2 border-amber-400/40 shrink-0`}>
                {currentPlayer.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-white">{currentPlayer.name}</h1>
                  <span className="text-[11px] text-amber-300 font-bold bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 rounded-lg">
                    عضو رسمی باشگاه
                  </span>
                </div>
                <div className="text-xs text-[#c9b7a2] flex items-center gap-3 flex-wrap">
                  {currentPlayer.phone && (
                    <span className="font-mono text-[#d6c3aa]">{maskPhoneNumber(currentPlayer.phone)}</span>
                  )}
                  <span>·</span>
                  <span>رتبه باشگاه: <strong className="text-amber-400 font-mono font-bold">#{myRank || 1}</strong></span>
                  <span>·</span>
                  <span>میانگین امتیاز: <strong className="text-emerald-400 font-mono font-bold">{avgScore}</strong></span>
                </div>
              </div>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex items-center bg-[#140804] p-1 rounded-2xl border border-[#482816] text-xs font-bold self-start sm:self-center">
              <button
                onClick={() => handleTabChange('MY_STATS')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'MY_STATS'
                    ? 'bg-amber-500 text-[#140a05] shadow-md font-black'
                    : 'text-[#c9b7a2] hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>کارنامه من</span>
              </button>

              <button
                onClick={() => handleTabChange('LEADERBOARD')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'LEADERBOARD'
                    ? 'bg-amber-500 text-[#140a05] shadow-md font-black'
                    : 'text-[#c9b7a2] hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>رده‌بندی</span>
              </button>

              <button
                onClick={() => handleTabChange('ALL_MATCHES')}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ALL_MATCHES'
                    ? 'bg-amber-500 text-[#140a05] shadow-md font-black'
                    : 'text-[#c9b7a2] hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span>بازی‌های کافه</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: MY STATS */}
        {activeTab === 'MY_STATS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-wood-card border border-[#523321] shadow-md">
                <div className="text-xs font-bold text-[#c9b7a2] flex items-center justify-between">
                  <span>بازی‌های رسمی</span>
                  <Gamepad2 className="w-4 h-4 text-purple-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
                  {currentPlayer.totalGames}
                </div>
                <div className="text-[11px] text-[#a89582] mt-0.5">دست رسمی</div>
              </div>

              <div className="p-4 rounded-2xl bg-wood-card border border-[#523321] shadow-md">
                <div className="text-xs font-bold text-[#c9b7a2] flex items-center justify-between">
                  <span>مجموع امتیازات</span>
                  <Star className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {currentPlayer.totalScore > 0 ? `+${currentPlayer.totalScore}` : currentPlayer.totalScore}
                </div>
                <div className="text-[11px] text-[#a89582] mt-0.5">امتیاز ثبت‌شده</div>
              </div>

              <div className="p-4 rounded-2xl bg-wood-card border border-[#523321] shadow-md">
                <div className="text-xs font-bold text-[#c9b7a2] flex items-center justify-between">
                  <span>بست پلیر (MVP)</span>
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {currentPlayer.bestPlayerCount}
                </div>
                <div className="text-[11px] text-[#a89582] mt-0.5">بار انتخاب داوران</div>
              </div>

              <div className="p-4 rounded-2xl bg-wood-card border border-[#523321] shadow-md">
                <div className="text-xs font-bold text-[#c9b7a2] flex items-center justify-between">
                  <span>رتبه در باشگاه</span>
                  <Crown className="w-4 h-4 text-rose-400" />
                </div>
                <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-mono">
                  #{myRank || 1}
                </div>
                <div className="text-[11px] text-[#a89582] mt-0.5">از بین اعضای باشگاه</div>
              </div>
            </div>

            {/* D3 Skill Chart */}
            <div className="p-5 rounded-3xl bg-wood-card border border-[#523321] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-black text-white">نمودار مهارت در نقش‌های سناریو</h2>
                </div>
                <div className="text-xs text-[#a89582]">تحلیل رسمی عملکرد</div>
              </div>
              <PlayerSkillBarChart player={currentPlayer} />
            </div>

            {/* Match History */}
            <div className="p-5 rounded-3xl bg-wood-card border border-[#523321] shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-black text-white">سوابق بازی‌های شخصی من</h2>
                </div>
                <div className="text-xs text-amber-300 font-mono font-bold">
                  {currentPlayer.matchHistory.length} دست ثبت‌شده
                </div>
              </div>

              {currentPlayer.matchHistory.length === 0 ? (
                <div className="py-10 text-center text-[#8c796b] text-xs space-y-1">
                  <Gamepad2 className="w-8 h-8 text-amber-500/40 mx-auto mb-1" />
                  <div>هنوز دستی برای شما در سامانه رسمی باشگاه ثبت نشده است.</div>
                  <div className="text-[11px] text-[#5c4a3e]">
                    به محض پایان بازی و ثبت امتیاز توسط گاد، سوابق شما در اینجا نمایش داده می‌شود.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {currentPlayer.matchHistory.map((rec, idx) => (
                    <div
                      key={rec.gameId || idx}
                      className="p-3.5 rounded-2xl bg-[#1c0c08] border border-amber-950/60 hover:border-amber-600/40 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          rec.side === 'MAFIA'
                            ? 'bg-rose-950/90 text-rose-300 border border-rose-600/50'
                            : 'bg-blue-950/90 text-cyan-300 border border-cyan-600/50'
                        }`}>
                          {rec.seatNumber ? `ص${rec.seatNumber}` : '🎮'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">{rec.roleNameFa}</span>
                            {rec.isBestPlayer && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/50 text-amber-300 font-black flex items-center gap-1">
                                <Trophy className="w-3 h-3 text-amber-400" />
                                <span>MVP</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#8c796b] mt-0.5 flex items-center gap-2">
                            <span>{rec.scenarioNameFa}</span>
                            <span>•</span>
                            <span className="font-mono">{rec.dateFa}</span>
                            <span>•</span>
                            <span>گرداننده: <strong className="text-amber-300/90">{rec.moderatorNameFa}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left shrink-0">
                        <div className="text-sm font-black font-mono text-emerald-400">
                          {rec.pointsAwarded > 0 ? `+${rec.pointsAwarded}` : rec.pointsAwarded} امتیاز
                        </div>
                        <div className={`text-[10px] font-bold ${
                          rec.gameResult === 'CITIZEN_WIN' ? 'text-cyan-400' :
                          rec.gameResult === 'MAFIA_WIN' ? 'text-rose-400' : 'text-amber-300'
                        }`}>
                          {rec.gameResult === 'CITIZEN_WIN' ? 'برد شهروند' :
                           rec.gameResult === 'MAFIA_WIN' ? 'برد مافیا' : 'مساوی'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: LEADERBOARD */}
        {activeTab === 'LEADERBOARD' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-wood-card border border-[#523321] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-amber-500/80 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(sanitizeInput(e.target.value))}
                  placeholder="جستجوی نام بازیکن..."
                  className="w-full bg-[#100604] border border-[#523321] focus:border-amber-400 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-[#c9b7a2] self-end sm:self-center">
                <span>مرتب‌سازی:</span>
                <button
                  onClick={() => setSortBy('SCORE')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    sortBy === 'SCORE'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                      : 'border-white/5 text-[#a89582] hover:text-white'
                  }`}
                >
                  امتیاز کل
                </button>
                <button
                  onClick={() => setSortBy('GAMES')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    sortBy === 'GAMES'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                      : 'border-white/5 text-[#a89582] hover:text-white'
                  }`}
                >
                  بازی‌ها
                </button>
                <button
                  onClick={() => setSortBy('BEST_PLAYER')}
                  className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    sortBy === 'BEST_PLAYER'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow'
                      : 'border-white/5 text-[#a89582] hover:text-white'
                  }`}
                >
                  بست پلیر
                </button>
              </div>
            </div>

            <div className="bg-wood-card border border-[#523321] rounded-3xl overflow-hidden shadow-xl">
              {isTabLoading ? (
                <div className="p-6">
                  <TableRowsSkeleton rows={5} columns={5} />
                </div>
              ) : (
                <div className="divide-y divide-amber-950/40">
                  {filteredPlayers.length === 0 ? (
                    <div className="py-12 text-center text-[#8c796b] text-xs">
                      هیچ بازیکنی با این نام یافت نشد.
                    </div>
                  ) : (
                    filteredPlayers.map((p, index) => {
                      const isMe = p.id === currentPlayer.id;
                      return (
                        <div
                          key={p.id}
                          className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                            isMe ? 'bg-amber-950/30' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 text-center font-mono font-black text-xs">
                              {index === 0 ? '🥇 ۱' : index === 1 ? '🥈 ۲' : index === 2 ? '🥉 ۳' : `#${index + 1}`}
                            </div>

                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${p.avatarColor || 'from-amber-600 to-rose-700'} flex items-center justify-center text-white font-bold text-xs shadow`}>
                              {p.name.charAt(0)}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-white">{p.name}</span>
                                {isMe && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold">
                                    شما
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[#8c796b]">
                                {p.totalGames} بازی رسمی · {p.bestPlayerCount} بار MVP
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <div className="text-sm font-black font-mono text-emerald-400">
                                {p.totalScore > 0 ? `+${p.totalScore}` : p.totalScore}
                              </div>
                              <div className="text-[10px] text-[#8c796b]">امتیاز کل</div>
                            </div>

                            <button
                              onClick={() => setInspectedPlayer(p)}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white font-bold text-[11px] shadow border border-amber-400/50 flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">کارنامه</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: ALL MATCHES */}
        {activeTab === 'ALL_MATCHES' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-3xl bg-wood-card border border-[#523321] shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black text-white">آرشیو رسمی دست‌های برگزار شده در کافه فکری نو</h2>
              </div>
              <div className="text-xs text-amber-300 font-mono font-bold">
                {savedGamesList.length} بازی ثبت‌شده
              </div>
            </div>

            {savedGamesList.length === 0 ? (
              <div className="py-12 text-center text-[#8c796b] text-xs">
                هنوز هیچ بازی رسمی ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {savedGamesList.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-2xl bg-[#1c0c08] border border-amber-900/50 hover:border-amber-600/50 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-amber-950/60 pb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white">
                            سناریو {game.scenarioType} ({game.playerCount} نفره)
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            game.outcome === 'CITIZEN_WIN' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50' :
                            game.outcome === 'MAFIA_WIN' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' :
                            'bg-amber-950 text-amber-300 border border-amber-500/50'
                          }`}>
                            {game.outcome === 'CITIZEN_WIN' ? 'پیروزی شهروندان' :
                             game.outcome === 'MAFIA_WIN' ? 'پیروزی مافیا' : 'تساوی'}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8c796b] mt-0.5">
                          گرداننده: <strong className="text-amber-300">{game.moderatorNameFa}</strong> • تاریخ: <span className="font-mono">{game.dateFa}</span>
                        </div>
                      </div>

                      {game.bestPlayerName && (
                        <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                          <Trophy className="w-3.5 h-3.5 text-amber-400" />
                          <span>بست پلیر: {game.bestPlayerName}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {game.playerScores.map((ps) => (
                        <div
                          key={ps.seatNumber}
                          className="px-2 py-1 rounded-lg bg-[#140804] border border-amber-900/30 text-[10px] flex items-center gap-1.5"
                        >
                          <span className="font-mono text-[#a89582]">ص{ps.seatNumber}:</span>
                          <span className="font-bold text-white">{ps.playerName}</span>
                          <span className="font-mono text-emerald-400 font-bold">({ps.score > 0 ? `+${ps.score}` : ps.score})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* INSPECT PLAYER DOSSIER MODAL */}
      <AnimatePresence>
        {inspectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#180c08] border border-amber-500/60 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#482816] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${inspectedPlayer.avatarColor || 'from-amber-600 to-rose-700'} flex items-center justify-center text-white font-black text-sm shadow`}>
                    {inspectedPlayer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base">{inspectedPlayer.name}</h3>
                    <div className="text-xs text-[#a89582]">کارنامه رسمی بازیکن در باشگاه</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectedPlayer(null)}
                  className="p-1.5 rounded-xl bg-[#140804] border border-[#3d1f10] text-[#a89582] hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-[#120704] rounded-xl border border-[#3d1f10]">
                  <div className="text-xs text-[#a89582]">تعداد بازی</div>
                  <div className="text-lg font-black text-white font-mono mt-1">{inspectedPlayer.totalGames}</div>
                </div>
                <div className="p-3 bg-[#120704] rounded-xl border border-[#3d1f10]">
                  <div className="text-xs text-[#a89582]">مجموع امتیاز</div>
                  <div className="text-lg font-black text-emerald-400 font-mono mt-1">{inspectedPlayer.totalScore}</div>
                </div>
                <div className="p-3 bg-[#120704] rounded-xl border border-[#3d1f10]">
                  <div className="text-xs text-[#a89582]">بار MVP</div>
                  <div className="text-lg font-black text-amber-300 font-mono mt-1">{inspectedPlayer.bestPlayerCount}</div>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold text-white mb-2">نمودار مهارت در نقش‌ها:</div>
                <PlayerSkillBarChart player={inspectedPlayer} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
