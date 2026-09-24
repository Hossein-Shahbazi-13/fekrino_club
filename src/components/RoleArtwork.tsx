import React, { useState } from 'react';
import { RoleKey } from '../types/mafia';

// Character Images
import bazporsImg from '../assets/images/bazpors_portrait_1786807301523.jpg';
import mafiaBossImg from '../assets/images/mafia_boss_art_1786807316535.jpg';
import takaverImg from '../assets/images/takaver_commando_1786807336255.jpg';
import detectiveImg from '../assets/images/detective_art_1786807351889.jpg';
import doctorImg from '../assets/images/doctor_medic_1786807364732.jpg';
import sniperImg from '../assets/images/sniper_portrait_1786807381413.jpg';
import namayandehImg from '../assets/images/namayandeh_portrait_1786807393331.jpg';
import hackerImg from '../assets/images/hacker_cyber_1786807407650.jpg';
import zerehpooshImg from '../assets/images/zerehpoosh_guard_1786807432782.jpg';
import sheyadImg from '../assets/images/sheyad_charlatan_1786807446974.jpg';
import citizenSimpleImg from '../assets/images/citizen_simple_1786807462667.jpg';
import mafiaSimpleImg from '../assets/images/mafia_simple_1786807477382.jpg';
import sarbazImg from '../assets/images/sarbaz_soldier_art_1786809110578.jpg';

interface RoleArtworkProps {
  roleKey: RoleKey;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCardFrame?: boolean;
}

export const ROLE_IMAGES: Record<RoleKey, string> = {
  BAZPORS: bazporsImg,
  MOHAQEQ: detectiveImg,
  TAKAVER: takaverImg,
  NEGAHBAN: zerehpooshImg,
  ZEREHPOOSH: zerehpooshImg,
  GROGANGIR: mafiaSimpleImg,
  NAMAYANDEH: namayandehImg,
  SARBAZ: sarbazImg,
  RAHNAMA: detectiveImg,
  MINGOZAR: sniperImg,
  VAKIL: namayandehImg,
  MOHAFIZ: zerehpooshImg,
  DON_MAFIA: mafiaBossImg,
  YAGHI: mafiaSimpleImg,
  HACKER: hackerImg,
  DETECTIVE: detectiveImg,
  DOCTOR: doctorImg,
  SNIPER: sniperImg,
  GUNSMITH: sniperImg,
  MAFIA_BOSS: mafiaBossImg,
  SHEYAD: sheyadImg,
  NATO: sheyadImg,
  CITIZEN_SIMPLE: citizenSimpleImg,
  MAFIA_SIMPLE: mafiaSimpleImg
};

