import { ClubPlayer, PlayerMatchRecord, GameOutcome, PlayerScoreEntry, RoleKey } from '../types/mafia';
import { ALL_ROLES } from './scenarioData';

const CLUB_PLAYERS_STORAGE_KEY = 'fekri_no_club_players';

// Initial sample club players with preloaded match histories as requested
export const INITIAL_CLUB_PLAYERS: ClubPlayer[] = [
  {
    id: 'PL-101',
    name: 'حسین شهبازی',
    phone: '09120000001',
    password: '123456',
    avatarColor: 'from-amber-500 to-rose-600',
    totalScore: 28,
    totalGames: 4,
    bestPlayerCount: 2,
    registeredAt: '2026-08-15T12:00:00.000Z',
    matchHistory: [
      {
        gameId: 'game_init_1',
        dateFa: '1405/06/10',
        timeFa: '21:30',
        scenarioNameFa: 'سناریو بازپرس',
        roleKey: 'DOCTOR',
        roleNameFa: 'دکتر',
        side: 'CITIZEN',
        seatNumber: 4,
        pointsAwarded: 5,
        isBestPlayer: true,
        gameResult: 'CITIZEN_WIN',
        moderatorNameFa: 'سولماز',
        summaryTextFa: 'در تاریخ 10/06/1405 حسین شهبازی 5 امتیاز مثبت • بست پلیر • نقش دکتر'
      },
      {
        gameId: 'game_init_2',
        dateFa: '1405/06/04',
        timeFa: '20:15',
        scenarioNameFa: 'سناریو تکاور',
        roleKey: 'TAKAVER',
        roleNameFa: 'تکاور',
        side: 'CITIZEN',
        seatNumber: 2,
        pointsAwarded: 11,
        isBestPlayer: false,
        gameResult: 'CITIZEN_WIN',
        moderatorNameFa: 'مهرشاد',
        summaryTextFa: 'در تاریخ 1405/06/04 حسین شهبازی 11 امتیاز مثبت • نقش تکاور'
      },
      {
        gameId: 'game_init_3',
        dateFa: '1405/05/28',
        timeFa: '22:00',
        scenarioNameFa: 'سناریو نماینده',
        roleKey: 'DON_MAFIA',
        roleNameFa: 'رئیس مافیا',
        side: 'MAFIA',
        seatNumber: 8,
        pointsAwarded: 12,
        isBestPlayer: true,
        gameResult: 'MAFIA_WIN',
        moderatorNameFa: 'کوروش',
        summaryTextFa: 'در تاریخ 1405/05/28 حسین شهبازی 12 امتیاز مثبت • بست پلیر • نقش رئیس مافیا'
      }
    ]
  },
  {
    id: 'PL-102',
    name: 'مهرشاد مرادی',
    phone: '09120000002',
    password: '123456',
    avatarColor: 'from-purple-500 to-indigo-600',
    totalScore: 35,
    totalGames: 5,
    bestPlayerCount: 3,
    registeredAt: '2026-08-16T14:00:00.000Z',
    matchHistory: [
      {
        gameId: 'game_init_4',
        dateFa: '1405/06/16',
        timeFa: '22:45',
        scenarioNameFa: 'سناریو بازپرس',
        roleKey: 'MAFIA_SIMPLE',
        roleNameFa: 'مافیا ساده',
        side: 'MAFIA',
        seatNumber: 7,
        pointsAwarded: 12,
        isBestPlayer: true,
        gameResult: 'MAFIA_WIN',
        moderatorNameFa: 'سولماز',
        summaryTextFa: 'در تاریخ 16/06/1405 مهرشاد مرادی 12 امتیاز مثبت • بست پلیر • نقش مافیا ساده'
      },
      {
        gameId: 'game_init_5',
        dateFa: '1405/06/08',
        timeFa: '19:30',
        scenarioNameFa: 'سناریو نماینده',
        roleKey: 'NAMAYANDEH',
        roleNameFa: 'نماینده',
        side: 'CITIZEN',
        seatNumber: 5,
        pointsAwarded: 9,
        isBestPlayer: false,
        gameResult: 'CITIZEN_WIN',
        moderatorNameFa: 'کوروش',
        summaryTextFa: 'در تاریخ 1405/06/08 مهرشاد مرادی 9 امتیاز مثبت • نقش نماینده'
      }
    ]
  },
  {
    id: 'PL-103',
    name: 'سولماز رضایی',
    phone: '09120000003',
    password: '123456',
    avatarColor: 'from-pink-500 to-rose-600',
    totalScore: 22,
    totalGames: 3,
    bestPlayerCount: 1,
    registeredAt: '2026-08-18T16:00:00.000Z',
    matchHistory: [
      {
        gameId: 'game_init_6',
        dateFa: '1405/06/12',
        timeFa: '21:00',
        scenarioNameFa: 'سناریو بازپرس',
        roleKey: 'BAZPORS',
        roleNameFa: 'بازپرس',
        side: 'CITIZEN',
        seatNumber: 1,
        pointsAwarded: 10,
        isBestPlayer: true,
        gameResult: 'CITIZEN_WIN',
        moderatorNameFa: 'مهرشاد',
        summaryTextFa: 'در تاریخ 1405/06/12 سولماز رضایی 10 امتیاز مثبت • بست پلیر • نقش بازپرس'
      }
    ]
  },
  {
    id: 'PL-104',
    name: 'کوروش کمالی',
    phone: '09120000004',
    password: '123456',
    avatarColor: 'from-cyan-500 to-blue-600',
    totalScore: 18,
    totalGames: 3,
    bestPlayerCount: 1,
    registeredAt: '2026-08-19T17:00:00.000Z',
    matchHistory: [
      {
        gameId: 'game_init_7',
        dateFa: '1405/06/14',
        timeFa: '20:30',
        scenarioNameFa: 'سناریو تکاور',
        roleKey: 'DETECTIVE',
        roleNameFa: 'کارآگاه',
        side: 'CITIZEN',
        seatNumber: 3,
        pointsAwarded: 8,
        isBestPlayer: false,
        gameResult: 'CITIZEN_WIN',
        moderatorNameFa: 'سولماز',
        summaryTextFa: 'در تاریخ 1405/06/14 کوروش کمالی 8 امتیاز مثبت • نقش کارآگاه'
      }
    ]
  },
  {
    id: 'PL-105',
    name: 'آرش شریفی',
    phone: '09120000005',
    password: '123456',
    avatarColor: 'from-emerald-500 to-teal-600',
    totalScore: 14,
    totalGames: 2,
    bestPlayerCount: 0,
    registeredAt: '2026-08-20T18:00:00.000Z',
    matchHistory: []
  },
  {
    id: 'PL-106',
    name: 'مهسا کاظمی',
    phone: '09120000006',
    password: '123456',
    avatarColor: 'from-amber-600 to-yellow-500',
    totalScore: 19,
    totalGames: 3,
    bestPlayerCount: 1,
    registeredAt: '2026-08-21T19:00:00.000Z',
    matchHistory: []
  }
];

