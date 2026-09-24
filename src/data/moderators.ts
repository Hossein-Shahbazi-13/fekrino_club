import { ModeratorAccount, ModeratorUsername, SavedGameRecord } from '../types/mafia';

export const SUPER_ADMIN_ACCOUNT: ModeratorAccount = {
  username: 'Hossein_Mad',
  pass: '@Maryam_1382',
  nameFa: 'حسین شهبازی',
  titleFa: 'مدیر کل و سرپرست عالی فکری نو',
  rank: 'DON',
  avatarColor: 'from-purple-600 via-rose-600 to-amber-500',
  status: 'APPROVED',
  isAdmin: true,
  joinedAt: '2025-01-01T00:00:00.000Z'
};

export const DEFAULT_MODERATOR_ACCOUNTS: ModeratorAccount[] = [
  SUPER_ADMIN_ACCOUNT,
  {
    username: 'solmaz',
    pass: '1111',
    nameFa: 'سولماز',
    titleFa: 'دون / گاد اعظم',
    rank: 'DON',
    avatarColor: 'from-pink-500 to-rose-600',
    status: 'APPROVED'
  },
  {
    username: 'mehrshad',
    pass: '2222',
    nameFa: 'مهرشاد',
    titleFa: 'کنسلیری / مشاور ارشد',
    rank: 'CONSIGLIERE',
    avatarColor: 'from-amber-500 to-orange-600',
    status: 'APPROVED'
  },
  {
    username: 'korush',
    pass: '3333',
    nameFa: 'کوروش',
    titleFa: 'کاپورژیم / سرپرست میز',
    rank: 'CAPO',
    avatarColor: 'from-cyan-500 to-blue-600',
    status: 'APPROVED'
  }
];

export const MODERATOR_ACCOUNTS = DEFAULT_MODERATOR_ACCOUNTS;

const MODERATOR_STORAGE_KEY = 'fekri_no_active_moderator';
const REGISTERED_MODERATORS_KEY = 'fekri_no_custom_moderators';
const SAVED_GAMES_STORAGE_KEY = 'fekri_no_saved_games';
const DELETED_MODERATORS_KEY = 'fekri_no_deleted_moderators';

export function getDeletedModerators(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_MODERATORS_KEY);
    if (raw) {
      return JSON.parse(raw) as string[];
    }
  } catch (err) {
    console.error('Failed to read deleted moderators', err);
  }
  return [];
}

export function saveDeletedModerators(usernames: string[]): void {
  try {
    localStorage.setItem(DELETED_MODERATORS_KEY, JSON.stringify(usernames));
  } catch (err) {
    console.error('Failed to save deleted moderators', err);
  }
}

export function getCustomModerators(): ModeratorAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_MODERATORS_KEY);
    if (raw) {
      return JSON.parse(raw) as ModeratorAccount[];
    }
  } catch (err) {
    console.error('Failed to read custom moderators', err);
  }
  return [];
}

export function saveCustomModerators(mods: ModeratorAccount[]): void {
  try {
    localStorage.setItem(REGISTERED_MODERATORS_KEY, JSON.stringify(mods));
  } catch (err) {
    console.error('Failed to save custom moderators', err);
  }
}

export function getAllModeratorAccounts(): ModeratorAccount[] {
  const deleted = new Set(getDeletedModerators().map(u => u.toLowerCase()));
  const custom = getCustomModerators().filter(m => !deleted.has(m.username.toLowerCase()));
  const customUsernames = new Set(custom.map(a => a.username.toLowerCase()));
  const defaultsFiltered = DEFAULT_MODERATOR_ACCOUNTS.filter(
    a => !customUsernames.has(a.username.toLowerCase()) && !deleted.has(a.username.toLowerCase())
  );
  return [...custom, ...defaultsFiltered];
}

export function getPendingModerators(): ModeratorAccount[] {
  const custom = getCustomModerators();
  return custom.filter(m => m.status === 'PENDING');
}

export function getApprovedModerators(): ModeratorAccount[] {
  const all = getAllModeratorAccounts();
  return all.filter(m => m.status === 'APPROVED' || !m.status);
}

export function approveModerator(username: string): { success: boolean; error?: string } {
  const custom = getCustomModerators();
  const targetIndex = custom.findIndex(m => m.username.toLowerCase() === username.toLowerCase());
  
  if (targetIndex === -1) {
    return { success: false, error: 'گرداننده یافت نشد.' };
  }

  custom[targetIndex].status = 'APPROVED';
  custom[targetIndex].approvedAt = new Date().toISOString();
  saveCustomModerators(custom);
  return { success: true };
}

export function rejectModerator(username: string): { success: boolean; error?: string } {
  const custom = getCustomModerators();
  const targetIndex = custom.findIndex(m => m.username.toLowerCase() === username.toLowerCase());
  
  if (targetIndex === -1) {
    return { success: false, error: 'گرداننده یافت نشد.' };
  }

  custom[targetIndex].status = 'REJECTED';
  saveCustomModerators(custom);
  return { success: true };
}

export function deleteModerator(username: string): { success: boolean; error?: string } {
  const clean = username.trim().toLowerCase();
  if (clean === 'hossein_mad') {
    return { success: false, error: 'حساب مدیر کل غیرقابل حذف است.' };
  }
  const custom = getCustomModerators();
  const filtered = custom.filter(m => m.username.toLowerCase() !== clean);
  saveCustomModerators(filtered);

  const deleted = getDeletedModerators();
  if (!deleted.includes(clean)) {
    saveDeletedModerators([...deleted, clean]);
  }
  return { success: true };
}

