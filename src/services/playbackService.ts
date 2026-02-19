/**
 * playbackService.ts
 *
 * With expo-av there is no separate background service registration needed.
 * This file now exports a helper that bridges expo-av AVPlaybackStatus
 * into our Zustand playerStore — called from usePlayer on mount.
 */

import { AVPlaybackStatus } from 'expo-av';
import { usePlayerStore } from '../store/playerStore';

export function handlePlaybackStatus(status: AVPlaybackStatus): void {
  const store = usePlayerStore.getState();

  if (!status.isLoaded) {
    if (status.error) {
      store.setError(`Playback error: ${status.error}`);
    }
    store.setIsLoading(true);
    return;
  }

  store.setIsLoading(status.isBuffering);
  store.setIsPlaying(status.isPlaying);
  store.setPosition(status.positionMillis / 1000);

  if (status.durationMillis) {
    store.setDuration(status.durationMillis / 1000);
  }

  store.setError(null);
}