export const RoleArtwork: React.FC<RoleArtworkProps> = ({
  roleKey,
  className = '',
  size = 'lg',
  showCardFrame = false
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-36 h-48 sm:w-44 sm:h-56',
    xl: 'w-48 h-64 sm:w-56 sm:h-72',
    '2xl': 'w-60 h-80 sm:w-72 sm:h-96'
  };

  const getArtworkMeta = (key: RoleKey) => {
    switch (key) {
      case 'BAZPORS':
        return {
          title: 'بازپرس',
          color: '#38bdf8',
          bgGradient: 'from-sky-950 via-slate-900 to-[#0c1824]',
          accentBorder: 'border-sky-400'
        };
      case 'MOHAQEQ':
        return {
          title: 'محقق',
          color: '#c084fc',
          bgGradient: 'from-purple-950 via-slate-900 to-[#190d29]',
          accentBorder: 'border-purple-400'
        };
      case 'TAKAVER':
        return {
          title: 'تکاور',
          color: '#14b8a6',
          bgGradient: 'from-teal-950 via-slate-900 to-[#04201c]',
          accentBorder: 'border-teal-400'
        };
      case 'NEGAHBAN':
        return {
          title: 'نگهبان',
          color: '#3b82f6',
          bgGradient: 'from-blue-950 via-slate-900 to-[#071830]',
          accentBorder: 'border-blue-400'
        };
      case 'ZEREHPOOSH':
        return {
          title: 'زره‌پوش',
          color: '#0ea5e9',
          bgGradient: 'from-sky-950 via-slate-900 to-[#061e2d]',
          accentBorder: 'border-sky-400'
        };
      case 'GROGANGIR':
        return {
          title: 'گروگان‌گیر',
          color: '#e11d48',
          bgGradient: 'from-rose-950 via-slate-900 to-[#22060b]',
          accentBorder: 'border-rose-500'
        };
      case 'NAMAYANDEH':
        return {
          title: 'نماینده',
          color: '#0284c7',
          bgGradient: 'from-sky-950 via-slate-900 to-[#082338]',
          accentBorder: 'border-sky-400'
        };
      case 'SARBAZ':
        return {
          title: 'سرباز',
          color: '#10b981',
          bgGradient: 'from-emerald-950 via-slate-900 to-[#052119]',
          accentBorder: 'border-emerald-400'
        };
      case 'RAHNAMA':
        return {
          title: 'راهنما',
          color: '#8b5cf6',
          bgGradient: 'from-violet-950 via-slate-900 to-[#18092c]',
          accentBorder: 'border-violet-400'
        };
      case 'MINGOZAR':
        return {
          title: 'مین‌گذار',
          color: '#d97706',
          bgGradient: 'from-amber-950 via-slate-900 to-[#291204]',
          accentBorder: 'border-amber-500'
        };
      case 'VAKIL':
        return {
          title: 'وکیل',
          color: '#6366f1',
          bgGradient: 'from-indigo-950 via-slate-900 to-[#101334]',
          accentBorder: 'border-indigo-400'
        };
      case 'MOHAFIZ':
        return {
          title: 'محافظ',
          color: '#059669',
          bgGradient: 'from-emerald-950 via-slate-900 to-[#042017]',
          accentBorder: 'border-emerald-400'
        };
      case 'DON_MAFIA':
      case 'MAFIA_BOSS':
        return {
          title: 'رئیس مافیا',
          color: '#ef4444',
          bgGradient: 'from-red-950 via-slate-900 to-[#2b0709]',
          accentBorder: 'border-red-500'
        };
      case 'YAGHI':
        return {
          title: 'یاغی',
          color: '#e11d48',
          bgGradient: 'from-rose-950 via-slate-900 to-[#2b0811]',
          accentBorder: 'border-rose-500'
        };
      case 'HACKER':
        return {
          title: 'هکر',
          color: '#f43f5e',
          bgGradient: 'from-pink-950 via-slate-900 to-[#220713]',
          accentBorder: 'border-pink-500'
        };
      case 'DETECTIVE':
        return {
          title: 'کارآگاه',
          color: '#06b6d4',
          bgGradient: 'from-cyan-950 via-slate-900 to-[#07191e]',
          accentBorder: 'border-cyan-400'
        };
      case 'DOCTOR':
        return {
          title: 'پزشک',
          color: '#10b981',
          bgGradient: 'from-emerald-950 via-slate-900 to-[#071f16]',
          accentBorder: 'border-emerald-400'
        };
      case 'SNIPER':
        return {
          title: 'تک‌تیرانداز',
          color: '#f59e0b',
          bgGradient: 'from-amber-950 via-slate-900 to-[#221305]',
          accentBorder: 'border-amber-400'
        };
      case 'GUNSMITH':
        return {
          title: 'تفنگ‌دار',
          color: '#818cf8',
          bgGradient: 'from-indigo-950 via-slate-900 to-[#10132b]',
          accentBorder: 'border-indigo-400'
        };
      case 'SHEYAD':
        return {
          title: 'شیاد',
          color: '#fb7185',
          bgGradient: 'from-pink-950 via-slate-900 to-[#220712]',
          accentBorder: 'border-pink-500'
        };
      case 'NATO':
        return {
          title: 'ناتو',
          color: '#ea580c',
          bgGradient: 'from-orange-950 via-slate-900 to-[#220904]',
          accentBorder: 'border-orange-500'
        };
      case 'CITIZEN_SIMPLE':
        return {
          title: 'شهروند ساده',
          color: '#94a3b8',
          bgGradient: 'from-slate-900 via-zinc-900 to-[#121418]',
          accentBorder: 'border-slate-400'
        };
      case 'MAFIA_SIMPLE':
      default:
        return {
          title: 'مافیای ساده',
          color: '#dc2626',
          bgGradient: 'from-red-950 via-slate-900 to-[#1f0505]',
          accentBorder: 'border-red-600'
        };
    }
  };

  const { color, bgGradient, accentBorder, title } = getArtworkMeta(roleKey);
  const imageUrl = ROLE_IMAGES[roleKey];

  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b ${bgGradient} border-2 ${accentBorder} shadow-2xl select-none group transition-all duration-300 ${className}`}
      style={{
        boxShadow: `0 0 30px 6px ${color}40, 0 10px 25px rgba(0,0,0,0.9), inset 0 0 20px ${color}25`
      }}
    >
      {/* High Quality Cinematic Character Image */}
      {imageUrl && !imgError ? (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
          {/* Subtle Vignette & Tint Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
        </div>
      ) : (
        /* Fallback Graphic */
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 text-center">
          <div className="text-4xl mb-2 font-black" style={{ color }}>
            {title.charAt(0)}
          </div>
          <div className="text-xs font-bold text-white/90">{title}</div>
        </div>
      )}

      {/* Gold/Metallic Corner Accents */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-300/80 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-300/80 pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-300/80 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-300/80 pointer-events-none" />

      {/* Specular Glaze */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none rounded-2xl" />
    </div>
  );
};

