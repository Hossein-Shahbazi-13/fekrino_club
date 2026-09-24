import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Crown, 
  Users, 
  History, 
  BarChart3, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  UserX, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Award, 
  Flame, 
  LogOut, 
  Play, 
  FileText, 
  Phone, 
  ChevronDown, 
  Eye, 
  Sparkles, 
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Moon,
  Sun,
  Palette,
  Download,
  Upload,
  ShieldAlert,
  RefreshCw,
  Lock,
  Cloud
} from 'lucide-react';
import { ModeratorAccount, ClubPlayer, SavedGameRecord } from '../types/mafia';
import { 
  getPendingModerators, 
  getApprovedModerators, 
  approveModerator, 
  rejectModerator, 
  deleteModerator, 
  getSavedGames, 
  deleteGameRecord 
} from '../data/moderators';
import { 
  getClubPlayers, 
  registerClubPlayer, 
  deleteClubPlayer, 
  adjustClubPlayerScore 
} from '../data/clubPlayers';
import { 
  savePlayerToCloud, 
  deletePlayerFromCloud, 
  syncPlayersFromCloud, 
  syncMatchesFromCloud 
} from '../services/firestoreSync';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { PlayerSkillBarChart } from './PlayerSkillBarChart';
import { ConfirmModal } from './ConfirmModal';
import { useTheme } from '../context/ThemeContext';
import { 
  sanitizeInput, 
  generateSystemBackupJSON, 
  restoreSystemDataFromJSON, 
  maskPhoneNumber 
} from '../utils/securityUtils';
import { 
  StatCardSkeleton, 
  TableRowsSkeleton, 
  ModeratorCardsSkeleton, 
  InlineSpinner 
} from './LoadingSkeleton';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';

interface AdminDashboardScreenProps {
  adminAccount: ModeratorAccount;
  onEnterGame: () => void;
  onLogout: () => void;
}

