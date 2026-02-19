import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { ArtworkImage } from '../components/ArtworkImage';
import { SeekBar } from '../components/SeekBar';
import { PlayerControls } from '../components/PlayerControls';
import { getBestImageUrl } from '../types/song.types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface Props {
  navigation: any;
}

/**
 * PlayerScreen — full-screen player.
 *
 * SYNC: Uses same usePlayer() hook as MiniPlayer.
 * Both subscribe to the same Zustand store → always perfectly in sync.
 * Changes made here (seek, pause) are instantly reflected in MiniPlayer.
 */
export function PlayerScreen({ navigation }: Props) {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    shuffleMode,
    repeatMode,
    togglePlayPause,
    seekTo,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    cycleRepeatMode,
    queue,
    currentIndex,
  } = usePlayer();

  const handleQueuePress = useCallback(() => {
    navigation.navigate('Queue');
  }, [navigation]);

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No song playing</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
          <Ionicons name="chevron-down" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const imageUri = getBestImageUrl(currentSong.image);
  const queueLength = queue.length;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-down" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topLabel}>Now Playing</Text>
        </View>
        <TouchableOpacity onPress={handleQueuePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="list-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <ArtworkImage
          uri={imageUri}
          size={300}
          borderRadius={BorderRadius.lg}
          style={styles.artwork}
        />
      </View>

      {/* Song info */}
      <View style={styles.songInfo}>
        <View style={styles.songInfoLeft}>
          <Text style={styles.songName} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="heart-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Seek bar */}
      <View style={styles.seekContainer}>
        <SeekBar position={position} duration={duration} onSeek={seekTo} />
      </View>

      {/* Controls */}
      <PlayerControls
        isPlaying={isPlaying}
        isLoading={isLoading}
        onPlayPause={togglePlayPause}
        onNext={skipToNext}
        onPrevious={skipToPrevious}
        shuffleMode={shuffleMode}
        repeatMode={repeatMode}
        onShuffle={toggleShuffle}
        onRepeat={cycleRepeatMode}
      />

      {/* Queue indicator */}
      {queueLength > 1 && (
        <TouchableOpacity style={styles.queueIndicator} onPress={handleQueuePress}>
          <Ionicons name="list-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.queueText}>
            {currentIndex + 1} / {queueLength}
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  closeBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  topCenter: {
    alignItems: 'center',
  },
  topLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  artworkContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    flex: 1,
    justifyContent: 'center',
  },
  artwork: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  songInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg + Spacing.sm,
    marginBottom: Spacing.md,
  },
  songInfoLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  songName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  artistName: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  seekContainer: {
    marginBottom: Spacing.sm,
  },
  queueIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.lg,
    gap: 6,
  },
  queueText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
});