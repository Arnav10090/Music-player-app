import { create } from 'zustand';
import { Song } from '../types/song.types';
import { saveQueue, loadQueue } from '../services/storageService';

type RepeatModeType = 'none' | 'one' | 'all';

interface QueueState {
  queue: Song[];
  currentIndex: number;
  shuffleMode: boolean;
  repeatMode: RepeatModeType;
  shuffledIndices: number[];
}

interface QueueActions {
  setQueue: (songs: Song[], startIndex: number) => void;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  setCurrentIndex: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  loadPersistedQueue: () => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
}

type QueueStore = QueueState & QueueActions;

function buildShuffledIndices(length: number, currentIndex: number): number[] {
  if (length === 0) return [];
  const indices = Array.from({ length }, (_, i) => i).filter((i) => i !== currentIndex);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return [currentIndex, ...indices];
}

export const useQueueStore = create<QueueStore>((set, get) => ({
  queue: [],
  currentIndex: 0,
  shuffleMode: false,
  repeatMode: 'none',
  shuffledIndices: [],

  setQueue: (songs, startIndex) => {
    const shuffledIndices = buildShuffledIndices(songs.length, startIndex);
    set({ queue: songs, currentIndex: startIndex, shuffledIndices });
    saveQueue(songs, startIndex); // fire-and-forget async
  },

  addToQueue: (song) => {
    const { queue, currentIndex } = get();
    const updated = [...queue, song];
    const shuffledIndices = buildShuffledIndices(updated.length, currentIndex);
    set({ queue: updated, shuffledIndices });
    saveQueue(updated, currentIndex);
  },

  playNext: (song) => {
    const { queue, currentIndex } = get();
    // Insert after current song
    const insertIndex = currentIndex + 1;
    const updated = [...queue.slice(0, insertIndex), song, ...queue.slice(insertIndex)];
    const shuffledIndices = buildShuffledIndices(updated.length, currentIndex);
    set({ queue: updated, shuffledIndices });
    saveQueue(updated, currentIndex);
  },

  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    const updated = queue.filter((_, i) => i !== index);
    const newIndex = index < currentIndex ? currentIndex - 1 : currentIndex;
    const safeIndex = Math.max(0, Math.min(newIndex, updated.length - 1));
    const shuffledIndices = buildShuffledIndices(updated.length, safeIndex);
    set({ queue: updated, currentIndex: safeIndex, shuffledIndices });
    saveQueue(updated, safeIndex);
  },

  setCurrentIndex: (index) => {
    const { queue } = get();
    set({ currentIndex: index });
    saveQueue(queue, index);
  },

  reorderQueue: (from, to) => {
    const { queue, currentIndex } = get();
    const updated = [...queue];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    let newCurrentIndex = currentIndex;
    if (currentIndex === from) newCurrentIndex = to;
    else if (from < currentIndex && to >= currentIndex) newCurrentIndex -= 1;
    else if (from > currentIndex && to <= currentIndex) newCurrentIndex += 1;
    const shuffledIndices = buildShuffledIndices(updated.length, newCurrentIndex);
    set({ queue: updated, currentIndex: newCurrentIndex, shuffledIndices });
    saveQueue(updated, newCurrentIndex);
  },

  loadPersistedQueue: async () => {
    const { queue, currentIndex } = await loadQueue();
    const shuffledIndices = buildShuffledIndices(queue.length, currentIndex);
    set({ queue, currentIndex, shuffledIndices });
  },

  toggleShuffle: () => {
    const { shuffleMode, queue, currentIndex } = get();
    const newMode = !shuffleMode;
    const shuffledIndices = newMode
      ? buildShuffledIndices(queue.length, currentIndex)
      : Array.from({ length: queue.length }, (_, i) => i);
    set({ shuffleMode: newMode, shuffledIndices });
  },

  cycleRepeatMode: () => {
    const { repeatMode } = get();
    const next: RepeatModeType =
      repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
    set({ repeatMode: next });
  },
}));