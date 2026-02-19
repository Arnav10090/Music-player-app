import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, getBestImageUrl, formatDuration } from '../types/song.types';
import { ArtworkImage } from './ArtworkImage';
import { useFavoritesStore } from '../store/favoritesStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

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

export function SongOptionsSheet({
  song, visible, onClose, onPlayNext, onAddToQueue, onGoToArtist, onGoToAlbum,
}: Props) {
  const Colors = useThemeColors();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  if (!song) return null;

  const liked = isFavorite(song.id);
  const imageUri = getBestImageUrl(song.image);

  const options: Option[] = [
    { icon: 'arrow-redo-outline',         label: 'Play Next',              onPress: () => { onPlayNext(song); onClose(); } },
    { icon: 'list-outline',               label: 'Add to Playing Queue',   onPress: () => { onAddToQueue(song); onClose(); } },
    { icon: 'add-circle-outline',         label: 'Add to Playlist',        onPress: () => { onClose(); } },
    { icon: 'disc-outline',               label: 'Go to Album',            onPress: () => { onGoToAlbum?.(song); onClose(); } },
    { icon: 'person-outline',             label: 'Go to Artist',           onPress: () => { onGoToArtist?.(song); onClose(); } },
    { icon: 'information-circle-outline', label: 'Details',                onPress: () => { onClose(); } },
    { icon: 'call-outline',               label: 'Set as Ringtone',        onPress: () => { onClose(); } },
    { icon: 'close-circle-outline',       label: 'Add to Blacklist',       onPress: () => { onClose(); } },
    { icon: 'share-social-outline',       label: 'Share',                  onPress: () => { onClose(); } },
    { icon: 'trash-outline',              label: 'Delete from Device',     onPress: () => { onClose(); }, destructive: true },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: Colors.modalBackdrop }]} onPress={onClose} />

      <View style={[styles.sheet, { backgroundColor: Colors.sheetBg }]}>
        <View style={[styles.dragHandle, { backgroundColor: Colors.border }]} />

        {/* Song header */}
        <View style={styles.songHeader}>
          <ArtworkImage uri={imageUri} size={56} borderRadius={BorderRadius.sm} />
          <View style={styles.songHeaderInfo}>
            <Text style={[styles.songHeaderName, { color: Colors.textPrimary }]} numberOfLines={1}>
              {song.name}
            </Text>
            <Text style={[styles.songHeaderArtist, { color: Colors.textSecondary }]} numberOfLines={1}>
              {song.primaryArtists}{'  |  '}{formatDuration(song.duration)} mins
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(song)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.heartBtn}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={24}
              color={liked ? Colors.primary : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: Colors.border }]} />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
          {options.map((opt) => (
            <TouchableOpacity key={opt.label} style={styles.option} onPress={opt.onPress} activeOpacity={0.7}>
              <View style={styles.optionIconWrap}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={opt.destructive ? Colors.error : Colors.textPrimary}
                />
              </View>
              <Text style={[styles.optionLabel, { color: opt.destructive ? Colors.error : Colors.textPrimary }]}>
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
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  dragHandle: {
    width: 36, height: 4, borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
  songHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  songHeaderInfo: { flex: 1, marginLeft: Spacing.md, marginRight: Spacing.sm },
  songHeaderName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, marginBottom: 4 },
  songHeaderArtist: { fontSize: FontSize.sm },
  heartBtn: { padding: Spacing.xs },
  divider: { height: 1, marginBottom: Spacing.xs },
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
  },
  optionIconWrap: { width: 36, alignItems: 'center', marginRight: Spacing.md },
  optionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.regular },
});