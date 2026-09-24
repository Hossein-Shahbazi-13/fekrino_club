import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Check, 
  HelpCircle,
  Dice5,
  Gamepad2,
  Coffee,
  Layers,
  ChevronLeft,
  ShieldAlert,
  Shuffle,
  ListOrdered,
  ArrowRight,
  Trophy,
  Award,
  Users
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { RoleKey, ScenarioType } from '../types/mafia';
import { SCENARIOS, ALL_ROLES } from '../data/scenarioData';
import { RoleArtwork } from './RoleArtwork';
import { ConfirmResetModal } from './ConfirmResetModal';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';
import { 
  generateCryptographicDistribution, 
  DistributionMode, 
  AssignedSeatPair 
} from '../utils/cryptoShuffle';
import { saveLiveGameState, loadLiveGameState } from '../utils/gameStateStorage';

interface FekriNoDistributionScreenProps {
  scenarioType: ScenarioType;
  playerCount: number;
  assignedSeats?: AssignedSeatPair[];
  onUpdateAssignedSeats?: (seats: AssignedSeatPair[]) => void;
  moderatorName?: string;
  onSelectScenario: (scenario: ScenarioType) => void;
  onSelectPlayerCount: (count: number) => void;
  onOpenGuide: () => void;
  onOpenScoring: () => void;
  onBackToRegistration: () => void;
}

