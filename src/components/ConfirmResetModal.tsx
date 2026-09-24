import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X, Check } from 'lucide-react';

interface ConfirmResetModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  actionLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  isOpen,
  title = 'تأیید ریست و توزیع مجدد نقش‌ها',
  message = 'با انجام این عملیات، فرآیند تقسیم نقش‌های فعلی متوقف و کارت‌ها از ابتدا بر زده خواهند شد. آیا مطمئن هستید؟',
  actionLabel = 'بله، ریست و شروع مجدد',
  onConfirm,
  onCancel
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md bg-[#180c07] border-2 border-amber-500/70 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden text-right"
            dir="rtl"
          >
            {/* Header / Icon */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-950/80">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-black text-amber-200 font-['Vazirmatn'] leading-snug">
                  {title}
                </h3>
                <p className="text-xs text-[#c9b7a2] mt-1.5 leading-relaxed">
                  {message}
                </p>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="text-[#968273] hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 pt-2 border-t border-amber-900/30">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-rose-600 hover:from-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-rose-950/80 border border-rose-400/50 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all font-['Vazirmatn']"
              >
                <Check className="w-4 h-4" />
                <span>{actionLabel}</span>
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="py-2.5 px-4 rounded-xl bg-[#26130b] hover:bg-[#341b10] text-[#ded0be] font-bold text-xs sm:text-sm border border-[#523321] transition-all cursor-pointer font-['Vazirmatn']"
              >
                انصراف و ادامه
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
