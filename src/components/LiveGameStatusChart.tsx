import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { ShieldCheck, Skull, Activity, TrendingUp, Users, Award } from 'lucide-react';
import { PlayerScoreEntry, RoleKey } from '../types/mafia';
import { ALL_ROLES } from '../data/scenarioData';

interface LiveGameStatusChartProps {
  playerScores: PlayerScoreEntry[];
  aliveSeats: number[]; // seats of alive players
  onToggleAlive?: (seatNumber: number) => void;
}

export const LiveGameStatusChart: React.FC<LiveGameStatusChartProps> = ({
  playerScores,
  aliveSeats,
  onToggleAlive
}) => {
  const [chartMode, setChartMode] = useState<'OVERVIEW' | 'SCORES'>('OVERVIEW');

  // Compute live counts
  const totalPlayers = playerScores.length;
  const aliveCount = aliveSeats.length;
  const eliminatedCount = totalPlayers - aliveCount;

  // Identify mafia vs citizens
  const mafiaSeats = playerScores.filter(p => {
    const roleDef = ALL_ROLES[p.roleKey];
    return roleDef?.side === 'MAFIA' || p.roleKey.includes('MAFIA') || p.roleKey === 'NATO' || p.roleKey === 'SHEYAD';
  });

  const citizenSeats = playerScores.filter(p => !mafiaSeats.some(m => m.seatNumber === p.seatNumber));

  const eliminatedMafiaCount = mafiaSeats.filter(m => !aliveSeats.includes(m.seatNumber)).length;
  const aliveMafiaCount = mafiaSeats.length - eliminatedMafiaCount;

  const eliminatedCitizenCount = citizenSeats.filter(c => !aliveSeats.includes(c.seatNumber)).length;
  const aliveCitizenCount = citizenSeats.length - eliminatedCitizenCount;

  // Overview status data for BarChart
  const overviewData = [
    {
      name: 'کل بازیکنان زنده',
      تعداد: aliveCount,
      fill: '#10b981', // emerald
      category: 'ALIVE'
    },
    {
      name: 'شهروندان زنده',
      تعداد: aliveCitizenCount,
      fill: '#38bdf8', // sky blue
      category: 'CITIZEN'
    },
    {
      name: 'مافیاهای زنده',
      تعداد: aliveMafiaCount,
      fill: '#f43f5e', // rose
      category: 'MAFIA'
    },
    {
      name: 'مافیاهای حذف شده',
      تعداد: eliminatedMafiaCount,
      fill: '#fbbf24', // amber
      category: 'ELIMINATED_MAFIA'
    },
    {
      name: 'شهروندان حذف شده',
      تعداد: eliminatedCitizenCount,
      fill: '#64748b', // slate
      category: 'ELIMINATED_CITIZEN'
    }
  ];

  // Real-time score distribution data for each seat
  const scoreTrendData = playerScores.map(p => {
    const isAlive = aliveSeats.includes(p.seatNumber);
    const roleDef = ALL_ROLES[p.roleKey];
    const isMafia = roleDef?.side === 'MAFIA' || p.roleKey.includes('MAFIA');

    return {
      seatNumber: `صندلی ${p.seatNumber}`,
      name: p.playerName,
      امتیاز: p.score,
      وضعیت: isAlive ? 'زنده' : 'حذف شده',
      سمت: isMafia ? 'مافیا' : 'شهروند',
      نقش: roleDef?.nameFa || p.roleKey,
      isAlive,
      isMafia
    };
  });

  return (
    <div className="w-full bg-gradient-to-b from-[#180b06] to-[#120603] border-2 border-amber-600/50 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-4 font-['Vazirmatn'] select-none">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
              <span>دیده‌بان زنده وضعیت بازی (Recharts)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
                LIVE STATUS
              </span>
            </h3>
            <p className="text-[11px] text-[#a89582]">
              پایش بلادرنگ تعداد بازیکنان زنده، مافیاهای شکار شده و نمرات صندلی‌ها
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-amber-900/50">
          <button
            type="button"
            onClick={() => setChartMode('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartMode === 'OVERVIEW'
                ? 'bg-amber-500 text-black shadow font-black'
                : 'text-[#c9b7a2] hover:text-white'
            }`}
          >
            توازن زنده‌ها و حذف‌شده‌ها
          </button>
          <button
            type="button"
            onClick={() => setChartMode('SCORES')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              chartMode === 'SCORES'
                ? 'bg-amber-500 text-black shadow font-black'
                : 'text-[#c9b7a2] hover:text-white'
            }`}
          >
            روند امتیازات صندلی‌ها
          </button>
        </div>
      </div>

      {/* 3 Quick KPI Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Alive Players */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#0c2419] to-[#091811] border border-emerald-500/40 text-center">
          <div className="text-[10px] text-emerald-300 font-bold flex items-center justify-center gap-1 mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>بازیکنان زنده</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
            {aliveCount} <span className="text-xs font-normal text-emerald-200/70">/ {totalPlayers}</span>
          </div>
        </div>

        {/* Eliminated Mafia */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#291705] to-[#1c0e04] border border-amber-500/50 text-center">
          <div className="text-[10px] text-amber-300 font-bold flex items-center justify-center gap-1 mb-1">
            <Skull className="w-3.5 h-3.5 text-amber-400" />
            <span>مافیاهای حذف شده</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">
            {eliminatedMafiaCount} <span className="text-xs font-normal text-amber-200/70">/ {mafiaSeats.length}</span>
          </div>
        </div>

        {/* Active Mafia Left */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-[#260a0f] to-[#170509] border border-rose-500/40 text-center">
          <div className="text-[10px] text-rose-300 font-bold flex items-center justify-center gap-1 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مافیای زنده باقی‌مانده</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-rose-400">
            {aliveMafiaCount}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-64 bg-black/40 rounded-2xl border border-amber-900/40 p-2 sm:p-3">
        {chartMode === 'OVERVIEW' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overviewData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#382218" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#d4c3b0', fontSize: 11, fontFamily: 'Vazirmatn' }} 
                stroke="#523321" 
              />
              <YAxis 
                tick={{ fill: '#9e8979', fontSize: 10, fontFamily: 'Vazirmatn' }} 
                stroke="#523321" 
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c0c07', 
                  borderColor: '#b45309', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'Vazirmatn',
                  textAlign: 'right'
                }} 
              />
              <Bar dataKey="تعداد" radius={[8, 8, 0, 0]}>
                {overviewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={scoreTrendData} margin={{ top: 15, right: 15, left: -20, bottom: 25 }}>
              <defs>
                <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#382218" opacity={0.6} />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#d4c3b0', fontSize: 10, fontFamily: 'Vazirmatn' }} 
                stroke="#523321" 
              />
              <YAxis 
                tick={{ fill: '#9e8979', fontSize: 10, fontFamily: 'Vazirmatn' }} 
                stroke="#523321" 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1c0c07', 
                  borderColor: '#b45309', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontFamily: 'Vazirmatn',
                  textAlign: 'right'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="امتیاز" 
                stroke="#fbbf24" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#scoreColor)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alive / Eliminated Quick Toggle Grid */}
      {onToggleAlive && (
        <div className="space-y-2 pt-1 border-t border-amber-900/30">
          <div className="flex items-center justify-between text-xs text-[#a89582]">
            <span className="font-bold text-amber-300">کنترل وضعیت حیات بازیکنان (کلیک جهت حذف / بازگردانی):</span>
            <span className="text-[10px]">سبز = زنده | خاکستری/قرمز = حذف شده</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-7 lg:grid-cols-10 gap-1.5">
            {playerScores.map(p => {
              const isAlive = aliveSeats.includes(p.seatNumber);
              const roleDef = ALL_ROLES[p.roleKey];
              const isMafia = roleDef?.side === 'MAFIA' || p.roleKey.includes('MAFIA');

              return (
                <button
                  key={p.seatNumber}
                  type="button"
                  onClick={() => onToggleAlive(p.seatNumber)}
                  title={`${p.playerName} (${roleDef?.nameFa || p.roleKey}) - کلیک برای تغییر وضعیت حیات`}
                  className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isAlive
                      ? 'bg-emerald-950/60 border-emerald-500/70 text-emerald-200 hover:bg-emerald-900/80'
                      : 'bg-black/60 border-rose-900/60 text-[#715d51] opacity-70 hover:opacity-100 hover:border-rose-500'
                  }`}
                >
                  <div className="text-[10px] font-mono font-bold text-amber-300">
                    #{p.seatNumber}
                  </div>
                  <div className="text-[11px] font-bold truncate max-w-[55px]">
                    {p.playerName}
                  </div>
                  <div className={`text-[9px] font-mono mt-0.5 ${isAlive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isAlive ? 'زنده' : 'حذف'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
