import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { ArtworkImage } from './ArtworkImage';
import { getBestImageUrl } from '../types/song.types';
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  MiniPlayerHeight,
  BorderRadius,
} from '../constants/theme';

/**
 * MiniPlayer
 *
 * SYNC: Reads directly from the same Zustand stores as PlayerScreen via usePlayer().
 * No props are passed down — both components subscribe to the same atoms.
 * Any state change in PlayerScreen is immediately reflected here and vice versa.
 *
 * Rendered OUTSIDE the navigator at the App level, so it persists across all screens.
 */
interface Props {
  onPress: () => void; // opens full PlayerScreen
}

export function MiniPlayer({ onPress }: Props) {
  const {
    currentSong,
    isPlaying,
    isLoading,
    togglePlayPause,
    skipToNext,
  } = usePlayer();

  if (!currentSong) return null;

  const imageUri = getBestImageUrl(currentSong.image);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.95}>
      {/* Left: artwork + info */}
      <View style={styles.left}>
        <ArtworkImage uri={imageUri} size={40} borderRadius={BorderRadius.sm} />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>
      </View>

      {/* Right: controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={togglePlayPause}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={24}
              color={Colors.textPrimary}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={skipToNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <Ionicons name="play-skip-forward" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MiniPlayerHeight,
    backgroundColor: Colors.miniPlayerBg,
    borderTopWidth: 1,
    borderTopColor: Colors.miniPlayerBorder,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm + 2,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  artist: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});