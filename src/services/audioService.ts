import { Audio, AVPlaybackStatus } from 'expo-av';
import { Song, getStreamUrl } from '../types/song.types';

let currentSound: Audio.Sound | null = null;
let queue: Song[] = [];
let currentIndex: number = 0;
let onStatusUpdate: ((status: AVPlaybackStatus) => void) | null = null;
let onTrackChange: ((index: number, song: Song) => void) | null = null;
let onTrackFinish: (() => void) | null = null;

export async function setupPlayer(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

export function setOnStatusUpdate(cb: (status: AVPlaybackStatus) => void): void {
  onStatusUpdate = cb;
}

export function setOnTrackChange(cb: (index: number, song: Song) => void): void {
  onTrackChange = cb;
}

export function setOnTrackFinish(cb: () => void): void {
  onTrackFinish = cb;
}

async function loadSound(song: Song): Promise<void> {
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
      if (status.isLoaded && status.didJustFinish) {
        onTrackFinish?.();
      }
    }
  );

  currentSound = sound;
}

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

/**
 * Insert a song at a specific position in the queue.
 * Songs after the insert point are shifted right.
 * If insertIndex <= currentIndex, currentIndex is adjusted.
 */
export async function insertSongAtIndex(song: Song, insertIndex: number): Promise<void> {
  const safeIndex = Math.max(0, Math.min(insertIndex, queue.length));
  queue = [...queue.slice(0, safeIndex), song, ...queue.slice(safeIndex)];
  if (safeIndex <= currentIndex) {
    currentIndex += 1;
  }
}

export async function playNext(song: Song): Promise<void> {
  const insertIndex = currentIndex + 1;
  queue = [...queue.slice(0, insertIndex), song, ...queue.slice(insertIndex)];
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