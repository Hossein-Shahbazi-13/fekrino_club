/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ScenarioType, 
  ModeratorAccount, 
  RegisteredPlayer,
  ClubPlayer
} from './types/mafia';
import { 
  getStoredModerator, 
  setStoredModerator, 
  clearStoredModerator 
} from './data/moderators';
import { 
  getStoredPlayerSession, 
  setStoredPlayerSession, 
  clearStoredPlayerSession 
} from './data/clubPlayers';
import { 
  generateCryptographicDistribution, 
  AssignedSeatPair 
} from './utils/cryptoShuffle';
import { 
  loadLiveGameState, 
  saveLiveGameState, 
  clearLiveGameState 
} from './utils/gameStateStorage';
import { ModeratorLoginScreen } from './components/ModeratorLoginScreen';
import { PlayerRegistrationScreen } from './components/PlayerRegistrationScreen';
import { FekriNoDistributionScreen } from './components/FekriNoDistributionScreen';
import { GodScoringScreen } from './components/GodScoringScreen';
import { ScenarioGuideModal } from './components/ScenarioGuideModal';
import { SavedGamesHistoryModal } from './components/SavedGamesHistoryModal';
import { ClubPlayersModal } from './components/ClubPlayersModal';
import { AdminDashboardScreen } from './components/AdminDashboardScreen';
import { PlayerHallScreen } from './components/PlayerHallScreen';
import { 
  syncPlayersFromCloud, 
  syncMatchesFromCloud, 
  subscribeToPlayers, 
  subscribeToMatches 
} from './services/firestoreSync';

type AppScreen = 'LOGIN' | 'REGISTRATION' | 'DISTRIBUTION' | 'SCORING' | 'ADMIN' | 'PLAYER_HALL';

