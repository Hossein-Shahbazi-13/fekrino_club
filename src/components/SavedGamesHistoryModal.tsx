import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  History, 
  Trophy, 
  Crown, 
  Calendar, 
  Clock, 
  User, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Skull, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { SavedGameRecord, ModeratorUsername } from '../types/mafia';
import { getSavedGames, deleteGameRecord, getAllModeratorAccounts } from '../data/moderators';
import { SCENARIOS, ALL_ROLES } from '../data/scenarioData';
import { ConfirmModal } from './ConfirmModal';

interface SavedGamesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SavedGamesHistoryModal: React.FC<SavedGamesHistoryModalProps> = ({
  isOpen,
  onClose
}) => {
  const [games, setGames] = useState<SavedGameRecord[]>([]);
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [filterModerator, setFilterModerator] = useState<string>('ALL');
  const [gameIdToDelete, setGameIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setGames(getSavedGames());
    }
  }, [isOpen]);

  const handleDeleteRequest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setGameIdToDelete(id);
  };

  const handleConfirmDelete = () => {
    if (gameIdToDelete) {
      const updated = deleteGameRecord(gameIdToDelete);
      setGames(updated);
      setGameIdToDelete(null);
    }
  };

  const filteredGames = games.filter((g) => {
    if (filterModerator === 'ALL') return true;
    return g.moderatorUsername === filterModerator;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none font-['Vazirmatn']" dir="rtl">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            className="w-full max-w-2xl max-h-[90vh] bg-wood-card border-2 border-amber-500/70 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-amber-200">
                    تاریخچه و بایگانی بازی‌های فکری نو
                  </h2>
                  <p className="text-[11px] text-[#b8a594]">
                    لیست کامل دست‌های اجرا شده همراه با نقش‌ها، امتیازات و Best Player
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#d4c3b0] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs by Moderator */}
            <div className="flex items-center gap-1.5 py-2.5 overflow-x-auto text-xs font-bold">
              <span className="text-[#a89582] text-[11px] pl-1 shrink-0">فیلتر گرداننده:</span>
              {[
                { id: 'ALL', label: 'همه گردانندگان' },
                ...getAllModeratorAccounts().map(m => ({ id: m.username, label: m.nameFa }))
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilterModerator(f.id)}
                  className={`px-3 py-1 rounded-xl transition-all cursor-pointer shrink-0 ${
                    filterModerator === f.id
                      ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-950/60'
                      : 'bg-[#1e1008] text-[#c9b7a2] border border-[#523321] hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Games List Container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 my-2 pr-1">
              {filteredGames.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#8c796b] space-y-2">
                  <History className="w-10 h-10 mx-auto opacity-40 text-amber-400" />
                  <p>هنوز اطلاعات هیچ بازی ذخیره نشده است.</p>
                  <p className="text-xs text-[#6e5d50]">
                    پس از اتمام هر دست، گرداننده می‌تواند در پنل امتیازدهی دست را ثبت و سیو کند.
                  </p>
                </div>
              ) : (
                filteredGames.map((game) => {
                  const scen = SCENARIOS[game.scenarioType] || SCENARIOS.BAZPORS;
                  const isExpanded = expandedGameId === game.id;

                  return (
                    <div
                      key={game.id}
                      className="bg-[#180c07] border border-[#523321] hover:border-amber-500/50 rounded-2xl p-3.5 transition-all space-y-2.5 shadow-md"
                    >
                      {/* Summary Row */}
                      <div
                        onClick={() => setExpandedGameId(isExpanded ? null : game.id)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-white">
                              {scen.nameFa} ({game.playerCount} نفره)
                            </span>

                            {game.outcome === 'CITIZEN_WIN' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> برد شهروند
                              </span>
                            )}
                            {game.outcome === 'MAFIA_WIN' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-950 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <Skull className="w-3 h-3" /> برد مافیا
                              </span>
                            )}
                            {game.outcome === 'DRAW' && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-950 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> تساوی
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-[#a89582]">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-amber-400" />
                              گرداننده: <strong className="text-[#ded0be]">{game.moderatorNameFa}</strong>
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-amber-400" />
                              {game.dateFa} ({game.timeFa})
                            </span>
                          </div>
                        </div>

                        {/* Best Player Pill & Expand Toggle */}
                        <div className="flex items-center gap-2">
                          {game.bestPlayerName && game.bestPlayerName !== 'تعیین نشده' && (
                            <div className="hidden sm:flex items-center gap-1 bg-amber-500/20 border border-amber-400/60 px-2.5 py-1 rounded-xl text-amber-300 text-xs font-black">
                              <Crown className="w-3.5 h-3.5 text-amber-400" />
                              <span>MVP: {game.bestPlayerName}</span>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleDeleteRequest(game.id, e)}
                            title="حذف این بازی"
                            className="p-1.5 rounded-lg bg-rose-950/30 text-rose-400 hover:bg-rose-900/60 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-amber-400 p-1">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>

                      {/* Best Player badge on mobile when expanded/not expanded */}
                      {game.bestPlayerName && game.bestPlayerName !== 'تعیین نشده' && (
                        <div className="sm:hidden flex items-center gap-1 bg-amber-500/20 border border-amber-400/60 px-2 py-0.5 rounded-lg text-amber-300 text-[11px] font-black w-fit">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>بهترین بازیکن: {game.bestPlayerName}</span>
                        </div>
                      )}

                      {/* Expanded Details: Player Table */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-2 border-t border-amber-900/30 space-y-2 overflow-hidden"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                              {game.playerScores.map((ps) => {
                                const role = ALL_ROLES[ps.roleKey];
                                const isM = role?.side === 'MAFIA';
                                return (
                                  <div
                                    key={ps.seatNumber}
                                    className={`p-2 rounded-xl flex items-center justify-between border ${
                                      ps.isBestPlayer
                                        ? 'bg-amber-950/60 border-amber-400'
                                        : 'bg-black/30 border-[#381f11]'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-5 h-5 rounded-md bg-black/70 text-rose-400 font-mono font-black flex items-center justify-center text-[10px]">
                                        {ps.seatNumber}
                                      </span>
                                      <span className="font-bold text-white text-[11px]">
                                        {ps.playerName}
                                      </span>
                                      {ps.isBestPlayer && (
                                        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                          isM ? 'text-rose-400 bg-rose-950/40' : 'text-cyan-300 bg-cyan-950/40'
                                        }`}
                                      >
                                        {role?.nameFa || ps.roleKey}
                                      </span>
                                      <span className="font-mono font-black text-amber-300 text-xs">
                                        امتیاز: {ps.score > 0 ? `+${ps.score}` : ps.score}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>

                            {game.generalNotes && (
                              <div className="p-2 bg-black/40 rounded-xl text-[11px] text-[#c9b7a2]">
                                <strong className="text-amber-400">یادداشت کلی: </strong>
                                {game.generalNotes}
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-amber-900/30 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[#140a05] font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
              >
                بستن پنجره
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* In-app Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!gameIdToDelete}
        title="حذف گزارش بازی از تاریخچه"
        message="آیا از حذف اطلاعات و آمار این بازی از آرشیو تاریخچه اطمینان دارید؟ این عملیات قابل بازگشت نیست."
        confirmText="بله، بازی حذف شود"
        cancelText="انصراف"
        onConfirm={handleConfirmDelete}
        onCancel={() => setGameIdToDelete(null)}
      />
    </AnimatePresence>
  );
};
