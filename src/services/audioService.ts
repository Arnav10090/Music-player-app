/**
 * audioService.ts
 *
 * Uses expo-av (Audio.Sound) — works with npx expo start / Expo Go.
 *
 * BACKGROUND PLAYBACK with expo-av:
 * - Call Audio.setAudioModeAsync with staysActiveInBackground: true
 * - iOS: UIBackgroundModes ["audio"] in app.json ensures the audio session
 *   is kept alive when the app is backgrounded
 * - Android: expo-av uses AudioFocus; music continues in background
 *   (no lock screen controls without RNTP, but playback continues)
 *
 * This service manages a single Sound instance. The currently loaded track
 * is stored in `currentSound`. On track switch we unload the old sound first.
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, getStreamUrl } from '../types/song.types';

let currentSound: Audio.Sound | null = null;
let queue: Song[] = [];
let currentIndex: number = 0;
let onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;
let onTrackChange: ((index: number, song: Song) => void) | null = null;

// ─── Setup ────────────────────────────────────────────────────────────────────

export async function setupPlayer(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,       // keeps playing when app is backgrounded
    playsInSilentModeIOS: true,          // plays even when iPhone silent switch is on
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

// ─── Event registration ───────────────────────────────────────────────────────

export function setOnStatusUpdate(cb: (status: AVPlaybackStatus) => void): void {
  onStatusUpdate = cb;
}

export function setOnTrackChange(cb: (index: number, song: Song) => void): void {
  onTrackChange = cb;
}

// ─── Internal load ────────────────────────────────────────────────────────────

async function loadSound(song: Song): Promise<void> {
  // Unload previous
  if (currentSound) {
    try { await currentSound.unloadAsync(); } catch {}
    currentSound = null;
  }

  const url = getStreamUrl(song.downloadUrl);
  if (!url) throw new Error('No stream URL for: ' + song.name);

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: true, progressUpdateIntervalMillis: 500 },
    (status) => {
      onStatusUpdate?.(status);

      // Auto-advance when track finishes
      if (status.isLoaded && status.didJustFinish) {
        const next = currentIndex + 1;
        if (next < queue.length) {
          skipToIndex(next);
        }
      }
    }
  );

  currentSound = sound;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function loadAndPlay(songs: Song[], startIndex: number = 0): Promise<void> {
  queue = songs;
  currentIndex = startIndex;
  await loadSound(songs[startIndex]);
  onTrackChange?.(startIndex, songs[startIndex]);
}

export async function play(): Promise<void> {
  await currentSound?.playAsync();
}

export async function pause(): Promise<void> {
  await currentSound?.pauseAsync();
}

export async function seekTo(seconds: number): Promise<void> {
  await currentSound?.setPositionAsync(seconds * 1000);
}

export async function skipToNext(): Promise<void> {
  const next = currentIndex + 1;
  if (next < queue.length) await skipToIndex(next);
}

export async function skipToPrevious(): Promise<void> {
  const prev = currentIndex - 1;
  if (prev >= 0) await skipToIndex(prev);
  else await seekTo(0);
}

export async function skipToIndex(index: number): Promise<void> {
  if (index < 0 || index >= queue.length) return;
  currentIndex = index;
  const song = queue[index];
  await loadSound(song);
  onTrackChange?.(index, song);
}

export async function addToQueue(song: Song): Promise<void> {
  queue = [...queue, song];
}

export async function removeFromQueueAtIndex(index: number): Promise<void> {
  queue = queue.filter((_, i) => i !== index);
  if (index < currentIndex) currentIndex -= 1;
}

export function getCurrentIndex(): number {
  return currentIndex;
}

export function getQueue(): Song[] {
  return queue;
}

export async function stop(): Promise<void> {
  await currentSound?.stopAsync();
}