export default function App() {
  const [activeModerator, setActiveModerator] = useState<ModeratorAccount | null>(() => getStoredModerator());
  const [activePlayer, setActivePlayer] = useState<ClubPlayer | null>(() => getStoredPlayerSession());
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const mod = getStoredModerator();
    if (mod) {
      if (mod.isAdmin) return 'ADMIN';
      const saved = loadLiveGameState();
      if (saved?.currentScreen && ['REGISTRATION', 'DISTRIBUTION', 'SCORING'].includes(saved.currentScreen)) {
        return saved.currentScreen as AppScreen;
      }
      return 'REGISTRATION';
    }
    const player = getStoredPlayerSession();
    if (player) {
      return 'PLAYER_HALL';
    }
    return 'LOGIN';
  });

  const [scenarioType, setScenarioType] = useState<ScenarioType>(() => {
    const saved = loadLiveGameState();
    return saved?.scenarioType || 'BAZPORS';
  });
  const [playerCount, setPlayerCount] = useState<number>(() => {
    const saved = loadLiveGameState();
    return saved?.playerCount || 10;
  });
  const [registeredPlayers, setRegisteredPlayers] = useState<RegisteredPlayer[]>(() => {
    const saved = loadLiveGameState();
    return saved?.registeredPlayers || [];
  });
  const [assignedSeats, setAssignedSeats] = useState<AssignedSeatPair[]>(() => {
    const saved = loadLiveGameState();
    return saved?.assignedSeats || [];
  });

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isClubPlayersOpen, setIsClubPlayersOpen] = useState<boolean>(false);

  // Cloud Firestore Synchronization & Real-time Subscriptions
  useEffect(() => {
    syncPlayersFromCloud().catch((e) => console.warn('Cloud players sync offline fallback:', e));
    syncMatchesFromCloud().catch((e) => console.warn('Cloud matches sync offline fallback:', e));

    const unsubPlayers = subscribeToPlayers((players) => {
      // If current logged-in player was updated in cloud, refresh active session
      if (activePlayer) {
        const fresh = players.find((p) => p.id === activePlayer.id);
        if (fresh) {
          setActivePlayer(fresh);
        }
      }
    });

    const unsubMatches = subscribeToMatches(() => {});

    return () => {
      unsubPlayers();
      unsubMatches();
    };
  }, [activePlayer?.id]);

  // Sync session if both moderator and player are logged out
  useEffect(() => {
    if (!activeModerator && !activePlayer && currentScreen !== 'LOGIN') {
      setCurrentScreen('LOGIN');
    }
  }, [activeModerator, activePlayer, currentScreen]);

  const handleLoginSuccess = (account: ModeratorAccount) => {
    setStoredModerator(account);
    setActiveModerator(account);
    if (account.isAdmin) {
      setCurrentScreen('ADMIN');
    } else {
      const saved = loadLiveGameState();
      if (saved?.currentScreen && ['REGISTRATION', 'DISTRIBUTION', 'SCORING'].includes(saved.currentScreen)) {
        setCurrentScreen(saved.currentScreen as AppScreen);
      } else {
        setCurrentScreen('REGISTRATION');
      }
    }
  };

  const handlePlayerLoginSuccess = (player: ClubPlayer) => {
    setStoredPlayerSession(player);
    setActivePlayer(player);
    setCurrentScreen('PLAYER_HALL');
  };

  const handlePlayerLogout = () => {
    clearStoredPlayerSession();
    setActivePlayer(null);
    setCurrentScreen('LOGIN');
  };

  const handleLogout = () => {
    clearStoredModerator();
    clearLiveGameState();
    setActiveModerator(null);
    setCurrentScreen('LOGIN');
  };

  const handleStartDistribution = (
    scenario: ScenarioType, 
    count: number, 
    players: RegisteredPlayer[]
  ) => {
    setScenarioType(scenario);
    setPlayerCount(count);
    setRegisteredPlayers(players);

    // Cryptographically generate initial distribution
    const pairings = generateCryptographicDistribution(scenario, count, 'SEQUENTIAL_SEATS');
    setAssignedSeats(pairings);

    saveLiveGameState({
      currentScreen: 'DISTRIBUTION',
      scenarioType: scenario,
      playerCount: count,
      registeredPlayers: players,
      assignedSeats: pairings
    });

    setCurrentScreen('DISTRIBUTION');
  };

  const handleStartNewGame = () => {
    clearLiveGameState();
    const newPairings = generateCryptographicDistribution(scenarioType, playerCount, 'SEQUENTIAL_SEATS');
    setAssignedSeats(newPairings);
    setRegisteredPlayers([]);
    setCurrentScreen('REGISTRATION');
  };

  return (
    <div className="min-h-screen bg-[#0d0705] text-[#faf6f0] font-['Vazirmatn',sans-serif] selection:bg-amber-500 selection:text-black">
      {/* 1. LOGIN SCREEN (MODERATOR OR PLAYER) */}
      {currentScreen === 'LOGIN' && (
        <ModeratorLoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onPlayerLoginSuccess={handlePlayerLoginSuccess}
        />
      )}

      {/* 2. PLAYER HALL OF GAMES SCREEN (Authenticated Player Portal) */}
      {currentScreen === 'PLAYER_HALL' && activePlayer && (
        <PlayerHallScreen
          player={activePlayer}
          onLogout={handlePlayerLogout}
        />
      )}

      {/* 3. PLAYER REGISTRATION SCREEN (Map Seat Numbers to Player Names) */}
      {activeModerator && currentScreen === 'REGISTRATION' && (
        <PlayerRegistrationScreen
          moderator={activeModerator}
          initialScenario={scenarioType}
          initialPlayerCount={playerCount}
          onStartDistribution={handleStartDistribution}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onLogout={handleLogout}
          onOpenClubPlayers={() => setIsClubPlayersOpen(true)}
          onOpenAdmin={() => setCurrentScreen('ADMIN')}
        />
      )}

      {/* 3. SITE ADMIN DASHBOARD SCREEN (Full Oversight: Approvals, Gods, Players, Records) */}
      {activeModerator && currentScreen === 'ADMIN' && (
        <AdminDashboardScreen
          adminAccount={activeModerator}
          onEnterGame={() => setCurrentScreen('REGISTRATION')}
          onLogout={handleLogout}
        />
      )}

      {/* 4. FEKRI NO ROLE DISTRIBUTION SCREEN (Secret & Anonymous, Only Seat Numbers) */}
      {activeModerator && currentScreen === 'DISTRIBUTION' && (
        <FekriNoDistributionScreen
          scenarioType={scenarioType}
          playerCount={playerCount}
          assignedSeats={assignedSeats}
          onUpdateAssignedSeats={setAssignedSeats}
          moderatorName={activeModerator.nameFa || activeModerator.username}
          onSelectScenario={(st) => setScenarioType(st)}
          onSelectPlayerCount={(count) => setPlayerCount(count)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenScoring={() => setCurrentScreen('SCORING')}
          onBackToRegistration={() => setCurrentScreen('REGISTRATION')}
        />
      )}

      {/* 5. GOD SCORING & BEST PLAYER SCREEN (Moderator Only, Post-Game / In-Game Scoring) */}
      {activeModerator && currentScreen === 'SCORING' && (
        <GodScoringScreen
          moderator={activeModerator}
          scenarioType={scenarioType}
          playerCount={playerCount}
          assignedSeats={assignedSeats}
          registeredPlayers={registeredPlayers}
          onBackToDistribution={() => setCurrentScreen('DISTRIBUTION')}
          onStartNewGame={handleStartNewGame}
          onOpenHistory={() => setIsHistoryOpen(true)}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenClubPlayers={() => setIsClubPlayersOpen(true)}
        />
      )}

      {/* Scenario & Roles Guide Modal */}
      <ScenarioGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Saved Games History Modal */}
      <SavedGamesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Club Players & Report Card Modal */}
      <ClubPlayersModal
        isOpen={isClubPlayersOpen}
        onClose={() => setIsClubPlayersOpen(false)}
      />
    </div>
  );
}
