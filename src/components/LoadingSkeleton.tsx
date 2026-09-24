/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Subtle Loading Skeletons & Spinners for Admin Dashboard & Player Hall
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export const InlineSpinner: React.FC<{ text?: string }> = ({ text = 'در حال همگام‌سازی و بارگذاری داده‌ها...' }) => (
  <div className="flex items-center justify-center gap-2.5 py-6 text-xs text-amber-300 font-bold animate-fadeIn">
    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
    <span>{text}</span>
  </div>
);

export const StatCardSkeleton: React.FC = () => (
  <div className="p-4 sm:p-5 rounded-2xl bg-[#180a06] border border-amber-900/30 space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-24 h-3 rounded-md skeleton-shimmer bg-white/5" />
      <div className="w-5 h-5 rounded-md skeleton-shimmer bg-white/5" />
    </div>
    <div className="w-16 h-7 rounded-lg skeleton-shimmer bg-white/10" />
    <div className="w-32 h-2.5 rounded skeleton-shimmer bg-white/5" />
  </div>
);

export const TableRowsSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => (
  <div className="divide-y divide-amber-950/40 w-full animate-fadeIn">
    {Array.from({ length: rows }).map((_, rIdx) => (
      <div key={rIdx} className="p-3.5 flex items-center justify-between gap-4">
        {Array.from({ length: columns }).map((_, cIdx) => (
          <div 
            key={cIdx} 
            className="h-3.5 rounded skeleton-shimmer bg-white/5" 
            style={{ 
              width: cIdx === 0 ? '24px' : cIdx === 1 ? '100px' : '60px',
              opacity: 0.9 - cIdx * 0.1 
            }} 
          />
        ))}
      </div>
    ))}
  </div>
);

export const ModeratorCardsSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fadeIn">
    {Array.from({ length: 3 }).map((_, idx) => (
      <div key={idx} className="p-4 rounded-2xl bg-[#180a06] border border-amber-900/30 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full skeleton-shimmer bg-white/10" />
          <div className="space-y-1.5 flex-1">
            <div className="w-28 h-3.5 rounded skeleton-shimmer bg-white/10" />
            <div className="w-20 h-2.5 rounded skeleton-shimmer bg-white/5" />
          </div>
        </div>
        <div className="w-36 h-2.5 rounded skeleton-shimmer bg-white/5" />
      </div>
    ))}
  </div>
);

export const PlayerHallStatsSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fadeIn">
    {/* Profile Header Skeleton */}
    <div className="p-6 rounded-3xl bg-[#140805] border border-amber-900/40 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl skeleton-shimmer bg-white/10" />
        <div className="space-y-2">
          <div className="w-32 h-5 rounded-lg skeleton-shimmer bg-white/15" />
          <div className="w-48 h-3 rounded skeleton-shimmer bg-white/5" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="w-24 h-12 rounded-xl skeleton-shimmer bg-white/10" />
        <div className="w-24 h-12 rounded-xl skeleton-shimmer bg-white/10" />
        <div className="w-24 h-12 rounded-xl skeleton-shimmer bg-white/10" />
      </div>
    </div>

    {/* Match History List Skeleton */}
    <div className="p-5 rounded-3xl bg-[#140805] border border-amber-900/40 space-y-3">
      <div className="w-32 h-4 rounded skeleton-shimmer bg-white/10 mb-4" />
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="p-3.5 rounded-2xl bg-black/30 border border-amber-950/60 flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="w-28 h-3.5 rounded skeleton-shimmer bg-white/10" />
            <div className="w-44 h-2.5 rounded skeleton-shimmer bg-white/5" />
          </div>
          <div className="w-16 h-5 rounded-lg skeleton-shimmer bg-white/10" />
        </div>
      ))}
    </div>
  </div>
);
