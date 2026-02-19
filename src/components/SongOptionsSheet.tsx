import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, Pressable,
  ScrollView, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Song, getBestImageUrl, formatDuration } from '../types/song.types';
import { ArtworkImage } from './ArtworkImage';
import { useFavoritesStore } from '../store/favoritesStore';
import { useThemeColors } from '../hooks/useThemeColors';
import { Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';
import {
  downloadSong,
  deleteDownload,
  isDownloaded,
  getLocalPath,
} from '../services/downloadService';

// ─── Download state machine ────────────────────────────────────────────────────
type DownloadStatus = 'idle' | 'checking' | 'downloading' | 'done' | 'error';

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

  const [downloadStatus, setDownloadStatus] = useState<DownloadStatus>('checking');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  // Check download status every time the sheet opens for a new song
  useEffect(() => {
    if (!song || !visible) return;
    setDownloadStatus('checking');
    setDownloadProgress(0);
    progressAnim.setValue(0);

    isDownloaded(song.id).then((downloaded) => {
      setDownloadStatus(downloaded ? 'done' : 'idle');
    });
  }, [song?.id, visible]);

  // Animate the progress bar whenever downloadProgress changes
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: downloadProgress,
      duration: 120,
      useNativeDriver: false,
    }).start();
  }, [downloadProgress]);

  const handleDownload = useCallback(async () => {
    if (!song) return;
    if (downloadStatus === 'done') {
      // Offer to delete
      Alert.alert(
        'Remove Download',
        `Delete the offline copy of "${song.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteDownload(song.id);
              setDownloadStatus('idle');
              setDownloadProgress(0);
            },
          },
        ]
      );
      return;
    }

    if (downloadStatus === 'downloading') return; // already in progress

    try {
      setDownloadStatus('downloading');
      setDownloadProgress(0);
      await downloadSong(song, (progress) => {
        setDownloadProgress(progress);
      });
      setDownloadStatus('done');
      setDownloadProgress(1);
    } catch (e: any) {
      setDownloadStatus('error');
      Alert.alert('Download Failed', e.message ?? 'Unknown error');
    }
  }, [song, downloadStatus]);

  if (!song) return null;

  const liked = isFavorite(song.id);
  const imageUri = getBestImageUrl(song.image);

  // ── Download row label / icon ──────────────────────────────────────────────
  const downloadIcon: keyof typeof Ionicons.glyphMap =
    downloadStatus === 'done'
      ? 'checkmark-circle'
      : downloadStatus === 'downloading'
      ? 'cloud-download-outline'
      : downloadStatus === 'error'
      ? 'alert-circle-outline'
      : 'download-outline';

  const downloadLabel =
    downloadStatus === 'done'
      ? 'Downloaded  —  Tap to Remove'
      : downloadStatus === 'downloading'
      ? `Downloading…  ${Math.round(downloadProgress * 100)}%`
      : downloadStatus === 'error'
      ? 'Download Failed  —  Tap to Retry'
      : 'Download Song';

  const downloadIconColor =
    downloadStatus === 'done'
      ? Colors.primary
      : downloadStatus === 'error'
      ? Colors.error
      : Colors.textPrimary;

  // ── Static options ────────────────────────────────────────────────────────
  const staticOptions: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    destructive?: boolean;
  }> = [
    { icon: 'arrow-redo-outline',         label: 'Play Next',             onPress: () => { onPlayNext(song); onClose(); } },
    { icon: 'list-outline',               label: 'Add to Playing Queue',  onPress: () => { onAddToQueue(song); onClose(); } },
    { icon: 'add-circle-outline',         label: 'Add to Playlist',       onPress: () => { onClose(); } },
    { icon: 'disc-outline',               label: 'Go to Album',           onPress: () => { onGoToAlbum?.(song); onClose(); } },
    { icon: 'person-outline',             label: 'Go to Artist',          onPress: () => { onGoToArtist?.(song); onClose(); } },
    { icon: 'information-circle-outline', label: 'Details',               onPress: () => { onClose(); } },
    { icon: 'call-outline',               label: 'Set as Ringtone',       onPress: () => { onClose(); } },
    { icon: 'share-social-outline',       label: 'Share',                 onPress: () => { onClose(); } },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: Colors.modalBackdrop }]}
        onPress={onClose}
      />

      <View style={[styles.sheet, { backgroundColor: Colors.sheetBg }]}>
        <View style={[styles.dragHandle, { backgroundColor: Colors.border }]} />

        {/* ── Song header ─────────────────────────────────────────────────── */}
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

          {/* ── Download row (special — has progress bar) ─────────────────── */}
          <TouchableOpacity
            style={[
              styles.option,
              downloadStatus === 'done' && { backgroundColor: Colors.primary + '12' },
            ]}
            onPress={handleDownload}
            activeOpacity={downloadStatus === 'downloading' ? 1 : 0.7}
            disabled={downloadStatus === 'checking'}
          >
            <View style={styles.optionIconWrap}>
              <Ionicons name={downloadIcon} size={22} color={downloadIconColor} />
            </View>
            <View style={styles.downloadLabelWrap}>
              <Text style={[styles.optionLabel, { color: downloadIconColor }]}>
                {downloadLabel}
              </Text>
              {/* Progress bar — only visible while downloading */}
              {downloadStatus === 'downloading' && (
                <View style={[styles.progressTrack, { backgroundColor: Colors.border }]}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: Colors.primary,
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              )}
            </View>
            {/* Percentage badge while downloading */}
            {downloadStatus === 'downloading' && (
              <View style={[styles.percentBadge, { backgroundColor: Colors.primary }]}>
                <Text style={styles.percentText}>
                  {Math.round(downloadProgress * 100)}%
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={[styles.optionDivider, { backgroundColor: Colors.border }]} />

          {/* ── Static options ────────────────────────────────────────────── */}
          {staticOptions.map((opt) => (
            <TouchableOpacity
              key={opt.label}
              style={styles.option}
              onPress={opt.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconWrap}>
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={opt.destructive ? Colors.error : Colors.textPrimary}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  { color: opt.destructive ? Colors.error : Colors.textPrimary },
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
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: 36,
    maxHeight: '88%',
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
  optionDivider: { height: 1, marginVertical: Spacing.xs, marginHorizontal: Spacing.md },

  // Download row
  option: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4,
  },
  optionIconWrap: { width: 36, alignItems: 'center', marginRight: Spacing.md },
  optionLabel: { fontSize: FontSize.md, fontWeight: FontWeight.regular },

  downloadLabelWrap: { flex: 1 },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 2,
  },
  percentBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 10, marginLeft: Spacing.sm,
  },
  percentText: {
    color: '#fff',
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});