import React from 'react';
import officialLogoImg from '../assets/images/fekri_no_exact_logo_1786809095801.jpg';

interface FekriNoLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showSubtitle?: boolean;
  glow?: boolean;
}

export const FekriNoLogo: React.FC<FekriNoLogoProps> = ({
  size = 'md',
  className = '',
  showSubtitle = true,
  glow = true
}) => {
  const sizeMap = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-36 h-36',
    xl: 'w-48 h-48',
    '2xl': 'w-60 h-60'
  };

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Official Circular Logo with Glowing Golden Accent */}
      <div
        className={`relative ${sizeMap[size]} rounded-full overflow-hidden flex items-center justify-center bg-black transition-transform duration-300 border-2 border-[#facc15]/80`}
        style={{
          boxShadow: glow 
            ? '0 0 35px 8px rgba(250, 204, 21, 0.45), 0 12px 32px rgba(0,0,0,0.95), inset 0 0 20px rgba(250, 204, 21, 0.2)' 
            : '0 10px 28px rgba(0,0,0,0.85)'
        }}
      >
        {/* Exact Official Logo Image */}
        <img
          src={officialLogoImg}
          alt="فکری نو - NOVA COGITATIO"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-100"
        />

        {/* Vintage Specular Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none rounded-full" />
      </div>

      {/* Under-Logo Large Prominent Text */}
      {showSubtitle && (
        <div className="text-center mt-3 space-y-1">
          <div className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 drop-shadow-[0_2px_12px_rgba(250,204,21,0.6)] font-['Vazirmatn']">
            فکری نو
          </div>
          <div className="text-xs sm:text-sm font-black tracking-widest text-amber-300/90 uppercase font-mono">
            FEKRI NO • NOVA COGITATIO
          </div>
          <div className="text-[11px] text-[#e0c4a4] font-medium">
            کافه بازی و رستوران • سامانه اختصاصی توزیع نقش مافیا
          </div>
        </div>
      )}
    </div>
  );
};