export function registerNewModerator(
  nameFa: string,
  username: string,
  pass: string,
  phone?: string,
  bio?: string,
  rank?: 'DON' | 'CONSIGLIERE' | 'CAPO'
): { success: boolean; error?: string; account?: ModeratorAccount; isPending?: boolean } {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = pass.trim();
  const cleanName = nameFa.trim();

  if (!cleanName) {
    return { success: false, error: 'نام و نام خانوادگی گرداننده را وارد کنید.' };
  }
  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر انگلیسی و بدون فاصله باشد.' };
  }
  if (!cleanPass || cleanPass.length < 3) {
    return { success: false, error: 'کلمه عبور باید حداقل ۳ نویسه باشد.' };
  }

  const allAccounts = getAllModeratorAccounts();
  const exists = allAccounts.some(acc => acc.username.toLowerCase() === cleanUser);
  if (exists) {
    return { success: false, error: 'این نام کاربری قبلاً در سامانه ثبت شده است.' };
  }

  const titles: Record<'DON' | 'CONSIGLIERE' | 'CAPO', string> = {
    DON: 'دون / گاد اعظم',
    CONSIGLIERE: 'کنسلیری / مشاور امین',
    CAPO: 'کاپورژیم / سرپرست میز'
  };

  const colors = [
    'from-amber-500 to-rose-600',
    'from-red-600 to-amber-700',
    'from-emerald-500 to-teal-700',
    'from-purple-500 to-indigo-700',
    'from-cyan-500 to-blue-700'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  // Create account in PENDING status - awaiting Super Admin approval
  const newAccount: ModeratorAccount = {
    username: cleanUser,
    pass: cleanPass,
    nameFa: cleanName,
    titleFa: rank ? titles[rank] : 'گرداننده بازی (در انتظار تایید)',
    rank: rank || 'CAPO',
    avatarColor: randomColor,
    phone: phone?.trim() || undefined,
    bio: bio?.trim() || undefined,
    status: 'PENDING',
    isAdmin: false,
    requestedAt: new Date().toISOString()
  };

  try {
    const existingCustom = getCustomModerators();
    const updated = [newAccount, ...existingCustom];
    saveCustomModerators(updated);
    return { success: true, account: newAccount, isPending: true };
  } catch (err) {
    console.error('Failed to register moderator', err);
    return { success: false, error: 'خطا در ثبت اطلاعات در حافظه دستگاه.' };
  }
}

export function getStoredModerator(): ModeratorAccount | null {
  try {
    const data = localStorage.getItem(MODERATOR_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data) as ModeratorAccount;
      // Super Admin check
      if (parsed.username.toLowerCase() === 'hossein_mad' && parsed.pass === '@Maryam_1382') {
        return SUPER_ADMIN_ACCOUNT;
      }
      const all = getAllModeratorAccounts();
      const matched = all.find(
        acc => acc.username.toLowerCase() === parsed.username.toLowerCase() && acc.pass === parsed.pass
      );
      if (matched && matched.status !== 'REJECTED') return matched;
    }
  } catch (err) {
    console.error('Failed to read moderator session', err);
  }
  return null;
}

export function setStoredModerator(account: ModeratorAccount | null): void {
  try {
    if (account) {
      localStorage.setItem(MODERATOR_STORAGE_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(MODERATOR_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to save moderator session', err);
  }
}

export function clearStoredModerator(): void {
  setStoredModerator(null);
}

export interface ValidateAuthResponse {
  success: boolean;
  account?: ModeratorAccount;
  isPending?: boolean;
  isRejected?: boolean;
  error?: string;
}

export function validateModeratorCredentials(usernameInput: string, passwordInput: string): ValidateAuthResponse {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  // Check Super Admin first: Hossein_Mad / @Maryam_1382
  if (cleanUser === 'hossein_mad' && cleanPass === '@Maryam_1382') {
    return { success: true, account: SUPER_ADMIN_ACCOUNT };
  }

  const all = getAllModeratorAccounts();
  const found = all.find(
    acc => acc.username.toLowerCase() === cleanUser && acc.pass === cleanPass
  );

  if (!found) {
    return { success: false, error: 'نام کاربری یا کلمه عبور اشتباه است.' };
  }

  if (found.status === 'PENDING') {
    return { 
      success: false, 
      isPending: true, 
      error: 'حساب شما در صف تأیید مدیر کل سایت (Hossein_Mad) قرار دارد. پس از بررسی و تایید مدیر، می‌توانید وارد شوید.' 
    };
  }

  if (found.status === 'REJECTED') {
    return { 
      success: false, 
      isRejected: true, 
      error: 'درخواست عضویت شما توسط مدیر سایت رد شده است.' 
    };
  }

  return { success: true, account: found };
}

export function getSavedGames(): SavedGameRecord[] {
  try {
    const raw = localStorage.getItem(SAVED_GAMES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as SavedGameRecord[];
    }
  } catch (err) {
    console.error('Failed to load saved games', err);
  }
  return [];
}

export function saveGameRecord(record: SavedGameRecord): void {
  try {
    const existing = getSavedGames();
    // Prepend new record
    const updated = [record, ...existing.filter(g => g.id !== record.id)];
    localStorage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to persist game record', err);
  }
}

export function deleteGameRecord(id: string): SavedGameRecord[] {
  try {
    const existing = getSavedGames();
    const updated = existing.filter(g => g.id !== id);
    localStorage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete game record', err);
    return [];
  }
}
