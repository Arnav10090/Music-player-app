import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigationContainerRef } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MiniPlayer } from './src/components/MiniPlayer';
import { setupPlayer } from './src/services/audioService';
import { useQueueStore } from './src/store/queueStore';
import { usePlayerStore } from './src/store/playerStore';

/**
 * App root
 *
 * BACKGROUND PLAYBACK (expo-av):
 * - setupPlayer() calls Audio.setAudioModeAsync({ staysActiveInBackground: true })
 * - iOS: UIBackgroundModes: ["audio"] in app.json keeps the audio session alive
 * - Android: expo-av retains AudioFocus in background
 *
 * MINI PLAYER:
 * - Rendered OUTSIDE the navigator — persists across all screens
 * - Tapping navigates to PlayerScreen modal
 *
 * QUEUE PERSISTENCE:
 * - loadPersistedQueue() reads from AsyncStorage on startup
 */

export default function App() {
  const navRef = useNavigationContainerRef();
  const loadPersistedQueue = useQueueStore((s) => s.loadPersistedQueue);
  const currentSong = usePlayerStore((s) => s.currentSong);

  useEffect(() => {
    setupPlayer().catch(console.error);
    loadPersistedQueue().catch(console.error);
  }, []);

  const handleMiniPlayerPress = useCallback(() => {
    navRef.current?.navigate('Player' as never);
  }, [navRef]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.navigatorContainer}>
          <RootNavigator />
        </View>

        {currentSong && (
          <View style={styles.miniPlayerWrapper}>
            <MiniPlayer onPress={handleMiniPlayerPress} />
          </View>
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  navigatorContainer: { flex: 1 },
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});