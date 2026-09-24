import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ShieldAlert, Sparkles, X } from 'lucide-react';
import { RoleKey } from '../types/mafia';
import { ALL_ROLES } from '../data/scenarioData';
import { RoleArtwork } from './RoleArtwork';

interface RoleRevealPopupProps {
  isOpen: boolean;
  seatNumber: number;
  roleKey: RoleKey | null;
  onNextPerson: () => void;
  onClose: () => void;
}

export const RoleRevealPopup: React.FC<RoleRevealPopupProps> = ({
  isOpen,
  seatNumber,
  roleKey,
  onNextPerson,
  onClose
}) => {
  if (!roleKey) return null;

  const role = ALL_ROLES[roleKey];
  const isMafia = role?.side === 'MAFIA';

  const getConciseExplanation = (key: RoleKey) => {
    switch (key) {
      // Bazpors
      case 'BAZPORS':
        return 'در شب ۲ نفر را برای دادگاه بازپرسی روز بعد انتخاب می‌کنید. در روز، مظنونین دفاعیه ۳۰ ثانیه‌ای دارند و با تصمیم شما به رأی‌گیری اجباری می‌روند (فرد خارج شده با اعلام ساید می‌رود). همچنین استعلام هم‌سایدی ۲ نفر را در شب می‌گیرید.';
      case 'MOHAQEQ':
        return 'نخستین نقشی است که در فاز شب بیدار می‌شود و استعلام یا ردگیری خود را انجام می‌دهد. اگر رئیس مافیا را هدف قرار دهد از بازی خارج نمی‌شود.';
      
      // Takaver
      case 'TAKAVER':
        return 'اگر در فاز شب مورد شات مافیا قرار بگیرید، توسط گرداننده بیدار شده و حق یک شلیک به یکی از بازیکنان را دارید. اگر مافیا را بزنید او حذف می‌شود، اگر شهروند را بزنید خودتان هم حذف می‌شوید و اگر به رئیس بزنید هیچ‌کس حذف نمی‌شود.';
      case 'NEGAHBAN':
        return 'هر شب یک بازیکن را برای محافظت از خطرات و تعرضات انتخاب می‌کند.';
      case 'ZEREHPOOSH':
        return 'دارای یک زره دفاعی است؛ در برابر اولین شلیک شب مافیا یا اولین رأی‌گیری خروج روز مصون است و در بازی باقی می‌ماند.';
      case 'GROGANGIR':
        return 'هر شب یک بازیکن را به گروگان می‌گیرد تا قابلیت شبانه او (استعلام کارآگاه، سیو دکتر، شلیک تکاور و...) کاملاً خنثی و بی‌اثر شود.';

      // Namayandeh (WhiteSho)
      case 'SARBAZ':
        return 'شما سرباز (شهروند دارای تیر) هستید. یک تیر جنگی برای شلیک به مظنونین مافیا در اختیار دارید؛ در صورتی که هکر مافیا شما را هک کند، شلیک شما به هدف اصابت نمی‌کند.';
      case 'RAHNAMA':
        return 'در شب یک نفر را انتخاب می‌کند. اگر آن شخص شهروند باشد مانند کارآگاه استعلام می‌گیرد؛ اگر مافیا باشد، مافیا بیدار شده و راهنما را شناسایی می‌کند.';
      case 'MINGOZAR':
        return 'یک بار در طول بازی جلوی خانه یک بازیکن مین می‌گذارد. اگر مافیا به آن شخص شلیک کند مین منفجر شده و یک مافیا نیز به همراه او کشته می‌شود.';
      case 'VAKIL':
        return 'یک بار در بازی در شب بیدار شده و یک نفر را وکالت می‌کند تا فردای آن روز حتی با داشتن رأی کافی وارد دفاعیه نشود.';
      case 'MOHAFIZ':
        return 'از یک بازیکن در برابر ترور یاغی و شلیک‌های خارج از نوبت محافظت می‌کند.';
      case 'DON_MAFIA':
        return 'رئیس مافیا با استعلام منفی؛ می‌تواند با «رأی خیانت» رأی تارگت یکی از نماینده‌ها را یک واحد کم یا زیاد کند.';
      case 'YAGHI':
        return 'نفر دوم مافیا؛ در صورت خروج رئیس مافیا یا هکر، به ترور تبدیل شده و قبل از رأی‌گیری روز می‌تواند یک نفر را ترور کند.';
      case 'HACKER':
        return 'هر شب توانایی یک نفر را هک کرده و از بین می‌برد (مانند ممانعت از نجات پزشک).';
      case 'NAMAYANDEH':
        return 'نقش فرآیندی در بازی که توسط آرا در روز اول انتخاب می‌شود و دون مافیا با رأی خیانت روی آرای نماینده اثر می‌گذارد.';

      // Core Roles
      case 'DETECTIVE':
        return 'هر شب استعلام یک بازیکن را از گرداننده می‌گیرید. استعلام رئیس مافیا همواره منفی است. توجه داشته باشید شیاد یا هکر می‌توانند استعلام شما را تحت تأثیر قرار دهند.';
      case 'DOCTOR':
        return 'در هر شب یک بازیکن را برای نجات از شلیک مافیا انتخاب می‌کنید. در طول کل بازی حداکثر ۲ بار می‌توانید جان خودتان را نجات دهید.';
      case 'SNIPER':
        return 'دارای تیر جنگی شبانه هستید. شلیک به مافیا باعث حذف او می‌شود و شلیک اشتباه به شهروند موجب حذف خودتان می‌گردد.';
      case 'GUNSMITH':
        return 'در شب تفنگ جنگی یا مشقی را به یکی از بازیکنان اهدا می‌کنید تا در روز تصمیم به شلیک بگیرد.';
      case 'CITIZEN_SIMPLE':
        return 'شما شهروند ساده هستید. با استدلال، شرکت در چالش‌ها، رأی‌گیری و دفاع شجاعانه، به نجات شهر و شناسایی مافیاها کمک کنید.';
      case 'MAFIA_BOSS':
        return 'رهبر تیم مافیا و دارنده شلیک نهایی شب. استعلام شما برای کارآگاه منفی است و تیر تک‌تیرانداز روی شما اثری ندارد.';
      case 'SHEYAD':
        return 'در شب یک بازیکن را فریب می‌دهید. اگر کارآگاه را هدف قرار دهید، تمامی استعلام‌های کارآگاه در آن شب منفی و گمراه‌کننده خواهد شد.';
      case 'NATO':
        return 'یک بار در بازی می‌توانید در شب نقش دقیق یکی از شهروندان را حدس بزنید. در صورت حدس درست، آن شهروند حتی با سیو پزشک در صبح حذف خواهد شد.';
      case 'MAFIA_SIMPLE':
        return 'عضوی از تیم مافیا هستید. در تصمیم‌گیری شلیک شب همکاری کرده و در روز با فکت‌سازی و پوشش هم‌تیمی‌ها، به پیروزی مافیا کمک کنید.';
      default:
        return role?.shortDesc || '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none overflow-hidden">
          {/* Backdrop click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* 3D Flip Card Container with Instant Entrance and Right-Slide Exit */}
          <motion.div
            initial={{ scale: 0.8, rotateY: -90, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ x: '120vw', rotate: 25, opacity: 0, transition: { duration: 0.35, ease: 'easeInOut' } }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className={`relative w-full max-w-sm rounded-3xl p-5 sm:p-6 text-center border-2 shadow-2xl flex flex-col items-center justify-between z-10 ${
              isMafia
                ? 'bg-gradient-to-b from-[#2e0e0c] via-[#1c0807] to-[#0c0303] border-rose-500/80 shadow-rose-950/90'
                : 'bg-gradient-to-b from-[#0c2430] via-[#07161e] to-[#030a0d] border-cyan-400/80 shadow-cyan-950/90'
            }`}
            style={{
              boxShadow: isMafia
                ? '0 0 35px 5px rgba(244, 63, 94, 0.4), inset 0 0 15px rgba(244, 63, 94, 0.15)'
                : '0 0 35px 5px rgba(34, 211, 238, 0.4), inset 0 0 15px rgba(34, 211, 238, 0.15)'
            }}
          >
            {/* Top Header: Seat Number & Side Badge */}
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#c9b7a2]">شماره صندلی</span>
                <span className="text-2xl font-black text-[#f43f5e] font-mono drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]">
                  {seatNumber}
                </span>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                  isMafia
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                }`}
              >
                {isMafia ? (
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
            <div className="my-3.5 flex flex-col items-center justify-center space-y-2.5">
              <RoleArtwork roleKey={roleKey} size="lg" />

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-['Vazirmatn']">
                {role?.nameFa}
              </h2>
            </div>

            {/* Role Explanation */}
            <div className="w-full bg-black/40 rounded-2xl p-3.5 border border-white/5 text-right mb-3.5">
              <div className="text-[11px] font-bold text-amber-300/90 mb-1">
                توضیح عملکرد نقش:
              </div>
              <p className="text-xs sm:text-[13px] text-[#e8ded1] leading-relaxed font-medium">
                {getConciseExplanation(roleKey)}
              </p>
            </div>

            {/* Action Buttons: Next Person (Slides out to right) & Close */}
            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={onNextPerson}
                className={`w-full py-3.5 rounded-2xl font-black text-base shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                  isMafia
                    ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 hover:to-rose-400 text-white border-rose-400/50 shadow-rose-950/80'
                    : 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-[#1a110c] border-amber-300/50 shadow-amber-950/80'
                }`}
              >
                <span>نفر بعدی (خروج کارت)</span>
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
