/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Firestore Synchronization Service for FEKRI NO Mafia App
 * Handles two-way sync between cloud Firestore and local client state.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { ClubPlayer, SavedGameRecord } from '../types/mafia';
import { 
  getClubPlayers, 
  saveClubPlayers, 
  INITIAL_CLUB_PLAYERS 
} from '../data/clubPlayers';
import { 
  getSavedGames, 
  saveGameRecord 
} from '../data/moderators';

const PLAYERS_COLLECTION = 'players';
const MATCHES_COLLECTION = 'matches';

/**
 * Fetch all players from Firestore.
 * If Firestore is empty on first launch, seed with INITIAL_CLUB_PLAYERS.
 */
export async function syncPlayersFromCloud(): Promise<ClubPlayer[]> {
  try {
    const colRef = collection(db, PLAYERS_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      console.log('Firestore players empty. Seeding initial club players to Cloud...');
      const localPlayers = getClubPlayers();
      const playersToSeed = localPlayers.length > 0 ? localPlayers : INITIAL_CLUB_PLAYERS;
      
      for (const p of playersToSeed) {
        await savePlayerToCloud(p);
      }
      return playersToSeed;
    }

    const cloudPlayers: ClubPlayer[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ClubPlayer;
      cloudPlayers.push(data);
    });

    // Update local cache for instant offline responsiveness
    saveClubPlayers(cloudPlayers);
    return cloudPlayers;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, PLAYERS_COLLECTION);
    // Fallback to local storage if offline
    return getClubPlayers();
  }
}

/**
 * Save or update an individual player in Firestore
 */
export async function savePlayerToCloud(player: ClubPlayer): Promise<void> {
  const docPath = `${PLAYERS_COLLECTION}/${player.id}`;
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, player.id);
    await setDoc(docRef, {
      ...player,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a player from Firestore
 */
export async function deletePlayerFromCloud(playerId: string): Promise<void> {
  const docPath = `${PLAYERS_COLLECTION}/${playerId}`;
  try {
    const docRef = doc(db, PLAYERS_COLLECTION, playerId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

/**
 * Fetch all archived matches from Firestore
 */
export async function syncMatchesFromCloud(): Promise<SavedGameRecord[]> {
  try {
    const colRef = collection(db, MATCHES_COLLECTION);
    const snapshot = await getDocs(colRef);

    if (snapshot.empty) {
      const localGames = getSavedGames();
      if (localGames.length > 0) {
        for (const g of localGames) {
          await saveMatchToCloud(g);
        }
      }
      return localGames;
    }

    const cloudMatches: SavedGameRecord[] = [];
    snapshot.forEach((docSnap) => {
      cloudMatches.push(docSnap.data() as SavedGameRecord);
    });

    // Sort newest first
    cloudMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return cloudMatches;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, MATCHES_COLLECTION);
    return getSavedGames();
  }
}

/**
 * Save an official game match to Firestore and update player scores
 */
export async function saveMatchToCloud(match: SavedGameRecord): Promise<void> {
  const docPath = `${MATCHES_COLLECTION}/${match.id}`;
  try {
    const docRef = doc(db, MATCHES_COLLECTION, match.id);
    await setDoc(docRef, match);
    // Also save in local cache
    saveGameRecord(match);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, docPath);
  }
}

/**
 * Subscribe to real-time player updates across all devices
 */
export function subscribeToPlayers(onUpdate: (players: ClubPlayer[]) => void): () => void {
  const colRef = collection(db, PLAYERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const players: ClubPlayer[] = [];
      snapshot.forEach((docSnap) => {
        players.push(docSnap.data() as ClubPlayer);
      });
      if (players.length > 0) {
        saveClubPlayers(players);
        onUpdate(players);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, PLAYERS_COLLECTION);
    }
  );
}

/**
 * Subscribe to real-time matches archive across all devices
 */
export function subscribeToMatches(onUpdate: (matches: SavedGameRecord[]) => void): () => void {
  const colRef = collection(db, MATCHES_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const matches: SavedGameRecord[] = [];
      snapshot.forEach((docSnap) => {
        matches.push(docSnap.data() as SavedGameRecord);
      });
      matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onUpdate(matches);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, MATCHES_COLLECTION);
    }
  );
}
