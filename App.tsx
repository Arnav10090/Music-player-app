import React, { useEffect, useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNavigationContainerRef } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MiniPlayer } from './src/components/MiniPlayer';
import { setupPlayer } from './src/services/audioService';
import { useQueueStore } from './src/store/queueStore';
import { usePlayerStore } from './src/store/playerStore';
import { useFavoritesStore } from './src/store/favoritesStore';

export default function App() {
  const navRef = useNavigationContainerRef();
  const loadPersistedQueue = useQueueStore((s) => s.loadPersistedQueue);
  const loadFavorites = useFavoritesStore((s) => s.loadFavorites);
  const currentSong = usePlayerStore((s) => s.currentSong);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  useEffect(() => {
    setupPlayer().catch(console.error);
    loadPersistedQueue().catch(console.error);
    loadFavorites().catch(console.error);
  }, []);

  const handleMiniPlayerPress = useCallback(() => {
    navRef.current?.navigate('Player' as never);
  }, [navRef]);

  const showMiniPlayer = currentSong && currentRoute !== 'Player';

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <RootNavigator
          onRouteChange={(routeName: string) => setCurrentRoute(routeName)}
        />
        {showMiniPlayer && (
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
  miniPlayerWrapper: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
  },
});