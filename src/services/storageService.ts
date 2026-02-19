/**
 * storageService.ts
 *
 * Uses AsyncStorage (works with npx expo start / Expo Go).
 * MMKV was replaced because it requires a native build.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song.types';

const QUEUE_KEY = '@mume/player_queue';
const QUEUE_INDEX_KEY = '@mume/player_queue_index';
const DOWNLOADED_SONGS_KEY = '@mume/downloaded_songs';

// ─── Queue ────────────────────────────────────────────────────────────────────

export async function saveQueue(queue: Song[], currentIndex: number): Promise<void> {
  try {
    await AsyncStorage.multiSet([
      [QUEUE_KEY, JSON.stringify(queue)],
      [QUEUE_INDEX_KEY, String(currentIndex)],
    ]);
  } catch (e) {
    console.warn('[storageService] saveQueue failed:', e);
  }
}

export async function loadQueue(): Promise<{ queue: Song[]; currentIndex: number }> {
  try {
    const results = await AsyncStorage.multiGet([QUEUE_KEY, QUEUE_INDEX_KEY]);
    const raw = results[0][1];
    const indexRaw = results[1][1];
    const queue: Song[] = raw ? JSON.parse(raw) : [];
    const currentIndex = indexRaw ? parseInt(indexRaw, 10) : 0;
    return { queue, currentIndex };
  } catch {
    return { queue: [], currentIndex: 0 };
  }
}

// ─── Downloads (BONUS) ────────────────────────────────────────────────────────

export async function saveDownloadedSongs(songs: Song[]): Promise<void> {
  try {
    await AsyncStorage.setItem(DOWNLOADED_SONGS_KEY, JSON.stringify(songs));
  } catch (e) {
    console.warn('[storageService] saveDownloadedSongs failed:', e);
  }
}

export async function loadDownloadedSongs(): Promise<Song[]> {
  try {
    const raw = await AsyncStorage.getItem(DOWNLOADED_SONGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function isDownloaded(songId: string): Promise<boolean> {
  const songs = await loadDownloadedSongs();
  return songs.some((s) => s.id === songId);
}