import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePlayer } from '../hooks/usePlayer';
import { ArtworkImage } from '../components/ArtworkImage';
import { Song, getBestImageUrl, formatDuration } from '../types/song.types';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface Props {
  navigation: any;
}

/**
 * QueueScreen
 *
 * Displays the current playback queue.
 * - Tap a song to jump to it
 * - Long press or swipe options for remove
 * - Reorder: drag handles (via DraggableFlatList — gracefully degraded here
 *   to a simpler implementation without the native dependency for build safety)
 *
 * PERSISTENCE: Queue is auto-saved by queueStore on every mutation via MMKV.
 */
export function QueueScreen({ navigation }: Props) {
  const {
    queue,
    currentIndex,
    currentSong,
    skipToIndex,
    removeFromQueue,
    reorderQueue,
  } = usePlayer();

  const handleSongPress = useCallback(
    (index: number) => {
      skipToIndex(index);
    },
    [skipToIndex]
  );

  const handleRemove = useCallback(
    (index: number, songName: string) => {
      Alert.alert(
        'Remove from Queue',
        `Remove "${songName}" from queue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () => removeFromQueue(index),
          },
        ]
      );
    },
    [removeFromQueue]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => {
      const isActive = index === currentIndex;
      const imageUri = getBestImageUrl(item.image);

      return (
        <TouchableOpacity
          style={[styles.item, isActive && styles.itemActive]}
          onPress={() => handleSongPress(index)}
          activeOpacity={0.7}
        >
          {/* Playing indicator or track number */}
          <View style={styles.indexContainer}>
            {isActive ? (
              <Ionicons name="musical-notes" size={16} color={Colors.primary} />
            ) : (
              <Text style={styles.indexText}>{index + 1}</Text>
            )}
          </View>

          <ArtworkImage uri={imageUri} size={44} borderRadius={BorderRadius.sm} />

          <View style={styles.info}>
            <Text
              style={[styles.name, isActive && styles.nameActive]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {item.primaryArtists} · {formatDuration(item.duration)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => handleRemove(index, item.name)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.removeBtn}
          >
            <Ionicons name="close-outline" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {/* Drag handle (visual only — full drag requires DraggableFlatList native setup) */}
          <Ionicons name="reorder-two-outline" size={20} color={Colors.textTertiary} />
        </TouchableOpacity>
      );
    },
    [currentIndex, handleSongPress, handleRemove]
  );

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-down" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Queue</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Queue info */}
      <Text style={styles.queueMeta}>
        {queue.length} song{queue.length !== 1 ? 's' : ''}
        {currentSong ? ` · Now: ${currentSong.name}` : ''}
      </Text>

      {queue.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Queue is empty</Text>
          <Text style={styles.emptySubtitle}>
            Search for songs and tap play to add them
          </Text>
        </View>
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderItem}
          ItemSeparatorComponent={renderSeparator}
          showsVerticalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: 64,
            offset: 64 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  placeholder: {
    width: 28,
  },
  queueMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    height: 64,
  },
  itemActive: {
    backgroundColor: Colors.backgroundSecondary,
  },
  indexContainer: {
    width: 24,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  indexText: {
    fontSize: FontSize.sm,
    color: Colors.textTertiary,
  },
  info: {
    flex: 1,
    marginHorizontal: Spacing.sm + 2,
  },
  name: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  nameActive: {
    color: Colors.primary,
  },
  artist: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
  },
  removeBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 24 + Spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
});