export const FekriNoDistributionScreen: React.FC<FekriNoDistributionScreenProps> = ({
  scenarioType = 'BAZPORS' as ScenarioType,
  playerCount = 10,
  assignedSeats: initialAssignedSeats,
  onUpdateAssignedSeats,
  moderatorName,
  onSelectScenario,
  onSelectPlayerCount,
  onOpenGuide,
  onOpenScoring,
  onBackToRegistration
}) => {
  const [distributionMode, setDistributionMode] = useState<DistributionMode>('SEQUENTIAL_SEATS');
  const [assignedSeats, setAssignedSeats] = useState<AssignedSeatPair[]>(() => {
    if (initialAssignedSeats && initialAssignedSeats.length === playerCount) {
      return initialAssignedSeats;
    }
    const saved = loadLiveGameState();
    if (saved?.assignedSeats && saved.assignedSeats.length === playerCount) {
      return saved.assignedSeats;
    }
    return generateCryptographicDistribution(scenarioType, playerCount, 'SEQUENTIAL_SEATS');
  });
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const saved = loadLiveGameState();
    return saved?.distributionState?.currentSeatIndex || 0;
  });
  const [isFlipped, setIsFlipped] = useState<boolean>(() => {
    const saved = loadLiveGameState();
    return saved?.distributionState?.isCardRevealed || false;
  });
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isAllFinished, setIsAllFinished] = useState<boolean>(() => {
    const saved = loadLiveGameState();
    return saved?.distributionState?.currentStep === 'COMPLETE';
  });
  const [shuffleNotice, setShuffleNotice] = useState<string | null>(null);

  // Auto-save distribution progress to prevent data loss on refresh
  useEffect(() => {
    saveLiveGameState({
      currentScreen: 'DISTRIBUTION',
      scenarioType,
      playerCount,
      assignedSeats,
      distributionState: {
        currentStep: isAllFinished ? 'COMPLETE' : 'CARD_DISTRIBUTION',
        currentSeatIndex: currentIndex,
        isCardRevealed: isFlipped,
        seenSeats: Array.from({ length: currentIndex }, (_, i) => i + 1)
      }
    });
  }, [currentIndex, isFlipped, isAllFinished, assignedSeats, scenarioType, playerCount]);

  // Confirmation state for reset actions
  const [pendingResetAction, setPendingResetAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  const requestResetConfirmation = (title: string, message: string, action: () => void) => {
    setPendingResetAction({ title, message, action });
  };

  const currentScenario = SCENARIOS[scenarioType] || SCENARIOS.BAZPORS;

  // Generate cryptographically randomized roles and seats
  const generateAndShuffle = (scenario: ScenarioType, count: number, mode: DistributionMode = distributionMode) => {
    const pairings = generateCryptographicDistribution(scenario, count, mode);

    setAssignedSeats(pairings);
    if (onUpdateAssignedSeats) {
      onUpdateAssignedSeats(pairings);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsExiting(false);
    setIsAllFinished(false);
  };

  // Sync if initialAssignedSeats changes from parent
  useEffect(() => {
    if (initialAssignedSeats && initialAssignedSeats.length === playerCount) {
      setAssignedSeats(initialAssignedSeats);
    }
  }, [initialAssignedSeats, playerCount]);

  // Handle actions with confirmation guard
  const handleRedistributeClick = () => {
    requestResetConfirmation(
      'بُر زدن مجدد و توزیع از ابتدا',
      'با این کار تمامی نقش‌ها مجدداً به صورت تصادفی بر زده خواهند شد و کارت‌ها از صندلی اول توزیع می‌شوند. آیا مطمئن هستید؟',
      () => {
        generateAndShuffle(scenarioType, playerCount, distributionMode);
        setShuffleNotice('بُر تصادفی با الگوریتم رمزنگاری جدید انجام شد');
        setTimeout(() => setShuffleNotice(null), 2500);
      }
    );
  };

  const handleScenarioChangeClick = (st: ScenarioType) => {
    if (st === scenarioType) return;
    const targetScen = SCENARIOS[st];
    requestResetConfirmation(
      `تغییر سناریو به ${targetScen.nameFa}`,
      `با تعویض سناریو به ${targetScen.nameFa}، تقسیم نقش‌های فعلی ریست می‌شود. آیا مطمئن هستید؟`,
      () => {
        onSelectScenario(st);
        const newCount = targetScen.availablePlayerCounts.includes(playerCount)
          ? playerCount
          : targetScen.availablePlayerCounts[0];
        if (newCount !== playerCount) {
          onSelectPlayerCount(newCount);
        }
        generateAndShuffle(st, newCount, distributionMode);
      }
    );
  };

  const handlePlayerCountChangeClick = (cnt: number) => {
    if (cnt === playerCount) return;
    requestResetConfirmation(
      `تغییر به ${cnt} بازیکن`,
      `با تغییر تعداد بازیکنان به ${cnt} نفر، فرآیند تقسیم نقش‌ها متوقف شده و از صندلی ۱ شروع مجدد خواهد شد. آیا مطمئن هستید؟`,
      () => {
        onSelectPlayerCount(cnt);
        generateAndShuffle(scenarioType, cnt, distributionMode);
      }
    );
  };

  const handleModeToggleClick = (newMode: DistributionMode) => {
    if (newMode === distributionMode) return;
    requestResetConfirmation(
      'تغییر شیوه توزیع صندلی‌ها',
      'با تغییر شیوه چینش صندلی‌ها، کارت‌ها از ابتدا بر زده خواهند شد. آیا مطمئن هستید؟',
      () => {
        setDistributionMode(newMode);
        generateAndShuffle(scenarioType, playerCount, newMode);
        setShuffleNotice(
          newMode === 'SEQUENTIAL_SEATS'
            ? 'چینش: صندلی‌های ۱ تا ۱۰ (نقش‌ها کاملاً تصادفی)'
            : 'چینش: صندلی‌ها و نقش‌ها هر دو تصادفی'
        );
        setTimeout(() => setShuffleNotice(null), 2500);
      }
    );
  };

  const handleBackToRegistrationClick = () => {
    requestResetConfirmation(
      'خروج و بازگشت به لیست ثبت‌نام',
      'با بازگشت به صفحه ثبت‌نام بازیکنان، تقسیم نقش‌های فعلی متوقف می‌شود. آیا مطمئن هستید؟',
      () => {
        onBackToRegistration();
      }
    );
  };

  // Handle instant 3D Card Flip on first tap, or Advance to Next Player if already flipped
  const handleCardClick = () => {
    if (isAllFinished || isExiting) return;
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      handleNextPerson();
    }
  };

  // Handle Card Slide-Out to the Right & Advance to Next Player seamlessly
  const handleNextPerson = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isExiting || isAllFinished || !currentPair) return;

    setIsExiting(true);

    setTimeout(() => {
      if (currentIndex + 1 < playerCount) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
        setIsExiting(false);
      } else {
        setIsFlipped(false);
        setIsExiting(false);
        setIsAllFinished(true);
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // Safe fallback
        }
      }
    }, 280);
  };

  const currentPair = assignedSeats[currentIndex];
  const currentSeatNumber = currentPair ? currentPair.seatNumber : 1;
  const currentRoleKey = currentPair ? currentPair.roleKey : null;
  const remainingRolesCount = playerCount - currentIndex;

  const getConciseExplanation = (rk: RoleKey | null) => {
    if (!rk) return '';
    switch (rk) {
      case 'SARBAZ':
        return 'شما سرباز (شهروند دارای تیر) هستید. یک تیر جنگی برای شلیک به مظنونین مافیا در اختیار دارید؛ در صورتی که هکر مافیا شما را هک کند، شلیک شما به هدف اصابت نمی‌کند.';
      case 'RAHNAMA':
        return 'در شب یک نفر را انتخاب می‌کند. اگر آن شخص شهروند باشد مانند کارآگاه استعلام می‌گیرد؛ اگر مافیا باشد، مافیا بیدار شده و راهنما را شناسایی می‌کند.';
      case 'MINGOZAR':
        return 'یک‌بار در بازی یک نفر را مین‌گذاری می‌کند؛ اگر مافیا به او شلیک کند، علاوه بر شات مافیا، یک مافیا نیز به عنوان فدایی کشته می‌شود.';
      case 'VAKIL':
        return 'یک‌بار در بازی وکالت یک نفر را بر عهده می‌گیرد تا فردای آن روز حتی در صورت کسب رأی، وارد دفاعیه نشود.';
      case 'MOHAFIZ':
        return 'در شب از یک نفر در برابر ترور محافظت می‌کند؛ خود محافظ نیز در برابر ترور ایمن است.';
      case 'DON_MAFIA':
        return 'رئیس مافیا و تصمیم‌گیرنده شات شب؛ با قابلیت «رأی خیانت» می‌تواند رأی تارگت نماینده را کم یا زیاد کند.';
      case 'YAGHI':
        return 'نفر دوم مافیا؛ در صورت خروج رئیس مافیا یا هکر، به ترور تبدیل شده و قبل از رأی‌گیری روز می‌تواند یک نفر را ترور کند.';
      case 'HACKER':
        return 'هر شب توانایی یک نفر را هک کرده و خنثی می‌سازد (مانند ممانعت از نجات پزشک یا شلیک سرباز).';
      case 'BAZPORS':
        return 'حق احضار مستقیم دو مظنون به دفاعیه روزانه بدون نیاز به رأی‌گیری عمومی برای نجات شهر.';
      case 'TAKAVER':
        return 'تیرانداز قهرمان شهروندان با یک تیر جنگی و زره در برابر شات اول مافیا.';
      case 'DETECTIVE':
        return 'استعلام‌گیری شبانه از گرداننده برای کشف اعضای مافیا.';
      case 'DOCTOR':
        return 'نجات جان بازیکنان از شلیک‌های شبانه مافیا.';
      case 'SNIPER':
        return 'تک‌تیرانداز شهروند با تیر شبانه دقیق برای حذف مافیا.';
      case 'GUNSMITH':
        return 'تحویل روزانه یک تیر جنگی یا مشقی به شهروندان معتمد.';
      case 'ZEREHPOOSH':
        return 'دارای زره فولادی در برابر حمله اول مافیا یا خروج اول روز.';
      case 'GROGANGIR':
        return 'هر شب توانایی یک بازیکن را به گروگان گرفته و خنثی می‌کند.';
      case 'MAFIA_BOSS':
        return 'فرمانده کل تیم مافیا با استعلام منفی در برابر کارآگاه.';
      case 'SHEYAD':
        return 'شیاد با فریب و جعل استعلام کارآگاه علیه شهروندان.';
      case 'NATO':
        return 'حدس زدن نقش بازیکنان برای حذف مستقیم در شب.';
      case 'CITIZEN_SIMPLE':
        return 'شهروند وفادار؛ ایجاد اتحاد و کشف مافیا در گفت‌وگوها و رأی‌گیری روز.';
      case 'MAFIA_SIMPLE':
        return 'عضو هوشمند تیم مافیا؛ گمراه کردن شهروندان و هم‌دستی در ترور شبانه.';
      default:
        return ALL_ROLES[rk]?.shortDesc || 'نقش تعیین‌کننده در روند بازی مافیا.';
    }
  };

  // Render Front of Card (Role details)
  const renderCardFrontContent = (
    seatNum: number, 
    rKey: RoleKey, 
    onNextClick?: (e: React.MouseEvent | React.TouchEvent) => void
  ) => {
    const rInfo = ALL_ROLES[rKey];
    const isMaf = rInfo?.side === 'MAFIA';

    return (
      <div
        onClick={onNextClick}
        onTouchEnd={onNextClick}
        className={`w-full h-full rounded-3xl p-3.5 sm:p-4 text-center border-2 shadow-2xl flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer active:scale-[0.98] transition-transform ${
          isMaf
            ? 'bg-gradient-to-b from-[#2e0e0c] via-[#1c0807] to-[#0c0303] border-rose-500/90 shadow-rose-950/90'
            : 'bg-gradient-to-b from-[#0c2430] via-[#07161e] to-[#030a0d] border-cyan-400/90 shadow-cyan-950/90'
        }`}
      >
        {/* Top: Seat Number & Side Badge */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-2 pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#c9b7a2]">صندلی:</span>
            <span className="text-2xl font-black text-[#f43f5e] font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
              {seatNum}
            </span>
          </div>

          <div
            className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
              isMaf
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/60'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60'
            }`}
          >
            {isMaf ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>ساید مافیا</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>ساید شهروند</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Character Portrait Artwork */}
        <div className="my-auto flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
          <RoleArtwork roleKey={rKey} size="lg" />

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-['Vazirmatn']">
            {rInfo?.nameFa}
          </h2>
        </div>

        {/* Role Explanation */}
        <div className="w-full bg-black/50 rounded-xl p-2.5 border border-white/10 text-right mb-2 pointer-events-none">
          <div className="text-[10px] font-bold text-amber-300 mb-0.5">
            توضیح عملکرد نقش:
          </div>
          <p className="text-[11px] sm:text-xs text-[#e8ded1] leading-relaxed font-medium">
            {getConciseExplanation(rKey)}
          </p>
        </div>

        {/* Touch Anywhere on Card to Advance Banner */}
        <div
          className={`w-full py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 border transition-all ${
            isMaf
              ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 text-white border-rose-400/60 shadow-rose-950/80 animate-pulse'
              : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-[#1a110c] border-amber-300/70 shadow-amber-950/80 animate-pulse'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>لمس هر جای کارت ⟵ رفتن به نفر بعدی</span>
          <ChevronLeft className="w-4 h-4 shrink-0" />
        </div>
      </div>
    );
  };

  // Render Back of Card (Fekri No Logo & Seat)
  const renderCardBackContent = (seatNum: number, cardIdx: number) => {
    return (
      <div className="w-full h-full rounded-3xl bg-gradient-to-b from-[#1c0d06] via-[#120703] to-[#0a0402] border-2 border-amber-500/80 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(250,204,21,0.25)] p-4 flex flex-col items-center justify-between overflow-hidden select-none">
        {/* Decorative Golden Inset Border */}
        <div className="absolute inset-2.5 rounded-2xl border border-amber-500/30 pointer-events-none" />

        {/* Top Bar: Progress & Seat Callout */}
        <div className="w-full flex items-center justify-between px-1 pt-1 z-10">
          <div className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full border border-amber-500/30">
            <Layers className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-bold text-[#e0c7a8]">
              کارت {cardIdx + 1} از {playerCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/60 px-3 py-1 rounded-full border border-rose-500/40">
            <span className="text-[11px] font-bold text-[#c9b7a2]">صندلی</span>
            <span className="text-xl font-black text-[#f43f5e] font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]">
              {seatNum}
            </span>
          </div>
        </div>

        {/* Center: Official Fekri No Image Logo */}
        <div className="my-auto flex flex-col items-center justify-center space-y-2.5 z-10">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-[0_0_30px_rgba(250,204,21,0.45)] bg-black">
            <img
              src={officialLogoImg}
              alt="فکری نو - NOVA COGITATIO"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="text-center">
            <div className="text-sm font-black tracking-widest text-amber-300 font-mono uppercase">
              NOVA COGITATIO
            </div>
            <div className="text-[11px] text-[#d6c3aa] font-medium mt-0.5">
              کافه رستوران فکری نو
            </div>
          </div>
        </div>

        {/* Bottom: Touch to Flip Prompt */}
        <div className="w-full text-center pb-1 z-10">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-400/60 text-amber-200 text-xs font-bold shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>روی کارت بزنید تا برعکس شود</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-wood-pattern text-[#faf6f0] flex flex-col justify-between select-none max-w-md mx-auto relative px-3 sm:px-4 py-2 sm:py-3 shadow-2xl overflow-x-hidden font-['Vazirmatn']" dir="rtl">
      {/* 1. TOP BAR: Scenario Selector & Quick Actions */}
      <div className="w-full space-y-2 z-10">
        {/* Navigation & Moderator Bar */}
        <div className="w-full bg-wood-card rounded-2xl px-3 py-1.5 flex items-center justify-between border border-[#523321]">
          <button
            type="button"
            onClick={handleBackToRegistrationClick}
            className="flex items-center gap-1 text-xs text-[#c9b7a2] hover:text-amber-300 font-bold bg-[#140804] px-2.5 py-1 rounded-xl border border-[#3d1f10] cursor-pointer transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>ثبت‌نام</span>
          </button>

          <div className="text-center">
            <div className="text-xs font-black text-amber-300">
              {currentScenario.nameFa} ({playerCount} نفره)
            </div>
            {moderatorName && (
              <div className="text-[10px] text-[#a89582]">گرداننده: {moderatorName}</div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleRedistributeClick}
              title="بُر مجدد"
              className="p-1.5 rounded-xl bg-[#140804] text-amber-400 hover:text-amber-300 border border-[#3d1f10] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenScoring}
              title="پنل هدایت و امتیازدهی"
              className="p-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-400/40 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenGuide}
              title="راهنمای سناریو"
              className="p-1.5 rounded-xl bg-[#140804] text-amber-400 hover:text-amber-300 border border-[#3d1f10] cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Temporary Notice */}
        <AnimatePresence>
          {shuffleNotice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs py-1 px-3 rounded-xl text-center shadow-lg flex items-center justify-center gap-1.5 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{shuffleNotice}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. CENTER: 3D CARD DISPLAY */}
      <div className="my-auto py-2 flex flex-col items-center justify-center space-y-3 z-10">
        {!isAllFinished ? (
          <>
            <div className="relative w-[300px] sm:w-[330px] h-[430px] sm:h-[460px] flex items-center justify-center">
              {/* Stack effect background layers */}
              {remainingRolesCount > 2 && (
                <div className="absolute w-[290px] sm:w-[320px] h-[420px] sm:h-[450px] rounded-3xl bg-[#100603] border border-[#351a0d] transform rotate-3 translate-y-2 pointer-events-none opacity-50" />
              )}
              {remainingRolesCount > 1 && (
                <div className="absolute w-[290px] sm:w-[320px] h-[420px] sm:h-[450px] rounded-3xl bg-[#150904] border border-[#452211] transform -rotate-2 translate-y-1 pointer-events-none opacity-80" />
              )}

              {/* ACTIVE 3D FLIPPABLE CARD */}
              <motion.div
                key={`card-${currentIndex}`}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                  x: isExiting ? 480 : 0,
                  opacity: isExiting ? 0 : 1,
                  scale: isExiting ? 0.9 : 1
                }}
                transition={{
                  rotateY: { type: 'spring', stiffness: 220, damping: 20 },
                  x: { duration: 0.28, ease: 'easeIn' },
                  opacity: { duration: 0.25 }
                }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                onClick={handleCardClick}
                className="relative w-[295px] sm:w-[325px] h-[425px] sm:h-[455px] rounded-3xl cursor-pointer select-none shadow-2xl z-10"
              >
                {/* BACK OF CARD */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    pointerEvents: isFlipped ? 'none' : 'auto'
                  }}
                  className="absolute inset-0 w-full h-full rounded-3xl"
                >
                  {renderCardBackContent(currentSeatNumber, currentIndex)}
                </div>

                {/* FRONT OF CARD */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                    pointerEvents: isFlipped ? 'auto' : 'none'
                  }}
                  className="absolute inset-0 w-full h-full rounded-3xl"
                >
                  {currentRoleKey &&
                    renderCardFrontContent(currentSeatNumber, currentRoleKey, handleNextPerson)}
                </div>
              </motion.div>
            </div>

            {/* Remaining Count */}
            <div className="text-xs text-[#a89582] flex items-center gap-1.5 font-bold">
              <span>کارت‌های باقیمانده در دست:</span>
              <span className="font-mono text-amber-400 text-sm font-black">{remainingRolesCount}</span>
            </div>
          </>
        ) : (
          /* COMPLETION VIEW */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full bg-wood-card rounded-3xl p-6 border-2 border-amber-500/70 text-center space-y-5 shadow-2xl"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-950/80 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-amber-300">
                تمامی نقش‌های سناریو توزیع شدند
              </h3>
              <p className="text-xs text-[#c9b7a2] leading-relaxed">
                همه {playerCount} بازیکن کارت‌های خود را مشاهده کردند. اکنون می‌توانید وارد پنل هدایت بازی و امتیازدهی گاد شوید.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenScoring}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 text-[#140a05] font-black text-sm shadow-xl shadow-amber-950/80 border border-amber-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
            >
              <Trophy className="w-5 h-5" />
              <span>ورود به پنل هدایت و امتیازدهی گاد</span>
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#4a2613]">
              <button
                type="button"
                onClick={handleRedistributeClick}
                className="py-2.5 px-3 rounded-xl bg-[#140804] hover:bg-[#250f08] border border-[#3d1f10] text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>توزیع مجدد</span>
              </button>

              <button
                type="button"
                onClick={handleBackToRegistrationClick}
                className="py-2.5 px-3 rounded-xl bg-[#140804] hover:bg-[#250f08] border border-[#3d1f10] text-xs font-bold text-[#c9b7a2] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>لیست صندلی‌ها</span>
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Confirmation Modal */}
      {pendingResetAction && (
        <ConfirmResetModal
          isOpen={true}
          title={pendingResetAction.title}
          message={pendingResetAction.message}
          onConfirm={() => {
            pendingResetAction.action();
            setPendingResetAction(null);
          }}
          onCancel={() => setPendingResetAction(null)}
        />
      )}
    </div>
  );
};
