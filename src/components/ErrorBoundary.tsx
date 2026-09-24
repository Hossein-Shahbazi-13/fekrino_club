/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Global Mafia-themed Error Boundary for FEKRI NO App
 * Prevents blank white screens or crashes and provides a graceful recovery flow.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { clearLiveGameState } from '../utils/gameStateStorage';
import { ShieldAlert, RefreshCw, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('FEKRI_NO_UNCAUGHT_RUNTIME_ERROR:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleResetGameState = () => {
    try {
      // Clear live game state so corrupted memory does not persist
      clearLiveGameState();
      // Reset error state
      this.setState({ hasError: false, error: null, errorInfo: null });
      // Redirect to safe clean entry
      window.location.href = window.location.origin + window.location.pathname;
    } catch (e) {
      console.error('Reset error:', e);
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen bg-[#090403] text-[#f7f2ea] flex items-center justify-center p-4 font-['Vazirmatn',sans-serif]" 
          dir="rtl"
        >
          {/* Subtle Ambient Background */}
          <div className="fixed inset-0 bg-radial-gradient from-rose-950/20 via-[#0a0403] to-[#040101] pointer-events-none" />

          <div className="relative z-10 max-w-lg w-full rounded-3xl bg-[#140805] border border-rose-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-center space-y-6">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-950/60 border border-rose-600/50 flex items-center justify-center text-rose-400 shadow-[0_0_30px_rgba(225,29,72,0.3)]">
              <ShieldAlert className="w-9 h-9 animate-pulse" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-rose-950/80 border border-rose-700/50 text-rose-300 text-[11px] font-bold">
                محافظ هوشمند سیستم • امنیت پایدار
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                سکوت شب شکست! خطایی غیرمنتظره رخ داد
              </h1>
              <p className="text-xs sm:text-sm text-[#baa897] leading-relaxed">
                سامانه امنیتی فکری نو جهت جلوگیری از اختلال در روند بازی و حفظ سوابق، اجرای بخش مربوطه را متوقف کرد. برای ادامه کار یکی از گزینه‌های زیر را انتخاب نمایید:
              </p>
            </div>

            {/* Action Recovery Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleResetGameState}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-black font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>بازنشانی وضعیت بازی و ورود امن</span>
              </button>

              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs sm:text-sm border border-white/10 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>بارگذاری مجدد صفحه</span>
              </button>
            </div>

            {/* Technical Details Accordion */}
            <div className="border-t border-amber-950/60 pt-4 text-right">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="text-[11px] text-[#8c796b] hover:text-[#d4c3b0] flex items-center justify-between w-full cursor-pointer py-1"
              >
                <span>مشاهده جزئیات فنی خطا (پشتیبانی کافه)</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              {this.state.showDetails && (
                <div className="mt-2 p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[10px] text-rose-300 text-left overflow-x-auto max-h-40 select-text" dir="ltr">
                  <div><strong>Error:</strong> {this.state.error?.toString()}</div>
                  {this.state.errorInfo?.componentStack && (
                    <div className="mt-1 text-neutral-400 whitespace-pre">
                      {this.state.errorInfo.componentStack}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cafe Footer Note */}
            <div className="text-[11px] text-[#705e50]">
              کافه رستوران فکری نو • سامانه مدیریت و رتبه‌بندی مافیا
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
