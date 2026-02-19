import { create } from 'zustand';
import { Song } from '../types/song.types';

/**
 * playerStore — single source of truth for playback state.
 *
 * Both MiniPlayer and PlayerScreen READ from this store.
 * AudioService events WRITE to this store.
 * This guarantees perfect sync: both components always see identical state.
 *
 * The store itself does NOT call AudioService directly —
 * that is done by usePlayer hook to avoid circular dependencies.
 */

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;    // seconds elapsed
  duration: number;    // total duration in seconds
  isLoading: boolean;
  error: string | null;
  isPlayerVisible: boolean; // full player modal open
}

interface PlayerActions {
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setPosition: (pos: number) => void;
  setDuration: (dur: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  setPlayerVisible: (visible: boolean) => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set) => ({
  // initial state
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  isLoading: false,
  error: null,
  isPlayerVisible: false,

  // actions
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPosition: (pos) => set({ position: pos }),
  setDuration: (dur) => set({ duration: dur }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  setPlayerVisible: (visible) => set({ isPlayerVisible: visible }),
}));