import { useCallback, useEffect } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useQueueStore } from '../store/queueStore';
import { Song } from '../types/song.types';
import * as AudioService from '../services/audioService';
import { handlePlaybackStatus } from '../services/playbackService';

export function usePlayer() {
  const playerStore = usePlayerStore();
  const queueStore = useQueueStore();

  useEffect(() => {
    AudioService.setOnStatusUpdate(handlePlaybackStatus);
    AudioService.setOnTrackChange((index, song) => {
      queueStore.setCurrentIndex(index);
      playerStore.setCurrentSong(song);
    });

    AudioService.setOnTrackFinish(() => {
      const { queue, currentIndex, shuffleMode, shuffledIndices, repeatMode } = queueStore;

      if (repeatMode === 'one') {
        AudioService.seekTo(0);
        AudioService.play();
        return;
      }

      if (shuffleMode && shuffledIndices.length > 0) {
        const pos = shuffledIndices.indexOf(currentIndex);
        const nextPos = (pos + 1) % shuffledIndices.length;
        AudioService.skipToIndex(shuffledIndices[nextPos]);
      } else if (currentIndex < queue.length - 1) {
        AudioService.skipToNext();
      } else if (repeatMode === 'all') {
        AudioService.skipToIndex(0);
      }
    });
  }, []);

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

  const togglePlayPause = useCallback(async () => {
    if (playerStore.isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.play();
    }
  }, [playerStore.isPlaying]);

  const seekTo = useCallback(async (seconds: number) => {
    await AudioService.seekTo(seconds);
  }, []);

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

  const skipToPrevious = useCallback(async () => {
    const { shuffleMode, shuffledIndices, currentIndex } = queueStore;

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

  const addToQueue = useCallback(async (song: Song) => {
    queueStore.addToQueue(song);
    await AudioService.addToQueue(song);
  }, [queueStore]);

  const playNext = useCallback(async (song: Song) => {
    queueStore.playNext(song);
    await AudioService.playNext(song);
  }, [queueStore]);

  /**
   * Insert a song at an exact index in the queue.
   * Used by SongsTab to place "Add to Playing Queue" songs immediately
   * after the current song (and after any previously queued songs).
   */
  const insertIntoQueue = useCallback(async (song: Song, atIndex: number) => {
    queueStore.insertSongAtPosition(song, atIndex);
    await AudioService.insertSongAtIndex(song, atIndex);
  }, [queueStore]);

  const skipToIndex = useCallback(async (index: number) => {
    queueStore.setCurrentIndex(index);
    await AudioService.skipToIndex(index);
  }, [queueStore]);

  return {
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
    playSong,
    togglePlayPause,
    seekTo,
    skipToNext,
    skipToPrevious,
    addToQueue,
    playNext,
    insertIntoQueue,
    skipToIndex,
    setPlayerVisible: playerStore.setPlayerVisible,
    toggleShuffle: queueStore.toggleShuffle,
    cycleRepeatMode: queueStore.cycleRepeatMode,
    removeFromQueue: queueStore.removeFromQueue,
    reorderQueue: queueStore.reorderQueue,
  };
}