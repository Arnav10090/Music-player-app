import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableOpacity as TO,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, getBestImageUrl, formatDuration } from '../types/song.types';
import { ArtworkImage } from './ArtworkImage';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';

interface Props {
  song: Song;
  onPress: () => void;
  onMorePress?: () => void;
  isPlaying?: boolean;
  showDuration?: boolean;
}

export function SongListItem({
  song,
  onPress,
  onMorePress,
  isPlaying = false,
  showDuration = true,
}: Props) {
  const imageUri = getBestImageUrl(song.image);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <ArtworkImage uri={imageUri} size={48} borderRadius={6} />

      <View style={styles.info}>
        <Text
          style={[styles.name, isPlaying && styles.namePlaying]}
          numberOfLines={1}
        >
          {song.name}
        </Text>
        <View style={styles.meta}>
          <Text style={styles.artist} numberOfLines={1}>
            {song.primaryArtists}
          </Text>
          {showDuration && (
            <Text style={styles.duration}>
              {' · '}{formatDuration(song.duration)}
            </Text>
          )}
        </View>
      </View>

      {isPlaying && (
        <Ionicons
          name="musical-notes"
          size={16}
          color={Colors.primary}
          style={styles.playingIcon}
        />
      )}

      {onMorePress && (
        <TouchableOpacity
          style={styles.moreBtn}
          onPress={onMorePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm + 4,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  namePlaying: {
    color: Colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artist: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  duration: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  playingIcon: {
    marginRight: Spacing.xs,
  },
  moreBtn: {
    padding: Spacing.xs,
  },
});