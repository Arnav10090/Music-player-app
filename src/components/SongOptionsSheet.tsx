import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, getBestImageUrl, formatDuration } from '../types/song.types';
import { ArtworkImage } from './ArtworkImage';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface Option {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

interface Props {
  song: Song | null;
  visible: boolean;
  onClose: () => void;
  onPlayNext: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onGoToArtist?: (song: Song) => void;
  onGoToAlbum?: (song: Song) => void;
}

/**
 * SongOptionsSheet — bottom sheet matching Figma screen 8
 * Options: Play Next, Add to Playing Queue, Add to Playlist,
 *          Go to Album, Go to Artist, Details, Share
 */
export function SongOptionsSheet({
  song,
  visible,
  onClose,
  onPlayNext,
  onAddToQueue,
  onGoToArtist,
  onGoToAlbum,
}: Props) {
  if (!song) return null;

  const imageUri = getBestImageUrl(song.image);

  const options: Option[] = [
    {
      icon: 'play-skip-forward-outline',
      label: 'Play Next',
      onPress: () => { onPlayNext(song); onClose(); },
    },
    {
      icon: 'list-outline',
      label: 'Add to Playing Queue',
      onPress: () => { onAddToQueue(song); onClose(); },
    },
    {
      icon: 'musical-notes-outline',
      label: 'Go to Album',
      onPress: () => { onGoToAlbum?.(song); onClose(); },
    },
    {
      icon: 'person-outline',
      label: 'Go to Artist',
      onPress: () => { onGoToArtist?.(song); onClose(); },
    },
    {
      icon: 'share-social-outline',
      label: 'Share',
      onPress: () => { onClose(); },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Dim backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Drag indicator */}
        <View style={styles.dragHandle} />

        {/* Song header */}
        <View style={styles.songHeader}>
          <ArtworkImage uri={imageUri} size={52} borderRadius={BorderRadius.sm} />
          <View style={styles.songHeaderInfo}>
            <Text style={styles.songHeaderName} numberOfLines={1}>
              {song.name}
            </Text>
            <Text style={styles.songHeaderArtist} numberOfLines={1}>
              {song.primaryArtists} · {formatDuration(song.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Options list */}
        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.option}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={22}
                color={opt.destructive ? Colors.error : Colors.textPrimary}
                style={styles.optionIcon}
              />
              <Text
                style={[
                  styles.optionLabel,
                  opt.destructive && { color: Colors.error },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  songHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  songHeaderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  songHeaderName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  songHeaderArtist: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  optionIcon: {
    width: 32,
    marginRight: Spacing.md,
  },
  optionLabel: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    fontWeight: FontWeight.regular,
  },
});