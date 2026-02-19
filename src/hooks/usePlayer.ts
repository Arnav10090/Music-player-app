import { useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Song } from '../types/song.types';
import * as AudioService from '../services/audioService';
import { handlePlaybackStatus } from '../services/playbackService';

/**
 * usePlayer — master hook for all playback interactions.
 *
 * HOW SYNC WORKS:
 * 1. audioService.setOnStatusUpdate() registers handlePlaybackStatus as a callback.
 *    expo-av calls it every 500ms with position, isPlaying, isBuffering, duration.
 * 2. handlePlaybackStatus writes to playerStore (Zustand).
 * 3. Both MiniPlayer and PlayerScreen call usePlayer() → both subscribe to the
 *    same playerStore → always perfectly in sync.
 *
 * The callback is registered once on app mount (in App.tsx via setupPlayer).
 * Individual screen instances of usePlayer just read the store.
 */
export function usePlayer() {
  const playerStore = usePlayerStore();
  const queueStore = useQueueStore();

  // Register callbacks once — subsequent calls are no-ops since
  // audioService stores only one callback reference
  useEffect(() => {
    AudioService.setOnStatusUpdate(handlePlaybackStatus);
    AudioService.setOnTrackChange((index, song) => {
      queueStore.setCurrentIndex(index);
      playerStore.setCurrentSong(song);
    });
  }, []);

  // ─── Play a list of songs ──────────────────────────────────────────────────
  const playSong = useCallback(
    async (songs: Song[], startIndex: number = 0) => {
      try {
        playerStore.setIsLoading(true);
        playerStore.setError(null);
        queueStore.setQueue(songs, startIndex);
        playerStore.setCurrentSong(songs[startIndex]);
        await AudioService.loadAndPlay(songs, startIndex);
      } catch (e: any) {
        playerStore.setError(e.message);
        playerStore.setIsLoading(false);
      }
    },
    []
  );

  // ─── Toggle play / pause ───────────────────────────────────────────────────
  const togglePlayPause = useCallback(async () => {
    if (playerStore.isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.play();
    }
  }, [playerStore.isPlaying]);

  // ─── Seek ──────────────────────────────────────────────────────────────────
  const seekTo = useCallback(async (seconds: number) => {
    await AudioService.seekTo(seconds);
  }, []);

  // ─── Skip next (respects shuffle + repeat) ────────────────────────────────
  const skipToNext = useCallback(async () => {
    const { queue, currentIndex, shuffleMode, shuffledIndices, repeatMode } = queueStore;

    if (repeatMode === 'one') {
      await AudioService.seekTo(0);
      await AudioService.play();
      return;
    }

    if (shuffleMode && shuffledIndices.length > 0) {
      const pos = shuffledIndices.indexOf(currentIndex);
      const nextPos = (pos + 1) % shuffledIndices.length;
      await AudioService.skipToIndex(shuffledIndices[nextPos]);
    } else if (currentIndex < queue.length - 1) {
      await AudioService.skipToNext();
    } else if (repeatMode === 'all') {
      await AudioService.skipToIndex(0);
    }
  }, [queueStore]);

  // ─── Skip previous ────────────────────────────────────────────────────────
  const skipToPrevious = useCallback(async () => {
    const { shuffleMode, shuffledIndices, currentIndex } = queueStore;

    // If more than 3 seconds in → restart current track
    if (playerStore.position > 3) {
      await AudioService.seekTo(0);
      return;
    }

    if (shuffleMode && shuffledIndices.length > 0) {
      const pos = shuffledIndices.indexOf(currentIndex);
      const prevPos = (pos - 1 + shuffledIndices.length) % shuffledIndices.length;
      await AudioService.skipToIndex(shuffledIndices[prevPos]);
    } else {
      await AudioService.skipToPrevious();
    }
  }, [queueStore, playerStore.position]);

  // ─── Add to queue ─────────────────────────────────────────────────────────
  const addToQueue = useCallback(async (song: Song) => {
    queueStore.addToQueue(song);
    await AudioService.addToQueue(song);
  }, [queueStore]);

  // ─── Jump to specific queue index ─────────────────────────────────────────
  const skipToIndex = useCallback(async (index: number) => {
    queueStore.setCurrentIndex(index);
    await AudioService.skipToIndex(index);
  }, [queueStore]);

  return {
    // ── state ──
    currentSong: playerStore.currentSong,
    isPlaying: playerStore.isPlaying,
    isLoading: playerStore.isLoading,
    position: playerStore.position,
    duration: playerStore.duration,
    error: playerStore.error,
    isPlayerVisible: playerStore.isPlayerVisible,
    queue: queueStore.queue,
    currentIndex: queueStore.currentIndex,
    shuffleMode: queueStore.shuffleMode,
    repeatMode: queueStore.repeatMode,
    // ── actions ──
    playSong,
    togglePlayPause,
    seekTo,
    skipToNext,
    skipToPrevious,
    addToQueue,
    skipToIndex,
    setPlayerVisible: playerStore.setPlayerVisible,
    toggleShuffle: queueStore.toggleShuffle,
    cycleRepeatMode: queueStore.cycleRepeatMode,
    removeFromQueue: queueStore.removeFromQueue,
    reorderQueue: queueStore.reorderQueue,
  };
}