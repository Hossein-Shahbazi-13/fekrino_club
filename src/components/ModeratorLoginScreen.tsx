import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  User, 
  LogIn, 
  Crown, 
  Eye, 
  EyeOff, 
  UserPlus, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  FileText, 
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { ModeratorAccount, ClubPlayer } from '../types/mafia';
import { 
  validateModeratorCredentials, 
  registerNewModerator 
} from '../data/moderators';
import { 
  registerClubPlayer, 
  validatePlayerCredentials, 
  setStoredPlayerSession 
} from '../data/clubPlayers';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';

interface ModeratorLoginScreenProps {
  onLoginSuccess: (account: ModeratorAccount) => void;
  onPlayerLoginSuccess?: (player: ClubPlayer) => void;
}

type MainView = 'LOGIN' | 'CREATE_ACCOUNT';
type AccountType = 'MODERATOR' | 'PLAYER';
type LoginPortal = 'PLAYER' | 'STAFF';

export const ModeratorLoginScreen: React.FC<ModeratorLoginScreenProps> = ({ 
  onLoginSuccess,
  onPlayerLoginSuccess 
}) => {
  const [view, setView] = useState<MainView>('LOGIN');
  const [loginPortal, setLoginPortal] = useState<LoginPortal>('PLAYER');
  const [accountType, setAccountType] = useState<AccountType>('PLAYER');

  // Staff Login
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);

  // Player Login
  const [playerLoginInput, setPlayerLoginInput] = useState<string>('');
  const [playerLoginPassword, setPlayerLoginPassword] = useState<string>('');
  const [showPlayerLoginPass, setShowPlayerLoginPass] = useState<boolean>(false);

  // Moderator Signup
  const [modName, setModName] = useState<string>('');
  const [modUsername, setModUsername] = useState<string>('');
  const [modPassword, setModPassword] = useState<string>('');
  const [modConfirmPassword, setModConfirmPassword] = useState<string>('');
  const [modPhone, setModPhone] = useState<string>('');
  const [modBio, setModBio] = useState<string>('');
  const [showModPassword, setShowModPassword] = useState<boolean>(false);
  const [omertaAccepted, setOmertaAccepted] = useState<boolean>(true);

  // Player Signup
  const [playerName, setPlayerName] = useState<string>('');
  const [playerPhone, setPlayerPhone] = useState<string>('');
  const [playerSignupPassword, setPlayerSignupPassword] = useState<string>('');
  const [playerSignupConfirmPass, setPlayerSignupConfirmPass] = useState<string>('');
  const [showPlayerSignupPass, setShowPlayerSignupPass] = useState<boolean>(false);

  // Feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const [createdPlayer, setCreatedPlayer] = useState<ClubPlayer | null>(null);

  // Quick autofill for Super Admin
  const handleQuickAdminLogin = () => {
    setLoginPortal('STAFF');
    setLoginUsername('Hossein_Mad');
    setLoginPassword('@Maryam_1382');
    setErrorMsg(null);
  };

  // Quick autofill for sample player
  const handleQuickPlayerLogin = (phone: string, pass: string = '123456') => {
    setLoginPortal('PLAYER');
    setPlayerLoginInput(phone);
    setPlayerLoginPassword(pass);
    setErrorMsg(null);
  };

  const handleStaffLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingNotice(null);

    if (!loginUsername.trim() || !loginPassword.trim()) {
      setErrorMsg('لطفاً نام کاربری و رمز عبور را وارد کنید.');
      return;
    }

    const res = validateModeratorCredentials(loginUsername, loginPassword);
    if (res.success && res.account) {
      setSuccessMsg(`خوش آمدید، ${res.account.nameFa}! در حال ورود به پنل...`);
      setTimeout(() => {
        onLoginSuccess(res.account!);
      }, 400);
    } else if (res.isPending) {
      setPendingNotice(res.error || 'حساب شما در صف تأیید مدیر کل سایت قرار دارد.');
    } else {
      setErrorMsg(res.error || 'نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  const handlePlayerLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingNotice(null);

    if (!playerLoginInput.trim() || !playerLoginPassword.trim()) {
      setErrorMsg('لطفاً شماره همراه یا نام بازیکن و رمز عبور را وارد کنید.');
      return;
    }

    const res = validatePlayerCredentials(playerLoginInput, playerLoginPassword);
    if (res.success && res.player) {
      setStoredPlayerSession(res.player);
      setSuccessMsg(`خوش آمدید، ${res.player.name}! در حال ورود به تالار بازی‌ها...`);
      setTimeout(() => {
        onPlayerLoginSuccess?.(res.player!);
      }, 400);
    } else {
      setErrorMsg(res.error || 'شماره همراه یا رمز عبور اشتباه است.');
    }
  };

  const handleModeratorSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingNotice(null);

    if (!modName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی گرداننده را وارد کنید.');
      return;
    }
    if (!modUsername.trim() || modUsername.trim().length < 3) {
      setErrorMsg('نام کاربری باید حداقل ۳ کاراکتر انگلیسی و بدون فاصله باشد.');
      return;
    }
    if (!modPassword.trim() || modPassword.trim().length < 3) {
      setErrorMsg('رمز عبور باید حداقل ۳ نویسه باشد.');
      return;
    }
    if (modPassword !== modConfirmPassword) {
      setErrorMsg('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }
    if (!omertaAccepted) {
      setErrorMsg('پذیرش سوگند بی‌طرفی الزامی است.');
      return;
    }

    const res = registerNewModerator(modName, modUsername, modPassword, modPhone, modBio);
    if (res.success) {
      setPendingNotice(
        `درخواست گردانندگی برای «${modName.trim()}» با موفقیت ثبت شد.\nبه محض تایید مدیر کل (Hossein_Mad) امکان ورود فعال خواهد شد.`
      );
      setModName('');
      setModUsername('');
      setModPassword('');
      setModConfirmPassword('');
      setModPhone('');
      setModBio('');
    } else {
      setErrorMsg(res.error || 'خطا در ثبت نام.');
    }
  };

  const handlePlayerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setPendingNotice(null);
    setCreatedPlayer(null);

    if (!playerName.trim()) {
      setErrorMsg('لطفاً نام و نام خانوادگی بازیکن را وارد کنید.');
      return;
    }
    if (!playerPhone.trim()) {
      setErrorMsg('شماره همراه جهت عضویت و ورود الزامی است.');
      return;
    }
    if (!playerSignupPassword.trim() || playerSignupPassword.length < 4) {
      setErrorMsg('رمز عبور باید حداقل ۴ رقم یا حرف باشد.');
      return;
    }
    if (playerSignupPassword !== playerSignupConfirmPass) {
      setErrorMsg('رمز عبور و تکرار آن یکسان نیستند.');
      return;
    }

    const res = registerClubPlayer(playerName, playerPhone, playerSignupPassword);
    if (res.success && res.player) {
      setCreatedPlayer(res.player);
      setStoredPlayerSession(res.player);
      setSuccessMsg(`بازیکن گرامی «${res.player.name}»، حساب شما ساخته شد.`);
      setPlayerName('');
      setPlayerPhone('');
      setPlayerSignupPassword('');
      setPlayerSignupConfirmPass('');
    } else {
      setErrorMsg(res.error || 'خطا در عضویت بازیکن.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-[#f5f5f4] flex flex-col justify-center items-center px-4 py-8 select-none font-['Vazirmatn'] relative overflow-x-hidden" dir="rtl">
      {/* Subtle Warm Canvas Ambience */}
      <div className="absolute top-0 inset-x-0 h-80 bg-gradient-to-b from-amber-900/15 to-transparent pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-950/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Elevated Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-[#181412] border border-[#29221d] rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 space-y-6"
      >
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-500/80 bg-black p-0.5 shadow-lg">
              <img
                src={officialLogoImg}
                alt="کافه فکر نو"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest text-amber-500 uppercase font-mono">
              FEKRI NO • MAFIA CLUB
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
              {view === 'LOGIN' ? 'باشگاه بازی‌های فکری نو' : 'عضویت در باشگاه'}
            </h1>
            <p className="text-xs text-[#a8a29e] mt-1 font-medium">
              {view === 'LOGIN' 
                ? 'مشاهده کارنامه، رده‌بندی و پنل هدایت بازی' 
                : 'انتخاب نوع کاربری و ثبت‌نام در سامانه'}
            </p>
          </div>
        </div>

        {/* Feedback Notifications */}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-rose-950/60 border border-rose-800/60 rounded-2xl text-rose-200 text-xs font-semibold flex items-center gap-2.5 text-right"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </motion.div>
        )}

        {pendingNotice && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-amber-950/60 border border-amber-700/60 rounded-2xl text-amber-100 text-xs font-semibold flex items-start gap-2.5 text-right"
          >
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="text-amber-400 font-bold">در انتظار تأیید مدیر کل</div>
              <p className="text-amber-200/90 whitespace-pre-line leading-relaxed">{pendingNotice}</p>
            </div>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-emerald-950/60 border border-emerald-700/60 rounded-2xl text-emerald-200 text-xs font-semibold flex items-center gap-2.5 text-right"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </motion.div>
        )}

        {/* VIEW 1: LOGIN */}
        {view === 'LOGIN' ? (
          <div className="space-y-5">
            {/* Segmented Control: Player vs Staff */}
            <div className="grid grid-cols-2 p-1 bg-[#120f0d] rounded-2xl border border-[#2a221b]">
              <button
                type="button"
                onClick={() => {
                  setLoginPortal('PLAYER');
                  setErrorMsg(null);
                }}
                className={`min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginPortal === 'PLAYER'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[#a8a29e] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>ورود بازیکنان</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginPortal('STAFF');
                  setErrorMsg(null);
                }}
                className={`min-h-[44px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loginPortal === 'STAFF'
                    ? 'bg-[#29221d] text-white shadow-sm'
                    : 'text-[#a8a29e] hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>ورود گرداننده</span>
              </button>
            </div>

            {/* PLAYER PORTAL FORM */}
            {loginPortal === 'PLAYER' ? (
              <form onSubmit={handlePlayerLoginSubmit} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-[#d6d3d1] block">
                    شماره همراه یا نام بازیکن
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={playerLoginInput}
                      onChange={(e) => setPlayerLoginInput(e.target.value)}
                      placeholder="مثال: ۰۹۱۲۰۰۰۰۰۰۱ یا نام عضو..."
                      dir="rtl"
                      autoComplete="username"
                      className="w-full h-12 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-4 text-sm text-white placeholder:text-[#574d44] outline-none transition-colors"
                      required
                    />
                    <User className="w-4 h-4 text-[#78716c] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#d6d3d1]">رمز عبور</label>
                    <span className="text-[11px] text-[#78716c]">پیش‌فرض نمونه: ۱۲۳۴۵۶</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPlayerLoginPass ? 'text' : 'password'}
                      value={playerLoginPassword}
                      onChange={(e) => setPlayerLoginPassword(e.target.value)}
                      placeholder="رمز عبور..."
                      dir="ltr"
                      autoComplete="current-password"
                      className="w-full h-12 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-4 text-sm text-white font-mono placeholder:text-[#574d44] outline-none transition-colors pl-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPlayerLoginPass(!showPlayerLoginPass)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-amber-400 p-1 cursor-pointer transition-colors"
                    >
                      {showPlayerLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به تالار بازی‌ها و رتبه‌بندی</span>
                </button>

                {/* Quick 1-Tap Sample Logins */}
                <div className="pt-2 border-t border-[#29221d] space-y-2">
                  <div className="text-[11px] text-[#a8a29e] text-center font-medium">
                    ورود سریع تستی با بازیکنان نمونه باشگاه:
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickPlayerLogin('09120000001')}
                      className="h-10 px-2 rounded-xl bg-[#14100e] hover:bg-[#201a16] border border-[#2e2620] text-xs font-semibold text-[#d6d3d1] hover:text-amber-400 transition-colors cursor-pointer text-center truncate"
                    >
                      حسین شهبازی
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickPlayerLogin('09120000002')}
                      className="h-10 px-2 rounded-xl bg-[#14100e] hover:bg-[#201a16] border border-[#2e2620] text-xs font-semibold text-[#d6d3d1] hover:text-amber-400 transition-colors cursor-pointer text-center truncate"
                    >
                      مهرشاد مرادی
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* STAFF PORTAL FORM */
              <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-[#d6d3d1] block">
                    نام کاربری گرداننده یا مدیر
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="مثال: Hossein_Mad"
                    dir="ltr"
                    autoComplete="username"
                    className="w-full h-12 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-4 text-sm text-white font-mono placeholder:text-[#574d44] outline-none transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-bold text-[#d6d3d1] block">
                    رمز عبور
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="کلمه عبور..."
                      dir="ltr"
                      autoComplete="current-password"
                      className="w-full h-12 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-4 text-sm text-white font-mono placeholder:text-[#574d44] outline-none transition-colors pl-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716c] hover:text-amber-400 p-1 cursor-pointer transition-colors"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ورود به پنل هدایت بازی</span>
                </button>

                <div className="pt-2 border-t border-[#29221d] text-center">
                  <button
                    type="button"
                    onClick={handleQuickAdminLogin}
                    className="text-xs text-amber-500 hover:text-amber-400 font-semibold cursor-pointer transition-colors"
                  >
                    ورود سریع مدیر کل سایت (Hossein_Mad)
                  </button>
                </div>
              </form>
            )}

            {/* Switch to Signup View */}
            <div className="pt-3 border-t border-[#29221d] text-center">
              <button
                type="button"
                onClick={() => {
                  setView('CREATE_ACCOUNT');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                  setPendingNotice(null);
                }}
                className="text-xs text-[#a8a29e] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 mx-auto py-1"
              >
                <span>حساب کاربری ندارید؟</span>
                <span className="text-amber-500 font-bold underline">ثبت‌نام عضویت جدید</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: SIGN UP */
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setView('LOGIN');
                setErrorMsg(null);
                setSuccessMsg(null);
                setPendingNotice(null);
              }}
              className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1.5 cursor-pointer py-1"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه ورود</span>
            </button>

            {/* Account Type Selector */}
            <div className="grid grid-cols-2 p-1 bg-[#120f0d] rounded-2xl border border-[#2a221b]">
              <button
                type="button"
                onClick={() => {
                  setAccountType('PLAYER');
                  setErrorMsg(null);
                }}
                className={`min-h-[42px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accountType === 'PLAYER'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-[#a8a29e] hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>عضویت بازیکن</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAccountType('MODERATOR');
                  setErrorMsg(null);
                }}
                className={`min-h-[42px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  accountType === 'MODERATOR'
                    ? 'bg-[#29221d] text-white shadow-sm'
                    : 'text-[#a8a29e] hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>عضویت گرداننده</span>
              </button>
            </div>

            {accountType === 'PLAYER' ? (
              /* PLAYER REGISTRATION FORM */
              <form onSubmit={handlePlayerSignup} className="space-y-3.5 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d6d3d1]">نام و نام خانوادگی</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="مثال: علی رضایی"
                    className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3.5 text-xs text-white placeholder:text-[#574d44] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d6d3d1]">شماره همراه (شناسه ورود)</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    dir="ltr"
                    className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3.5 text-xs text-white font-mono placeholder:text-[#574d44] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#d6d3d1]">رمز عبور</label>
                    <input
                      type={showPlayerSignupPass ? 'text' : 'password'}
                      value={playerSignupPassword}
                      onChange={(e) => setPlayerSignupPassword(e.target.value)}
                      placeholder="حداقل ۴ نویسه"
                      dir="ltr"
                      className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#d6d3d1]">تکرار رمز</label>
                    <input
                      type={showPlayerSignupPass ? 'text' : 'password'}
                      value={playerSignupConfirmPass}
                      onChange={(e) => setPlayerSignupConfirmPass(e.target.value)}
                      placeholder="تکرار..."
                      dir="ltr"
                      className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>تأیید و عضویت در باشگاه</span>
                </button>

                {createdPlayer && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-600 rounded-2xl text-center space-y-2 mt-2">
                    <div className="text-xs text-emerald-300 font-bold">
                      ثبت‌نام «{createdPlayer.name}» با موفقیت انجام شد!
                    </div>
                    <button
                      type="button"
                      onClick={() => onPlayerLoginSuccess?.(createdPlayer)}
                      className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>ورود مستقیم به تالار بازی‌ها</span>
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* MODERATOR REGISTRATION FORM */
              <form onSubmit={handleModeratorSignup} className="space-y-3 text-right">
                <div className="p-2.5 bg-amber-950/40 border border-amber-800/40 rounded-xl text-amber-200 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>عضویت گردانندگان پس از بررسی توسط مدیر کل سایت فعال خواهد شد.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d6d3d1]">نام و نام خانوادگی گرداننده</label>
                  <input
                    type="text"
                    value={modName}
                    onChange={(e) => setModName(e.target.value)}
                    placeholder="مثال: رضا مرادی"
                    className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3.5 text-xs text-white placeholder:text-[#574d44] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#d6d3d1]">نام کاربری لاتین</label>
                  <input
                    type="text"
                    value={modUsername}
                    onChange={(e) => setModUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    placeholder="مثال: god_reza"
                    dir="ltr"
                    className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3.5 text-xs text-white font-mono placeholder:text-[#574d44] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#d6d3d1]">کلمه عبور</label>
                    <input
                      type={showModPassword ? 'text' : 'password'}
                      value={modPassword}
                      onChange={(e) => setModPassword(e.target.value)}
                      placeholder="حداقل ۳ حرف"
                      dir="ltr"
                      className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#d6d3d1]">تکرار کلمه عبور</label>
                    <input
                      type={showModPassword ? 'text' : 'password'}
                      value={modConfirmPassword}
                      onChange={(e) => setModConfirmPassword(e.target.value)}
                      placeholder="تکرار..."
                      dir="ltr"
                      className="w-full h-11 bg-[#120f0d] border border-[#2e2620] focus:border-amber-500 rounded-xl px-3 text-xs text-white font-mono outline-none"
                      required
                    />
                  </div>
                </div>

                <div 
                  onClick={() => setOmertaAccepted(!omertaAccepted)}
                  className="p-2.5 bg-[#120f0d] border border-[#2e2620] rounded-xl flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={omertaAccepted}
                    onChange={(e) => setOmertaAccepted(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-[#d6d3d1]">سوگند بی‌طرفی کامل در قضاوت و رازداری نقش‌ها</span>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Clock className="w-4 h-4" />
                  <span>ارسال درخواست عضویت گرداننده</span>
                </button>
              </form>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
