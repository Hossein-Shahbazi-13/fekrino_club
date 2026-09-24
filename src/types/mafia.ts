export type TeamSide = 'CITIZEN' | 'MAFIA' | 'INDEPENDENT';

export type ScenarioType = 'BAZPORS' | 'TAKAVER' | 'NAMAYANDEH';

export type RoleKey = 
  // Shared / Bazpors
  | 'BAZPORS'        // بازپرس (Investigator)
  | 'MOHAQEQ'        // محقق (Researcher / Hunter)
  | 'DETECTIVE'      // کارآگاه (Detective)
  | 'DOCTOR'         // پزشک / دکتر (Doctor)
  | 'SNIPER'         // تک‌تیرانداز (Sniper)
  | 'GUNSMITH'       // تفنگ‌دار (Gunsmith)
  | 'CITIZEN_SIMPLE' // شهروند ساده (Simple Citizen)
  | 'MAFIA_BOSS'     // رئیس مافیا / پدرخوانده (Mafia Boss)
  | 'SHEYAD'         // شیاد (Trickster)
  | 'NATO'           // ناتو (Nato)
  | 'MAFIA_SIMPLE'   // مافیای ساده (Simple Mafia)
  
  // Takaver Scenario Additions
  | 'TAKAVER'        // تکاور (Commando / Ranger)
  | 'NEGAHBAN'       // نگهبان (Guardian / Sentry)
  | 'ZEREHPOOSH'     // زره‌پوش / روئین‌تن (Bulletproof / Armored)
  | 'GROGANGIR'      // گروگان‌گیر / ماتادور (Kidnapper / Hostage Taker)

  // Namayandeh Scenario Additions
  | 'NAMAYANDEH'     // نماینده (Status / Historic)
  | 'RAHNAMA'        // راهنما (Guide)
  | 'MINGOZAR'       // مین‌گذار (Minelayer)
  | 'VAKIL'          // وکیل (Lawyer)
  | 'MOHAFIZ'        // محافظ (Protector)
  | 'SARBAZ'         // سرباز / شهروند سرباز (Soldier)
  | 'DON_MAFIA'      // دن مافیا (Don - Treason Vote)
  | 'YAGHI'          // یاغی / ترور (Rebel / Terror)
  | 'HACKER';        // هکر (Hacker)

export interface RoleDefinition {
  key: RoleKey;
  nameFa: string;
  nameEn: string;
  side: TeamSide;
  color: string;
  shortDesc: string;
  fullDesc: string;
  nightActionDesc?: string;
  dayActionDesc?: string;
  strategyTips: string[];
}

export interface ScenarioInfo {
  type: ScenarioType;
  nameFa: string;
  nameEn: string;
  description: string;
  availablePlayerCounts: number[];
  presets: Record<number, Partial<Record<RoleKey, number>>>;
}

export type ModeratorUsername = string;

export interface ModeratorAccount {
  username: string;
  nameFa: string;
  pass: string;
  avatarColor: string;
  titleFa?: string;
  rank?: 'DON' | 'CONSIGLIERE' | 'CAPO';
  joinedAt?: string;
  phone?: string;
  bio?: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  isAdmin?: boolean;
  requestedAt?: string;
  approvedAt?: string;
}

export interface RegisteredPlayer {
  seatNumber: number;
  name: string;
  playerId?: string;
}

export interface PlayerScoreEntry {
  seatNumber: number;
  playerName: string;
  roleKey: RoleKey;
  score: number;
  isBestPlayer: boolean;
  notes?: string;
  playerId?: string;
}

export interface PlayerMatchRecord {
  gameId: string;
  dateFa: string;
  timeFa?: string;
  scenarioNameFa: string;
  roleKey: RoleKey;
  roleNameFa: string;
  side: TeamSide;
  seatNumber: number;
  pointsAwarded: number;
  isBestPlayer: boolean;
  gameResult: GameOutcome;
  moderatorNameFa: string;
  summaryTextFa: string;
}

export interface ClubPlayer {
  id: string; // e.g. "PL-101"
  name: string;
  phone?: string;
  password?: string;
  avatarColor?: string;
  totalScore: number;
  totalGames: number;
  bestPlayerCount: number;
  registeredAt: string;
  matchHistory: PlayerMatchRecord[];
}

export type GameOutcome = 'CITIZEN_WIN' | 'MAFIA_WIN' | 'DRAW' | 'IN_PROGRESS';

export interface SavedGameRecord {
  id: string;
  createdAt: string; // ISO date
  dateFa: string;
  timeFa: string;
  moderatorUsername: ModeratorUsername;
  moderatorNameFa: string;
  scenarioType: ScenarioType;
  playerCount: number;
  outcome: GameOutcome;
  bestPlayerName: string;
  bestPlayerRole: RoleKey;
  bestPlayerSeat: number;
  playerScores: PlayerScoreEntry[];
  generalNotes?: string;
}
