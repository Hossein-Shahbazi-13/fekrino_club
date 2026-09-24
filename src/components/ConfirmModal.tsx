import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'بله، حذف شود',
  cancelText = 'انصراف',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none font-['Vazirmatn']" 
          dir="rtl"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-gradient-to-b from-[#1f0d07] via-[#160804] to-[#0e0402] border-2 border-rose-600/70 rounded-3xl shadow-[0_0_50px_rgba(225,29,72,0.3)] p-5 sm:p-6 text-right space-y-4 text-[#faf6f0]"
          >
            {/* Header with Icon */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${
                  isDestructive 
                    ? 'bg-rose-950/90 text-rose-400 border border-rose-500/50 shadow-lg shadow-rose-950/80' 
                    : 'bg-amber-950/90 text-amber-400 border border-amber-500/50'
                }`}>
                  {isDestructive ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    {title}
                  </h3>
                  <div className="text-[11px] text-rose-300/80 font-mono mt-0.5">
                    عملیات غیرقابل بازگشت
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#a89582] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-950/60 text-xs sm:text-sm text-[#e0cfbe] leading-relaxed">
              {message}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#c9b7a2] hover:text-white text-xs sm:text-sm font-bold border border-white/10 transition-colors cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirm();
                }}
                className={`px-5 py-2.5 rounded-xl text-white font-black text-xs sm:text-sm shadow-xl active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isDestructive
                    ? 'bg-gradient-to-r from-rose-700 via-red-600 to-rose-700 hover:from-rose-600 hover:to-red-500 border border-rose-400/80 shadow-rose-950/80'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-black font-black'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>{confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
