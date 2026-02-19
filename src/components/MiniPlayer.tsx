import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { ArtworkImage } from './ArtworkImage';
import { getBestImageUrl } from '../types/song.types';
import { useThemeColors } from '../hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, MiniPlayerHeight, BorderRadius } from '../constants/theme';

interface Props { onPress: () => void; }

export function MiniPlayer({ onPress }: Props) {
  const Colors = useThemeColors();
  const { currentSong, isPlaying, isLoading, togglePlayPause, skipToNext } = usePlayer();

  if (!currentSong) return null;

  const imageUri = getBestImageUrl(currentSong.image);

  return (
    <TouchableOpacity
      style={[styles.container, {
        backgroundColor: Colors.miniPlayerBg,
        borderTopColor: Colors.miniPlayerBorder,
      }]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.left}>
        <ArtworkImage uri={imageUri} size={40} borderRadius={BorderRadius.sm} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: Colors.textPrimary }]} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={[styles.artist, { color: Colors.textSecondary }]} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>
      </View>

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
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 8,
  },
  left: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.semibold, marginBottom: 2 },
  artist: { fontSize: FontSize.xs + 1 },
  controls: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: Spacing.sm, marginLeft: Spacing.xs },
});