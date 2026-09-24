/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Fekri No Security & Hardening Suite:
 * - XSS input sanitization
 * - Privacy data masking (Phone numbers, credentials)
 * - Anti-brute-force rate limiting
 * - Safe JSON deserialization & system backup/restore
 */

// 1. XSS & Injection Sanitizer
export function sanitizeInput(input: string | undefined | null, maxLength = 100): string {
  if (!input) return '';
  return String(input)
    .replace(/[<>]/g, '') // Strip HTML tags
    .replace(/javascript:/gi, '') // Strip JS protocol
    .replace(/on\w+=/gi, '') // Strip event handlers like onload=, onclick=
    .trim()
    .slice(0, maxLength);
}

// 2. Phone Number Masking (Protects player privacy in public views)
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '—';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return '••••••';
  // Keep first 4 digits and last 2 digits: e.g. 0912 ••• ••34
  const start = clean.slice(0, 4);
  const end = clean.slice(-2);
  return `${start} ••• ••${end}`;
}

export function isValidIranianPhone(phone: string): boolean {
  const clean = phone.trim().replace(/[\s-]+/g, '');
  return /^09[0-9]{9}$/.test(clean);
}

export function validatePasswordStrength(password: string): { isValid: boolean; messageFa?: string } {
  if (!password || password.trim().length < 6) {
    return {
      isValid: false,
      messageFa: 'رمز عبور باید حداقل ۶ کاراکتر باشد.'
    };
  }
  return { isValid: true };
}

// 3. Simple Client Hashing to prevent plaintext password leakage in localStorage
export function hashPassword(pass: string): string {
  if (!pass) return '';
  let hash = 0;
  const salt = 'FEKRI_NO_SECURE_SALT_2026';
  const combined = pass + salt;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `fn_sec_${Math.abs(hash).toString(36)}`;
}

// 4. Anti-Brute-Force Rate Limiting (Prevents automated attacks on login)
interface RateLimitRecord {
  attempts: number;
  lockedUntil: number;
}

const RATE_LIMIT_PREFIX = 'fn_rate_limit_';

export function checkLoginRateLimit(identifier: string, maxAttempts = 5, lockDurationSeconds = 60): {
  isLocked: boolean;
  remainingSeconds: number;
} {
  try {
    const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
    const raw = sessionStorage.getItem(key);
    if (!raw) return { isLocked: false, remainingSeconds: 0 };

    const record: RateLimitRecord = JSON.parse(raw);
    const now = Date.now();

    if (record.lockedUntil && record.lockedUntil > now) {
      const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
      return { isLocked: true, remainingSeconds };
    }

    if (record.lockedUntil && record.lockedUntil <= now) {
      sessionStorage.removeItem(key);
      return { isLocked: false, remainingSeconds: 0 };
    }

    return { isLocked: false, remainingSeconds: 0 };
  } catch (e) {
    console.warn('Rate limit check error:', e);
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedLoginAttempt(identifier: string, maxAttempts = 5, lockDurationSeconds = 60): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  try {
    const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
    const raw = sessionStorage.getItem(key);
    let record: RateLimitRecord = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: 0 };

    record.attempts += 1;

    if (record.attempts >= maxAttempts) {
      record.lockedUntil = Date.now() + lockDurationSeconds * 1000;
      sessionStorage.setItem(key, JSON.stringify(record));
      return { isLocked: true, remainingSeconds: lockDurationSeconds, attemptsLeft: 0 };
    }

    sessionStorage.setItem(key, JSON.stringify(record));
    return {
      isLocked: false,
      remainingSeconds: 0,
      attemptsLeft: maxAttempts - record.attempts
    };
  } catch (e) {
    console.warn('Rate limit record error:', e);
    return { isLocked: false, remainingSeconds: 0, attemptsLeft: 3 };
  }
}

export function clearLoginRateLimit(identifier: string): void {
  try {
    const key = `${RATE_LIMIT_PREFIX}${identifier.toLowerCase().trim()}`;
    sessionStorage.removeItem(key);
  } catch (e) {
    console.warn('Rate limit clear error:', e);
  }
}

// 5. System Backup & Restore Utilities
export function generateSystemBackupJSON(): string {
  const keysToBackup = [
    'fekri_no_saved_games',
    'fekri_no_club_players',
    'fekri_no_custom_moderators',
    'fekri_no_deleted_moderators',
    'fekri_no_active_theme'
  ];

  const backupData: Record<string, unknown> = {
    exportDate: new Date().toISOString(),
    version: '1.2.0-secure',
    system: 'کافه فکری نو (FEKRI NO)',
    data: {} as Record<string, unknown>
  };

  keysToBackup.forEach((key) => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        (backupData.data as Record<string, unknown>)[key] = JSON.parse(raw);
      }
    } catch (e) {
      console.warn(`Error backing up key ${key}:`, e);
    }
  });

  return JSON.stringify(backupData, null, 2);
}

export function restoreSystemDataFromJSON(jsonContent: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || !parsed.data || typeof parsed.data !== 'object') {
      return { success: false, message: 'ساختار فایل پشتیبان معتبر نیست یا آسیب دیده است.' };
    }

    const data = parsed.data as Record<string, unknown>;
    Object.entries(data).forEach(([key, value]) => {
      localStorage.setItem(key, JSON.stringify(value));
    });

    return { success: true, message: 'اطلاعات با موفقیت بازنشانی شدند. صفحه در حال بارگذاری مجدد است...' };
  } catch (e) {
    console.error('Failed to restore backup:', e);
    return { success: false, message: 'خطا در خواندن فایل پشتیبان. لطفاً فایل JSON معتبر انتخاب نمایید.' };
  }
}
