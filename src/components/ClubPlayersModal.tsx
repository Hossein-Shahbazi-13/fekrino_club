import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Users, 
  UserPlus, 
  Search, 
  Trophy, 
  Star, 
  Gamepad2, 
  Calendar, 
  Shield, 
  Sparkles, 
  Hash, 
  Check, 
  Flame,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Award,
  Trash2
} from 'lucide-react';
import { ClubPlayer, PlayerMatchRecord } from '../types/mafia';
import { getClubPlayers, registerClubPlayer, deleteClubPlayer } from '../data/clubPlayers';
import { PlayerSkillBarChart } from './PlayerSkillBarChart';
import { ConfirmModal } from './ConfirmModal';

interface ClubPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayerForSeat?: (player: ClubPlayer) => void;
}

export const ClubPlayersModal: React.FC<ClubPlayersModalProps> = ({
  isOpen,
  onClose,
  onSelectPlayerForSeat
}) => {
  const [players, setPlayers] = useState<ClubPlayer[]>(() => getClubPlayers());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<ClubPlayer | null>(null);

  // New Player Form State
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('123456');
  const [formError, setFormError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const refreshPlayers = () => {
    setPlayers(getClubPlayers());
  };

  const handleConfirmDelete = () => {
    if (playerToDelete) {
      deleteClubPlayer(playerToDelete.id);
      refreshPlayers();
      setSuccessNotice(`بازیکن «${playerToDelete.name}» با موفقیت از باشگاه حذف شد.`);
      setPlayerToDelete(null);
    }
  };

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessNotice(null);

    const res = registerClubPlayer(newName, newPhone, newPassword);
    if (res.success && res.player) {
      setSuccessNotice(`بازیکن «${res.player.name}» با رمز عبور مشخص شده با موفقیت در باشگاه ثبت شد.`);
      setNewName('');
      setNewPhone('');
      setNewPassword('123456');
      setIsAddingNew(false);
      refreshPlayers();
      setExpandedPlayerId(res.player.id);
      setTimeout(() => setSuccessNotice(null), 3500);
    } else {
      setFormError(res.error || 'خطا در ثبت بازیکن.');
    }
  };

  const filteredPlayers = players.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      (p.phone && p.phone.includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md select-none font-['Vazirmatn']" dir="rtl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl max-h-[92vh] bg-gradient-to-b from-[#1c0d07] via-[#150804] to-[#0d0402] border-2 border-amber-600/70 rounded-3xl shadow-[0_0_50px_rgba(180,83,9,0.3)] flex flex-col overflow-hidden text-[#faf6f0]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-amber-900/40 bg-black/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-[#140804] shadow-md border border-amber-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  باشگاه بازیکنان و کارنامه بازی‌ها
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {players.length} عضو
                </span>
              </div>
              <p className="text-[11px] text-[#bda896]">
                پروفایل رسمی، شناسه‌ها (Player ID)، امتیازات، و تاریخچه نقش‌ها
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#c9b7a2] hover:text-white border border-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Search & Add Player Button */}
        <div className="p-3 sm:p-4 bg-[#120603] border-b border-amber-900/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو بر اساس نام یا آیدی بازیکن (مثال: حسین، PL-101)..."
              className="w-full bg-[#1b0c07] border border-[#523321] focus:border-amber-400 rounded-xl pr-9 pl-3 py-2 text-xs sm:text-sm text-amber-100 placeholder-[#705a4b] outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-[#140804] font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all shrink-0 border border-amber-300"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAddingNew ? 'بستن فرم' : 'عضویت پلیر جدید'}</span>
          </button>
        </div>

        {/* Success Notice Toast */}
        {successNotice && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-md">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Add Player Collapsible Form */}
        <AnimatePresence>
          {isAddingNew && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handleCreatePlayer}
              className="p-3.5 sm:p-4 bg-gradient-to-b from-[#231008] to-[#170a05] border-b border-amber-900/40 space-y-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-xs font-black text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ثبت نام پلیر جدید و صدور خودکار آیدی اختصاصی</span>
              </div>

              {formError && (
                <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-600 text-rose-200 text-xs font-bold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#d4c3b0] block">
                    نام و نام خانوادگی بازیکن:
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: حسین شهبازی"
                    className="w-full bg-[#100603] border border-[#523321] focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 placeholder-[#705a4b] outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#d4c3b0] block">
                    شماره همراه:
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="۰۹۱۲۰۰۰۰۰۰۰"
                    dir="ltr"
                    required
                    className="w-full bg-[#100603] border border-[#523321] focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 placeholder-[#705a4b] outline-none font-mono text-right"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#d4c3b0] block">
                    رمز عبور جهت ورود بازیکن به تالار بازی‌ها:
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="رمز عبور بازیکن (پیش‌فرض: 123456)"
                    dir="ltr"
                    required
                    className="w-full bg-[#100603] border border-[#523321] focus:border-amber-400 rounded-xl px-3 py-2 text-xs sm:text-sm text-amber-100 placeholder-[#705a4b] outline-none font-mono text-right"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#9c8978]">
                  عضویت رسمی در سامانه کلاب فکر نو ثبت شده و به سوابق بازی‌ها متصل خواهد شد.
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#140804] font-black text-xs shadow-md border border-amber-300 cursor-pointer active:scale-95 transition-all"
                >
                  تأیید و صدور کارت عضویت
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Players List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[60vh]">
          {filteredPlayers.length === 0 ? (
            <div className="py-12 text-center text-[#8a7566] space-y-2">
              <Users className="w-10 h-10 mx-auto opacity-30 text-amber-400" />
              <p className="text-sm font-bold">هیچ بازیکنی یافت نشد.</p>
              <p className="text-xs">می‌توانید با زدن دکمه «عضویت پلیر جدید» بازیکنان را ثبت کنید.</p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isExpanded = expandedPlayerId === player.id;

              return (
                <div
                  key={player.id}
                  className="bg-[#180b06] border border-[#482816] hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all shadow-md"
                >
                  {/* Player Summary Header */}
                  <div
                    onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                    className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02]"
                  >
                    {/* Left: Avatar + Name */}
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${player.avatarColor || 'from-amber-500 to-rose-600'} flex items-center justify-center text-white font-black text-sm shadow-md border border-white/20 shrink-0`}>
                        {player.name.trim().charAt(0) || 'P'}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black text-white">
                            {player.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-[#a89582] mt-0.5">
                          <span>{player.totalGames} مسابقه ثبت شده</span>
                          {player.bestPlayerCount > 0 && (
                            <span className="text-amber-400 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {player.bestPlayerCount} بار بست پلیر
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Score Badges & Controls */}
                    <div className="flex items-center gap-2">
                      <div className="text-center px-2.5 py-1 rounded-xl bg-black/50 border border-amber-900/40">
                        <span className="text-[9px] text-[#a89582] block leading-tight">مجموع امتیاز</span>
                        <span className={`text-sm font-black font-mono ${player.totalScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {player.totalScore > 0 ? `+${player.totalScore}` : player.totalScore}
                        </span>
                      </div>

                      {onSelectPlayerForSeat && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPlayerForSeat(player);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-md cursor-pointer transition-all active:scale-95"
                          title="انتخاب برای این صندلی"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>انتخاب</span>
                        </button>
                      )}

                      {/* Delete player button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlayerToDelete(player);
                        }}
                        className="p-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-300 border border-rose-600/30 transition-colors cursor-pointer"
                        title="حذف بازیکن از باشگاه"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        className="p-1 text-[#a89582] hover:text-white transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Match History Section */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-amber-900/40 bg-black/40 p-3 sm:p-4 space-y-3"
                      >
                        {/* D3 Bar Chart for Player Skills */}
                        <PlayerSkillBarChart player={player} />

                        <div className="flex items-center justify-between text-xs font-black text-amber-300 pb-1">
                          <span className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span>ریز تاریخچه و کارنامه بازی‌ها:</span>
                          </span>
                          <span className="text-[10px] text-[#9c8978] font-mono">
                            {player.matchHistory.length} سابقه رسمی
                          </span>
                        </div>

                        {player.matchHistory.length === 0 ? (
                          <div className="text-center py-3 text-xs text-[#8c786a]">
                            هنوز بازی ثبت‌شده‌ای برای این بازیکن در سیستم ذخیره نشده است. با اتمام هر بازی و ذخیره در پنل گرداننده، کارنامه به صورت خودکار به‌روزرسانی می‌شود.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {player.matchHistory.map((m, idx) => {
                              const isPositive = m.pointsAwarded >= 0;
                              const isMafia = m.side === 'MAFIA';

                              return (
                                <div
                                  key={m.gameId || idx}
                                  className="p-2.5 rounded-xl bg-[#1f0d06] border border-[#523321] text-xs space-y-1.5"
                                >
                                  {/* Top Row: Formatted Statement exactly as requested */}
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="font-black text-white text-[12px] leading-relaxed">
                                      <span>در تاریخ </span>
                                      <span className="font-mono text-amber-300 font-black">{m.dateFa}</span>
                                      <span> {player.name} </span>
                                      <span className={`font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {Math.abs(m.pointsAwarded)} امتیاز {isPositive ? 'مثبت' : 'منفی'}
                                      </span>
                                      {m.isBestPlayer && (
                                        <span className="inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/60 font-black text-[10px]">
                                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                                          بست پلیر
                                        </span>
                                      )}
                                      <span> • نقش </span>
                                      <span className={`font-black ${isMafia ? 'text-rose-400' : 'text-cyan-300'}`}>
                                        {m.roleNameFa}
                                      </span>
                                    </div>

                                    {/* Points badge */}
                                    <div className={`px-2 py-0.5 rounded-lg text-xs font-black font-mono shrink-0 ${
                                      isPositive
                                        ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/60'
                                        : 'bg-rose-950/80 text-rose-300 border border-rose-600/60'
                                    }`}>
                                      {isPositive ? `+${m.pointsAwarded}` : m.pointsAwarded}
                                    </div>
                                  </div>

                                  {/* Bottom Details Row: Scenario, Seat, Moderator */}
                                  <div className="flex items-center gap-2 text-[10px] text-[#a89582] pt-0.5 border-t border-white/5">
                                    <span>{m.scenarioNameFa}</span>
                                    <span>•</span>
                                    <span>صندلی {m.seatNumber}</span>
                                    <span>•</span>
                                    <span>گرداننده: {m.moderatorNameFa}</span>
                                    {m.timeFa && (
                                      <>
                                        <span>•</span>
                                        <span className="font-mono">{m.timeFa}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
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
        <div className="p-3 sm:p-4 bg-black/40 border-t border-amber-900/40 flex items-center justify-between text-xs text-[#9c8978]">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>کافه رستوران فکری نو • سامانه مدیریت باشگاه مافیا</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </motion.div>

      {/* In-app Confirm Modal for Player Deletion */}
      <ConfirmModal
        isOpen={!!playerToDelete}
        title={`حذف بازیکن «${playerToDelete?.name || ''}»`}
        message={`آیا از حذف دائم بازیکن «${playerToDelete?.name || ''}» از باشگاه و پاک‌شدن سوابق آن اطمینان دارید؟`}
        confirmText="بله، حذف شود"
        cancelText="انصراف"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPlayerToDelete(null)}
      />
    </div>
  );
};
