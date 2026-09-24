import { 
  ScenarioType, 
  RegisteredPlayer, 
  PlayerScoreEntry, 
  GameOutcome 
} from '../types/mafia';
import { AssignedSeatPair } from './cryptoShuffle';

export interface ActiveGameState {
  currentScreen: 'REGISTRATION' | 'DISTRIBUTION' | 'SCORING';
  scenarioType: ScenarioType;
  playerCount: number;
  registeredPlayers: RegisteredPlayer[];
  assignedSeats: AssignedSeatPair[];
  distributionState?: {
    currentStep: 'WELCOME' | 'CARD_DISTRIBUTION' | 'COMPLETE';
    currentSeatIndex: number;
    isCardRevealed: boolean;
    seenSeats: number[];
  };
  scoringState?: {
    playerScores: PlayerScoreEntry[];
    outcome: GameOutcome;
    generalNotes: string;
    aliveSeats?: number[];
  };
  lastSavedAt: number;
}

const STORAGE_KEY = 'FEKRI_NO_LIVE_GAME_STATE';

export function saveLiveGameState(state: Partial<ActiveGameState>): void {
  try {
    const existing: Partial<ActiveGameState> = loadLiveGameState() || {};
    const updated: ActiveGameState = {
      currentScreen: state.currentScreen || existing.currentScreen || 'REGISTRATION',
      scenarioType: state.scenarioType || existing.scenarioType || 'BAZPORS',
      playerCount: state.playerCount || existing.playerCount || 10,
      registeredPlayers: state.registeredPlayers || existing.registeredPlayers || [],
      assignedSeats: state.assignedSeats || existing.assignedSeats || [],
      distributionState: state.distributionState || existing.distributionState,
      scoringState: state.scoringState || existing.scoringState,
      lastSavedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to auto-save game state to localStorage:', e);
  }
}

export function loadLiveGameState(): ActiveGameState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveGameState;
    // Discard if older than 24 hours
    if (parsed.lastSavedAt && Date.now() - parsed.lastSavedAt > 24 * 60 * 60 * 1000) {
      clearLiveGameState();
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load game state from localStorage:', e);
    return null;
  }
}

export function clearLiveGameState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear live game state:', e);
  }
}