export function getClubPlayers(): ClubPlayer[] {
  try {
    const raw = localStorage.getItem(CLUB_PLAYERS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as ClubPlayer[];
    }
  } catch (err) {
    console.error('Failed to read club players', err);
  }
  // Initialize with initial players if empty
  try {
    localStorage.setItem(CLUB_PLAYERS_STORAGE_KEY, JSON.stringify(INITIAL_CLUB_PLAYERS));
  } catch (e) {
    // Ignore storage issues
  }
  return INITIAL_CLUB_PLAYERS;
}

export function saveClubPlayers(players: ClubPlayer[]): void {
  try {
    localStorage.setItem(CLUB_PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (err) {
    console.error('Failed to save club players', err);
  }
}

export const ACTIVE_PLAYER_STORAGE_KEY = 'fekri_no_active_player';

export function getStoredPlayerSession(): ClubPlayer | null {
  try {
    const raw = localStorage.getItem(ACTIVE_PLAYER_STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as ClubPlayer;
      const all = getClubPlayers();
      const current = all.find(p => p.id === stored.id);
      return current || stored;
    }
  } catch (err) {
    console.error('Failed to read player session', err);
  }
  return null;
}

export function setStoredPlayerSession(player: ClubPlayer | null): void {
  try {
    if (player) {
      localStorage.setItem(ACTIVE_PLAYER_STORAGE_KEY, JSON.stringify(player));
    } else {
      localStorage.removeItem(ACTIVE_PLAYER_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Failed to set player session', err);
  }
}

export function clearStoredPlayerSession(): void {
  setStoredPlayerSession(null);
}

export function validatePlayerCredentials(
  identifierInput: string,
  passwordInput: string
): { success: boolean; player?: ClubPlayer; error?: string } {
  const cleanId = identifierInput.trim();
  const cleanPass = passwordInput.trim();

  if (!cleanId) {
    return { success: false, error: 'لطفاً شماره همراه یا نام بازیکن را وارد کنید.' };
  }
  if (!cleanPass) {
    return { success: false, error: 'لطفاً کلمه عبور را وارد کنید.' };
  }

  const allPlayers = getClubPlayers();

  // Normalize phone matching: handles e.g. 0912 vs 912
  const normalizedSearch = cleanId.replace(/\s+/g, '');
  const matched = allPlayers.find((p) => {
    if (p.name.trim().toLowerCase() === cleanId.toLowerCase()) return true;
    if (p.phone) {
      const pPhoneNorm = p.phone.replace(/\s+/g, '');
      if (pPhoneNorm === normalizedSearch) return true;
      if (pPhoneNorm.replace(/^0/, '') === normalizedSearch.replace(/^0/, '')) return true;
    }
    return false;
  });

  if (!matched) {
    return { success: false, error: 'بازیکنی با این مشخصات یافت نشد. لطفاً از صحت شماره همراه یا نام اطمینان حاصل کنید.' };
  }

  const validPassword = matched.password || '123456';
  if (cleanPass !== validPassword) {
    return { success: false, error: 'کلمه عبور وارد شده نادرست است.' };
  }

  return { success: true, player: matched };
}

export function registerClubPlayer(
  name: string, 
  phone?: string, 
  password?: string
): { success: boolean; player?: ClubPlayer; error?: string } {
  const cleanName = name.trim();
  if (!cleanName) {
    return { success: false, error: 'لطفاً نام بازیکن را وارد کنید.' };
  }

  const cleanPhone = phone?.trim();
  if (!cleanPhone) {
    return { success: false, error: 'وارد کردن شماره همراه برای ثبت‌نام و ورود الزامی است.' };
  }

  const cleanPass = password?.trim() || '123456';
  if (cleanPass.length < 4) {
    return { success: false, error: 'کلمه عبور باید حداقل ۴ نویسه باشد.' };
  }

  const existing = getClubPlayers();

  // Check if duplicate phone exists
  const duplicatePhone = existing.find(
    (p) => p.phone && p.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')
  );
  if (duplicatePhone) {
    return {
      success: false,
      error: `این شماره تماس قبلاً برای بازیکن «${duplicatePhone.name}» ثبت شده است. لطفاً وارد شوید.`
    };
  }
  
  // Generate next sequential ID
  let nextIdNumber = 101;
  existing.forEach(p => {
    const match = p.id.match(/^PL-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= nextIdNumber) {
        nextIdNumber = num + 1;
      }
    }
  });

  const newId = `PL-${nextIdNumber}`;
  const colors = [
    'from-amber-500 to-rose-600',
    'from-purple-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-red-700',
    'from-amber-600 to-orange-600'
  ];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newPlayer: ClubPlayer = {
    id: newId,
    name: cleanName,
    phone: cleanPhone,
    password: cleanPass,
    avatarColor: randomColor,
    totalScore: 0,
    totalGames: 0,
    bestPlayerCount: 0,
    registeredAt: new Date().toISOString(),
    matchHistory: []
  };

  const updated = [newPlayer, ...existing];
  saveClubPlayers(updated);
  return { success: true, player: newPlayer };
}

export function updateClubPlayersFromGameRecord(
  gameId: string,
  dateFa: string,
  timeFa: string,
  scenarioNameFa: string,
  playerScores: PlayerScoreEntry[],
  gameResult: GameOutcome,
  moderatorNameFa: string
): void {
  const players = getClubPlayers();
  let modified = false;

  playerScores.forEach((pScore) => {
    // Match by playerId if assigned or by trimmed name
    const targetPlayer = players.find(
      (cp) => (pScore.playerId && cp.id === pScore.playerId) || cp.name.trim() === pScore.playerName.trim()
    );

    if (targetPlayer) {
      modified = true;
      targetPlayer.totalGames += 1;
      targetPlayer.totalScore += pScore.score;
      if (pScore.isBestPlayer) {
        targetPlayer.bestPlayerCount += 1;
      }

      const roleObj = ALL_ROLES[pScore.roleKey];
      const roleName = roleObj ? roleObj.nameFa : pScore.roleKey;
      const roleSide = roleObj ? roleObj.side : 'CITIZEN';

      const pointSign = pScore.score >= 0 ? `${pScore.score} امتیاز مثبت` : `${Math.abs(pScore.score)} امتیاز منفی`;
      const bpNote = pScore.isBestPlayer ? ' • بست پلیر' : '';
      const summaryTextFa = `در تاریخ ${dateFa} ${targetPlayer.name} ${pointSign}${bpNote} • نقش ${roleName}`;

      const matchRec: PlayerMatchRecord = {
        gameId,
        dateFa,
        timeFa,
        scenarioNameFa,
        roleKey: pScore.roleKey,
        roleNameFa: roleName,
        side: roleSide,
        seatNumber: pScore.seatNumber,
        pointsAwarded: pScore.score,
        isBestPlayer: pScore.isBestPlayer,
        gameResult,
        moderatorNameFa,
        summaryTextFa
      };

      // Add to front of history
      targetPlayer.matchHistory = [matchRec, ...targetPlayer.matchHistory];
    }
  });

  if (modified) {
    saveClubPlayers(players);
  }
}

export function deleteClubPlayer(playerId: string): boolean {
  try {
    const players = getClubPlayers();
    const updated = players.filter(p => p.id !== playerId);
    saveClubPlayers(updated);
    return true;
  } catch (err) {
    console.error('Failed to delete club player', err);
    return false;
  }
}

export function adjustClubPlayerScore(playerId: string, deltaPoints: number, note?: string): boolean {
  try {
    const players = getClubPlayers();
    const target = players.find(p => p.id === playerId);
    if (!target) return false;

    target.totalScore += deltaPoints;
    if (note) {
      const adjustmentRecord: PlayerMatchRecord = {
        gameId: `adj_${Date.now()}`,
        dateFa: new Intl.DateTimeFormat('fa-IR-u-nu-latn').format(new Date()),
        timeFa: new Intl.DateTimeFormat('fa-IR-u-nu-latn', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        scenarioNameFa: 'تنظیم امتیاز توسط مدیر کل',
        roleKey: 'CITIZEN_SIMPLE',
        roleNameFa: 'مدیریت',
        side: 'CITIZEN',
        seatNumber: 0,
        pointsAwarded: deltaPoints,
        isBestPlayer: false,
        gameResult: 'DRAW',
        moderatorNameFa: 'مدیر کل (حسین شهبازی)',
        summaryTextFa: `${note}: ${deltaPoints > 0 ? `+${deltaPoints}` : deltaPoints} امتیاز`
      };
      target.matchHistory = [adjustmentRecord, ...target.matchHistory];
    }
    saveClubPlayers(players);
    return true;
  } catch (err) {
    console.error('Failed to adjust player score', err);
    return false;
  }
}