type AdminTab = 'OVERVIEW' | 'MODERATORS' | 'PLAYERS' | 'GAMES';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  adminAccount,
  onEnterGame,
  onLogout
}) => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Live state from storage
  const [pendingMods, setPendingMods] = useState<ModeratorAccount[]>(() => getPendingModerators());
  const [approvedMods, setApprovedMods] = useState<ModeratorAccount[]>(() => getApprovedModerators());
  const [clubPlayers, setClubPlayers] = useState<ClubPlayer[]>(() => getClubPlayers());
  const [savedGames, setSavedGames] = useState<SavedGameRecord[]>(() => getSavedGames());

  // Player search & filters
  const [playerSearchQuery, setPlayerSearchQuery] = useState<string>('');
  
  // Modals state
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerPhone, setNewPlayerPhone] = useState<string>('');

  const [adjustScorePlayer, setAdjustScorePlayer] = useState<ClubPlayer | null>(null);
  const [scoreDelta, setScoreDelta] = useState<number>(5);
  const [scoreNote, setScoreNote] = useState<string>('جایزه تورنمنت');

  const [inspectedGame, setInspectedGame] = useState<SavedGameRecord | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<ClubPlayer | null>(null);

  // In-app confirm modal state (works reliably inside iframes)
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Status message notification banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Refresh all state from storage
  const reloadData = () => {
    setPendingMods(getPendingModerators());
    setApprovedMods(getApprovedModerators());
    setClubPlayers(getClubPlayers());
    setSavedGames(getSavedGames());
  };

  const handleTabChange = (tab: AdminTab) => {
    if (tab === activeTab) return;
    setIsDataLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsDataLoading(false);
    }, 220);
  };

  const handleManualRefresh = async () => {
    setIsDataLoading(true);
    try {
      await Promise.all([syncPlayersFromCloud(), syncMatchesFromCloud()]);
    } catch (e) {
      console.warn('Sync notice:', e);
    }
    reloadData();
    setIsDataLoading(false);
    showToast('کلیه سوابق و جداول با پایگاه ابری فایربیس همگام شدند.');
  };

  // Backup & Restore Handlers
  const handleDownloadBackup = () => {
    try {
      const json = generateSystemBackupJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fekri_no_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('نسخه پشتیبان پایگاه داده با موفقیت دانلود شد.');
    } catch (e) {
      console.error('Backup error:', e);
      showToast('خطا در تهیه نسخه پشتیبان.');
    }
  };

  const handleRestoreBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setConfirmModalState({
          isOpen: true,
          title: 'بازیابی اطلاعات از فایل پشتیبان',
          message: 'آیا اطمینان دارید؟ با بارگذاری این فایل، تمامی داده‌ها با اطلاعات نسخه پشتیبان جایگزین خواهند شد.',
          onConfirm: () => {
            const res = restoreSystemDataFromJSON(content);
            showToast(res.message);
            if (res.success) {
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
            setConfirmModalState(null);
          }
        });
      }
    };
    reader.readAsText(file);
  };

  // Moderator actions
  const handleApproveMod = (username: string, nameFa: string) => {
    const res = approveModerator(username);
    if (res.success) {
      showToast(`دسترسی گردانندگی «${nameFa}» تایید و فعال شد.`);
      reloadData();
    }
  };

  const handleRejectMod = (username: string, nameFa: string) => {
    const res = rejectModerator(username);
    if (res.success) {
      showToast(`درخواست گردانندگی «${nameFa}» رد شد.`);
      reloadData();
    }
  };

  const handleDeleteMod = (username: string, nameFa: string) => {
    setConfirmModalState({
      isOpen: true,
      title: `حذف گرداننده «${nameFa}»`,
      message: `آیا از حذف دسترسی و حساب گردانندگی «${nameFa}» (${username}) اطمینان دارید؟ این عملیات غیرقابل بازگشت است.`,
      onConfirm: () => {
        const res = deleteModerator(username);
        if (res.success) {
          showToast(`گرداننده «${nameFa}» از سیستم حذف شد.`);
          reloadData();
        } else {
          showToast(res.error || 'خطا در حذف حساب گرداننده.');
        }
        setConfirmModalState(null);
      }
    });
  };

  // Player actions
  const handleCreatePlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeInput(newPlayerName);
    const cleanPhone = sanitizeInput(newPlayerPhone);
    if (!cleanName.trim()) return;
    const res = registerClubPlayer(cleanName, cleanPhone);
    if (res.success && res.player) {
      savePlayerToCloud(res.player).catch(err => console.warn('Cloud player save notice:', err));
      showToast(`بازیکن جدید «${res.player.name}» با موفقیت ثبت و در پایگاه ابری ذخیره شد.`);
      setNewPlayerName('');
      setNewPlayerPhone('');
      setIsAddPlayerOpen(false);
      reloadData();
    }
  };

  const handleDeletePlayer = (id: string, name: string) => {
    setConfirmModalState({
      isOpen: true,
      title: `حذف بازیکن «${name}»`,
      message: `آیا از حذف کامل بازیکن «${name}» از سیستم و پایگاه ابری اطمینان دارید؟ کلیه نمرات و سوابق این بازیکن حذف خواهد شد.`,
      onConfirm: () => {
        deleteClubPlayer(id);
        deletePlayerFromCloud(id).catch(err => console.warn('Cloud player delete notice:', err));
        showToast(`بازیکن «${name}» با موفقیت از سیستم و سرور ابری حذف شد.`);
        reloadData();
        setConfirmModalState(null);
      }
    });
  };

  const handleAdjustScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustScorePlayer) return;
    adjustClubPlayerScore(adjustScorePlayer.id, scoreDelta, scoreNote);
    const refreshed = getClubPlayers().find(p => p.id === adjustScorePlayer.id);
    if (refreshed) {
      savePlayerToCloud(refreshed).catch(err => console.warn('Cloud score adjust notice:', err));
    }
    showToast(`امتیاز بازیکن «${adjustScorePlayer.name}» با موفقیت اعمال و در پایگاه ابری به‌روزرسانی شد.`);
    setAdjustScorePlayer(null);
    reloadData();
  };

  const handleDeleteGame = (gameId: string) => {
    setConfirmModalState({
      isOpen: true,
      title: 'حذف گزارش بازی',
      message: 'آیا از حذف قطعی این گزارش بازی از آرشیو نتایج و پایگاه ابری اطمینان دارید؟',
      onConfirm: () => {
        deleteGameRecord(gameId);
        deleteDoc(doc(db, 'matches', gameId)).catch(err => console.warn('Cloud match delete notice:', err));
        showToast('سابقه بازی مورد نظر با موفقیت حذف شد.');
        reloadData();
        setConfirmModalState(null);
      }
    });
  };

  // KPI Calculations
  const totalGamesCount = savedGames.length;
  const citizenWins = savedGames.filter(g => g.outcome === 'CITIZEN_WIN').length;
  const mafiaWins = savedGames.filter(g => g.outcome === 'MAFIA_WIN').length;
  const citizenWinRate = totalGamesCount > 0 ? Math.round((citizenWins / totalGamesCount) * 100) : 0;
  const mafiaWinRate = totalGamesCount > 0 ? Math.round((mafiaWins / totalGamesCount) * 100) : 0;

  // Filtered players
  const filteredPlayers = clubPlayers.filter(p => {
    const q = playerSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );
  });

  // Strict Admin Privilege Access Guard
  if (!adminAccount || !adminAccount.isAdmin) {
    return (
      <div className="min-h-screen bg-[#090403] text-white flex items-center justify-center p-4 font-['Vazirmatn']" dir="rtl">
        <div className="max-w-md w-full p-6 rounded-3xl bg-[#140805] border border-rose-600/50 text-center space-y-4 shadow-2xl">
          <ShieldAlert className="w-12 h-12 mx-auto text-rose-500 animate-pulse" />
          <h2 className="text-xl font-black text-rose-300">دسترسی مسدود است (۴۰۳)</h2>
          <p className="text-xs text-[#bda996] leading-relaxed">
            این پنل نیازمند سطح دسترسی مدیر ارشد کافه فکری نو می‌باشد. دسترسی‌های حساب جاری تایید نشد.
          </p>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            خروج از حساب
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0403] text-[#faf6f0] font-['Vazirmatn'] relative pb-16" dir="rtl">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-amber-600/10 via-rose-950/15 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header & Admin Credentials Bar */}
      <header className="sticky top-0 z-30 bg-[#120704]/90 backdrop-blur-md border-b border-amber-600/30 px-4 py-3 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand & Admin Identity */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 p-0.5 bg-gradient-to-br from-amber-500 to-amber-800 shrink-0 shadow-md">
              <img
                src={officialLogoImg}
                alt="فکری نو"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full bg-black"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400">PANEL DI CONTROLLO</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] text-rose-300 font-bold flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-300" />
                  <span>مدیر کل سایت</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>اداره و مدیریت کل کافه فکری نو</span>
                <span className="text-xs font-mono text-amber-300 font-normal">({adminAccount.username})</span>
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Live Cloud Status */}
            <div 
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold shadow-sm"
              title="اتصال دوطرفه به پایگاه ابری فایربیس فعال است"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>پایگاه ابری فعال</span>
            </div>

            {/* Color Palette Switcher: Mahogany vs Night Indigo */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'MAHOGANY' ? 'تغییر به تم حالت شب عمیق (ایندیگو)' : 'تغییر به تم چوب ماهوگانی (کلاسیک)'}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'NIGHT_INDIGO'
                  ? 'bg-indigo-950/80 border-indigo-400 text-indigo-200'
                  : 'bg-[#2b160b] border-amber-600/40 text-amber-200'
              }`}
            >
              {theme === 'MAHOGANY' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">تم: شب ایندیگو</span>
                </>
              ) : (
                <>
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">تم: چوب ماهوگانی</span>
                </>
              )}
            </button>

            {/* Refresh Data Button with Spinner */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isDataLoading}
              title="تازه‌سازی و همگام‌سازی فوری داده‌ها"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-amber-300 border border-amber-900/40 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDataLoading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button
              onClick={onEnterGame}
              className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-300 text-[#140703] text-xs font-black shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>ورود به میز بازی</span>
            </button>

            <button
              onClick={onLogout}
              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 text-rose-200 text-xs font-bold shadow flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 pt-5 space-y-5">
        {/* Toast Alert */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="p-3.5 bg-gradient-to-r from-emerald-950 to-[#0e1f14] border-2 border-emerald-500/70 rounded-2xl text-emerald-200 text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-[#140805] rounded-2xl border border-amber-900/60 shadow-lg">
          <button
            onClick={() => handleTabChange('OVERVIEW')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md border border-amber-400/50'
                : 'text-[#a89582] hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>دیده‌بانی و آمار کلان</span>
          </button>

          <button
            onClick={() => handleTabChange('MODERATORS')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 relative cursor-pointer ${
              activeTab === 'MODERATORS'
                ? 'bg-gradient-to-r from-rose-700 to-amber-700 text-white shadow-md border border-rose-400/50'
                : 'text-[#a89582] hover:text-white hover:bg-white/5'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            <span>مدیریت گردانندگان</span>
            {pendingMods.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-black text-[10px] font-black animate-bounce shadow">
                {pendingMods.length} جدید
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('PLAYERS')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'PLAYERS'
                ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md border border-purple-400/50'
                : 'text-[#a89582] hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300" />
            <span>باشگاه بازیکنان ({clubPlayers.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('GAMES')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'GAMES'
                ? 'bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-md border border-amber-400/50'
                : 'text-[#a89582] hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4 text-amber-300" />
            <span>آرشیو و نظارت بر بازی‌ها ({savedGames.length})</span>
          </button>
        </div>

        {/* ============================================================= */}
        {/* TAB 1: EXECUTIVE OVERVIEW & KPIS                              */}
        {/* ============================================================= */}
        {activeTab === 'OVERVIEW' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Total Matches */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c0c08] to-[#120603] border border-amber-600/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-[#a89582] text-xs font-bold mb-2">
                  <span>مجموع بازی‌های ثبت شده</span>
                  <History className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 font-mono">
                  {totalGamesCount}
                </div>
                <div className="text-[11px] text-[#8c796b] mt-1">تعداد دست‌های برگزار شده کافه</div>
              </div>

              {/* Pending Approvals */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg relative overflow-hidden ${
                pendingMods.length > 0 
                  ? 'bg-gradient-to-br from-amber-950/80 to-[#2a1306] border-amber-500/80' 
                  : 'bg-gradient-to-br from-[#1c0c08] to-[#120603] border-amber-600/40'
              }`}>
                <div className="flex items-center justify-between text-[#a89582] text-xs font-bold mb-2">
                  <span>درخواست‌های گاد جدید</span>
                  <Clock className={`w-4 h-4 ${pendingMods.length > 0 ? 'text-amber-400 animate-spin' : 'text-amber-400'}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono flex items-center gap-2">
                  <span>{pendingMods.length}</span>
                  {pendingMods.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-bold">نیاز به تایید مدیر</span>
                  )}
                </div>
                <div className="text-[11px] text-amber-300/80 mt-1">
                  {pendingMods.length > 0 ? 'جهت بررسی به برگه گردانندگان بروید' : 'درخواستی در انتظار نیست'}
                </div>
              </div>

              {/* Club Players */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c0c08] to-[#120603] border border-amber-600/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-[#a89582] text-xs font-bold mb-2">
                  <span>اعضای رسمی باشگاه</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">
                  {clubPlayers.length}
                </div>
                <div className="text-[11px] text-[#8c796b] mt-1">بازیکنان رسمی باشگاه</div>
              </div>

              {/* Active Gods */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1c0c08] to-[#120603] border border-amber-600/40 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between text-[#a89582] text-xs font-bold mb-2">
                  <span>گردانندگان تایید شده</span>
                  <Crown className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-rose-300 font-mono">
                  {approvedMods.length}
                </div>
                <div className="text-[11px] text-[#8c796b] mt-1">کادر رسمی و مجاز قضاوت</div>
              </div>
            </div>

            {/* Middle Section: Win Rate Comparison & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Win Rate Stats Card */}
              <div className="p-5 rounded-3xl bg-[#140805] border border-amber-900/60 space-y-4">
                <h2 className="text-sm font-black text-amber-200 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-400" />
                  <span>آمار بالانس بازی‌ها (نرخ پیروزی)</span>
                </h2>

                <div className="space-y-3">
                  {/* Citizen win */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-300">پیروزی شهروندان</span>
                      <span className="font-mono text-emerald-400">{citizenWins} دست ({citizenWinRate}٪)</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${citizenWinRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Mafia win */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-rose-300">پیروزی مافیا</span>
                      <span className="font-mono text-rose-400">{mafiaWins} دست ({mafiaWinRate}٪)</span>
                    </div>
                    <div className="h-2.5 w-full bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-600 to-amber-600 rounded-full transition-all duration-500"
                        style={{ width: `${mafiaWinRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-[#a89582] border-t border-amber-900/40">
                  این آمار از روی نتایج نهایی ثبت شده توسط گردانندگان محاسبه می‌شود.
                </div>
              </div>

              {/* Hall of Fame - Top 3 Best Players */}
              <div className="lg:col-span-2 p-5 rounded-3xl bg-[#140805] border border-amber-900/60 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black text-amber-200 flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>تالار افتخارات کافه فکری نو (Top Players)</span>
                  </h2>
                  <span className="text-[11px] text-amber-400 font-mono">HALL OF FAME</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[...clubPlayers]
                    .sort((a, b) => b.totalScore - a.totalScore)
                    .slice(0, 3)
                    .map((p, idx) => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-gradient-to-b from-[#1f0f0a] to-[#120704] border border-amber-600/40 text-center space-y-1 relative"
                      >
                        <div className="absolute top-2 right-2 text-xs font-black font-mono text-amber-400/60">
                          #{idx + 1}
                        </div>
                        <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center font-black text-sm text-black shadow">
                          {p.name.charAt(0)}
                        </div>
                        <div className="font-black text-sm text-white truncate">{p.name}</div>
                        <div className="text-[10px] text-amber-300/80">{p.totalGames} بازی رسمی</div>
                        <div className="pt-1 flex items-center justify-center gap-3 text-xs font-mono">
                          <span className="text-emerald-400 font-bold">{p.totalScore} امتیاز</span>
                          <span className="text-amber-300 font-bold">🏆 {p.bestPlayerCount}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* System Security & Backup Hub */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#140805] to-[#1c0a06] border-2 border-amber-600/40 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Lock className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <span>مرکز امنیت و پشتیبان‌گیری کلان (Backup & Security Hub)</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-bold">
                        سامانه محافظتی فعال
                      </span>
                    </h2>
                    <p className="text-xs text-[#a89582]">
                      تهیه نسخه پشتیبان دوره‌ای و بازیابی آسان داده‌ها جهت حفاظت در برابر حذف تصادفی یا خرابی دیتابیس
                    </p>
                  </div>
                </div>

                {/* Backup & Restore Action Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadBackup}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs shadow flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود نسخه پشتیبان (JSON)</span>
                  </button>

                  <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 flex items-center gap-2 transition-all cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>بازیابی از فایل</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleRestoreBackupFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Security Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/30 flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-emerald-300">سپر ضد تزریق داده (XSS)</div>
                    <div className="text-[10px] text-[#8c796b]">ورودی‌ها پاکسازی و ایمن می‌شوند</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-amber-300">محافظ ضد حملات نفوذ (Rate Limit)</div>
                    <div className="text-[10px] text-[#8c796b]">قفل خودکار پس از ۵ تلاش ناموفق</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                  <div className="text-xs">
                    <div className="font-bold text-purple-300">حفاظت حریم خصوصی (Privacy)</div>
                    <div className="text-[10px] text-[#8c796b]">شماره‌های تماس کاربران ماسک می‌شوند</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* TAB 2: MODERATORS & APPROVALS                                 */}
        {/* ============================================================= */}
        {activeTab === 'MODERATORS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Section A: Pending Approvals */}
            <div className="p-5 rounded-3xl bg-[#140805] border-2 border-amber-600/60 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-900/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">
                      درخواست‌های در انتظار تایید صلاحیت ({pendingMods.length})
                    </h2>
                    <p className="text-xs text-[#a89582]">
                      متقاضیانی که فرم ثبت‌نام گاد را ارسال کرده‌اند و منتظر تایید مدیر هستند.
                    </p>
                  </div>
                </div>
              </div>

              {pendingMods.length === 0 ? (
                <div className="py-8 text-center text-[#8c796b] text-xs font-medium">
                  در حال حاضر هیچ درخواستی در صف انتظار قرار ندارد.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pendingMods.map((mod) => (
                    <div
                      key={mod.username}
                      className="p-4 rounded-2xl bg-[#1d0d08] border border-amber-500/50 space-y-3 shadow-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-base font-black text-amber-200">{mod.nameFa}</div>
                          <div className="text-xs font-mono text-amber-400/80">@{mod.username}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                          در انتظار تایید
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-xs text-[#c9b7a2]">
                        {mod.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-400" />
                            <span dir="ltr">{mod.phone}</span>
                          </div>
                        )}
                        {mod.bio && (
                          <div className="flex items-start gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span className="text-[#a89582]">{mod.bio}</span>
                          </div>
                        )}
                        {mod.requestedAt && (
                          <div className="text-[10px] text-[#705e50]">
                            تاریخ ارسال: {new Date(mod.requestedAt).toLocaleDateString('fa-IR')}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Approve vs Reject */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-900/30">
                        <button
                          onClick={() => handleApproveMod(mod.username, mod.nameFa)}
                          className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-black shadow flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>تایید و فعال‌سازی</span>
                        </button>

                        <button
                          onClick={() => handleRejectMod(mod.username, mod.nameFa)}
                          className="py-2 px-3 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-600/40 text-xs font-bold shadow flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>رد درخواست</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Approved Active Moderators */}
            <div className="p-5 rounded-3xl bg-[#140805] border border-amber-900/60 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-black text-white">
                    کادر رسمی گردانندگان ({approvedMods.length})
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {approvedMods.map((mod) => (
                  <div
                    key={mod.username}
                    className="p-4 rounded-2xl bg-[#1a0c07] border border-amber-700/40 space-y-2 relative"
                  >
                    {mod.isAdmin && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-rose-950 border border-rose-500/50 text-rose-300 text-[10px] font-bold">
                        مدیر کل
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${mod.avatarColor || 'from-amber-500 to-rose-600'} flex items-center justify-center text-white font-black shadow`}>
                        {mod.nameFa.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">{mod.nameFa}</div>
                        <div className="text-xs font-mono text-amber-400">@{mod.username}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#bda996]">{mod.titleFa || 'گرداننده بازی'}</div>

                    {/* Delete mod button (except Super Admin) */}
                    {!mod.isAdmin && (
                      <div className="pt-2 border-t border-amber-900/30 flex justify-end">
                        <button
                          onClick={() => handleDeleteMod(mod.username, mod.nameFa)}
                          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>حذف گرداننده</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* TAB 3: CLUB PLAYERS MANAGEMENT                                */}
        {/* ============================================================= */}
        {activeTab === 'PLAYERS' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Action Bar: Search & Add Player */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-[#140805] border border-amber-900/60">
              {/* Search Box */}
              <div className="relative flex-1 min-w-[240px]">
                <Search className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={playerSearchQuery}
                  onChange={(e) => setPlayerSearchQuery(e.target.value)}
                  placeholder="جستجوی نام بازیکن..."
                  className="w-full bg-[#1b0c08] border border-[#523321] focus:border-amber-400 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-white outline-none"
                />
              </div>

              {/* Add Player Button */}
              <button
                onClick={() => setIsAddPlayerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white text-xs sm:text-sm font-black shadow flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن دستی بازیکن جدید</span>
              </button>
            </div>

            {/* Players Table / List */}
            <div className="overflow-x-auto rounded-3xl border border-amber-900/60 bg-[#140805] shadow-xl">
              {isDataLoading ? (
                <div className="p-6">
                  <TableRowsSkeleton rows={6} columns={7} />
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1c0c08] border-b border-amber-900/60 text-[#a89582] font-bold">
                    <tr>
                      <th className="p-3.5 text-center">نشان</th>
                      <th className="p-3.5">نام بازیکن</th>
                      <th className="p-3.5">شماره تماس (محافظت شده)</th>
                      <th className="p-3.5 text-center">تعداد بازی</th>
                      <th className="p-3.5 text-center">مجموع امتیاز</th>
                      <th className="p-3.5 text-center">بست پلیر</th>
                      <th className="p-3.5 text-center">عملیات مدیر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/30">
                    {filteredPlayers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-[#8c796b]">
                          هیچ بازیکنی مطابق با جستجو یافت نشد.
                        </td>
                      </tr>
                    ) : (
                      filteredPlayers.map((player) => (
                        <tr key={player.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 text-center">
                            <div className="w-7 h-7 mx-auto rounded-lg bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-xs shadow">
                              {player.name.charAt(0)}
                            </div>
                          </td>
                          <td className="p-3.5 font-black text-white">
                            {player.name}
                          </td>
                          <td className="p-3.5 font-mono text-[#a89582]" dir="ltr">
                            {player.phone ? maskPhoneNumber(player.phone) : '—'}
                          </td>
                        <td className="p-3.5 text-center font-mono font-bold text-white">
                          {player.totalGames}
                        </td>
                        <td className="p-3.5 text-center font-mono font-black text-emerald-400">
                          {player.totalScore}
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-amber-300">
                          🏆 {player.bestPlayerCount}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Inspect Match History */}
                            <button
                              onClick={() => setInspectedPlayer(player)}
                              title="مشاهده کارنامه بازی‌ها"
                              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Adjust Points */}
                            <button
                              onClick={() => {
                                setAdjustScorePlayer(player);
                                setScoreDelta(5);
                                setScoreNote('جایزه تورنمنت');
                              }}
                              title="تنظیم امتیاز (+/-)"
                              className="p-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Player */}
                            <button
                              onClick={() => handleDeletePlayer(player.id, player.name)}
                              title="حذف بازیکن"
                              className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            </div>
          </motion.div>
        )}

        {/* ============================================================= */}
        {/* TAB 4: GAMES ARCHIVE & OVERSIGHT                              */}
        {/* ============================================================= */}
        {activeTab === 'GAMES' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="p-4 rounded-2xl bg-[#140805] border border-amber-900/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white">آرشیو جامع دست‌های برگزار شده</h2>
                <p className="text-xs text-[#a89582]">نظارت بر قضاوت گردانندگان، امتیازات داده شده و نتایج سناریوها</p>
              </div>
              <span className="text-xs font-mono font-black text-amber-300 px-3 py-1 bg-amber-500/20 rounded-xl border border-amber-500/40">
                {savedGames.length} بازی ثبت شده
              </span>
            </div>

            {isDataLoading ? (
              <div className="p-6 rounded-3xl bg-[#140805] border border-amber-900/60">
                <TableRowsSkeleton rows={4} columns={6} />
              </div>
            ) : savedGames.length === 0 ? (
              <div className="p-12 text-center text-[#8c796b] text-xs font-medium rounded-3xl bg-[#140805] border border-amber-900/40">
                هنوز هیچ بازی در سامانه ثبت نهایی نشده است. پس از پایان دست در پنل گاد و ثبت امتیازات، بازی‌ها در این بخش پایش می‌شوند.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {savedGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-4 rounded-2xl bg-[#180905] border border-amber-700/40 hover:border-amber-500/60 space-y-3 transition-colors shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm font-black text-white">{game.scenarioType}</div>
                        <div className="text-xs text-amber-400/90 font-medium">
                          گرداننده: <strong className="text-white">{game.moderatorNameFa}</strong>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-black shadow ${
                        game.outcome === 'CITIZEN_WIN'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/60'
                          : game.outcome === 'MAFIA_WIN'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-500/60'
                      }`}>
                        {game.outcome === 'CITIZEN_WIN' ? 'برد شهروند' : game.outcome === 'MAFIA_WIN' ? 'برد مافیا' : 'مساوی'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#a89582] border-t border-amber-900/30 pt-2">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>{game.dateFa}</span>
                        <span>•</span>
                        <span>{game.timeFa}</span>
                      </div>
                      <div>{game.playerCount} نفره</div>
                    </div>

                    {game.bestPlayerName && (
                      <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>بست پلیر بازی: <strong>{game.bestPlayerName}</strong> (صندلی {game.bestPlayerSeat})</span>
                      </div>
                    )}

                    {/* Inspection & Delete controls */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => setInspectedGame(game)}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>مشاهده جزئیات صندلی‌ها</span>
                      </button>

                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف دست</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ============================================================= */}
      {/* MODAL 1: ADD PLAYER DIRECTLY                                  */}
      {/* ============================================================= */}
      <AnimatePresence>
        {isAddPlayerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#180a06] border-2 border-purple-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-purple-400" />
                  <span>ثبت مستقیم بازیکن در باشگاه</span>
                </h3>
                <button
                  onClick={() => setIsAddPlayerOpen(false)}
                  className="text-[#a89582] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlayerSubmit} className="space-y-3 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d4c3b0]">نام و نام خانوادگی بازیکن</label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="مثال: کیانوش اسدی..."
                    className="w-full bg-[#100604] border border-[#523321] focus:border-purple-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d4c3b0]">شماره تلفن همراه</label>
                  <input
                    type="tel"
                    value={newPlayerPhone}
                    onChange={(e) => setNewPlayerPhone(e.target.value)}
                    placeholder="۰۹۱۲..."
                    dir="ltr"
                    className="w-full bg-[#100604] border border-[#523321] focus:border-purple-400 rounded-xl px-3 py-2 text-sm text-white outline-none font-mono"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddPlayerOpen(false)}
                    className="px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-xs font-bold text-[#c9b7a2]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow cursor-pointer"
                  >
                    ثبت و صدور شناسه PL
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 2: ADJUST SCORE (+/-)                                   */}
      {/* ============================================================= */}
      <AnimatePresence>
        {adjustScorePlayer && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#180a06] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-white">تنظیم دستی امتیاز بازیکن</h3>
                  <div className="text-xs text-amber-300 font-bold">{adjustScorePlayer.name} ({adjustScorePlayer.id})</div>
                </div>
                <button
                  onClick={() => setAdjustScorePlayer(null)}
                  className="text-[#a89582] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustScoreSubmit} className="space-y-3 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d4c3b0]">تغییر امتیاز (مثبت برای پاداش، منفی برای کسر)</label>
                  <input
                    type="number"
                    value={scoreDelta}
                    onChange={(e) => setScoreDelta(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#100604] border border-[#523321] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d4c3b0]">علت یا توضیح (ثبت در کارنامه)</label>
                  <input
                    type="text"
                    value={scoreNote}
                    onChange={(e) => setScoreNote(e.target.value)}
                    placeholder="مثال: جایزه تورنمنت، کسر انضباطی..."
                    className="w-full bg-[#100604] border border-[#523321] focus:border-amber-400 rounded-xl px-3 py-2 text-sm text-white outline-none"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustScorePlayer(null)}
                    className="px-4 py-2 rounded-xl bg-black/40 text-xs font-bold text-[#c9b7a2]"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black text-xs font-black shadow cursor-pointer"
                  >
                    ثبت و اعمال تغییر امتیاز
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 3: INSPECT FULL GAME SCORECARD                          */}
      {/* ============================================================= */}
      <AnimatePresence>
        {inspectedGame && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#180905] border-2 border-amber-600/70 rounded-3xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>گزارش کامل دست: {inspectedGame.scenarioType}</span>
                    <span className="text-xs font-mono text-amber-300">({inspectedGame.dateFa} - {inspectedGame.timeFa})</span>
                  </h3>
                  <div className="text-xs text-[#a89582]">گاد قضاوت‌کننده: <strong className="text-white">{inspectedGame.moderatorNameFa}</strong></div>
                </div>
                <button
                  onClick={() => setInspectedGame(null)}
                  className="p-1 rounded-lg text-[#a89582] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scorecard Table */}
              <div className="overflow-x-auto rounded-2xl border border-amber-900/50 bg-black/40">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#120603] text-[#a89582] font-bold">
                    <tr>
                      <th className="p-2.5">صندلی</th>
                      <th className="p-2.5">نام بازیکن</th>
                      <th className="p-2.5">نقش</th>
                      <th className="p-2.5 text-center">امتیاز دست</th>
                      <th className="p-2.5 text-center">وضعیت بست</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-900/30">
                    {inspectedGame.playerScores.map((score) => (
                      <tr key={score.seatNumber} className={score.isBestPlayer ? 'bg-amber-950/30' : ''}>
                        <td className="p-2.5 font-mono font-bold text-amber-400">
                          صندلی {score.seatNumber}
                        </td>
                        <td className="p-2.5 font-bold text-white">
                          {score.playerName}
                        </td>
                        <td className="p-2.5 text-[#c9b7a2]">
                          {score.roleKey}
                        </td>
                        <td className="p-2.5 text-center font-mono font-black text-emerald-400">
                          {score.score > 0 ? `+${score.score}` : score.score}
                        </td>
                        <td className="p-2.5 text-center">
                          {score.isBestPlayer && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              🏆 بست پلیر
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectedGame(null)}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-black font-bold text-xs"
                >
                  بستن گزارش
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================= */}
      {/* MODAL 4: INSPECT PLAYER'S MATCH HISTORY                       */}
      {/* ============================================================= */}
      <AnimatePresence>
        {inspectedPlayer && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#180905] border-2 border-purple-500/70 rounded-3xl p-5 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>کارنامه رسمی و مهارت‌های {inspectedPlayer.name}</span>
                  </h3>
                  <div className="text-xs text-purple-300">
                    مجموع {inspectedPlayer.totalGames} دست • {inspectedPlayer.totalScore} امتیاز کل
                  </div>
                </div>
                <button
                  onClick={() => setInspectedPlayer(null)}
                  className="p-1 rounded-lg text-[#a89582] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* D3 Player Skills Bar Chart */}
              <PlayerSkillBarChart player={inspectedPlayer} />

              {/* Match History List */}
              <div className="space-y-2">
                {inspectedPlayer.matchHistory.length === 0 ? (
                  <div className="p-8 text-center text-[#8c796b] text-xs">
                    هنوز دستی برای این بازیکن ثبت نشده است.
                  </div>
                ) : (
                  inspectedPlayer.matchHistory.map((m, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/40 border border-amber-900/30 text-xs space-y-1"
                    >
                      <div className="font-medium text-white leading-relaxed">
                        {m.summaryTextFa || `در تاریخ ${m.dateFa} ${inspectedPlayer.name} ${m.pointsAwarded} امتیاز`}
                      </div>
                      <div className="text-[10px] text-[#8c796b] flex items-center justify-between">
                        <span>{m.scenarioNameFa} • نقش: {m.roleNameFa}</span>
                        <span>گاد: {m.moderatorNameFa}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setInspectedPlayer(null)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  بستن کارنامه
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* In-app confirmation modal (reliable within iframes) */}
      <ConfirmModal
        isOpen={!!confirmModalState?.isOpen}
        title={confirmModalState?.title || 'تایید عملیات'}
        message={confirmModalState?.message || 'آیا از انجام این عملیات اطمینان دارید؟'}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        onConfirm={() => confirmModalState?.onConfirm()}
        onCancel={() => setConfirmModalState(null)}
      />
    </div>
  );
};
