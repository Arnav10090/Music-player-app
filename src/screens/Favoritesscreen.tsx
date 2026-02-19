import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../store/favoritesStore";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import { Song, getBestImageUrl, formatDuration } from "../types/song.types";
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from "../constants/theme";

export function FavoritesScreen({ navigation }: any) {
  const { favorites, isLoaded, loadFavorites, toggleFavorite } = useFavoritesStore();
  const player = usePlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Load persisted favorites on first mount
  useEffect(() => {
    if (!isLoaded) loadFavorites();
  }, []);

  const handlePlay = useCallback(
    (index: number) => {
      player.playSong(favorites, index);
      navigation.navigate("Player");
    },
    [favorites, player, navigation],
  );

  const openSheet = useCallback((song: Song) => {
    setSelectedSong(song);
    setSheetVisible(true);
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => {
      const isPlaying = player.currentSong?.id === item.id;

      return (
        <TouchableOpacity
          style={styles.row}
          onPress={() => openSheet(item)}
          activeOpacity={0.75}
        >
          {/* Artwork */}
          <ArtworkImage
            uri={getBestImageUrl(item.image)}
            size={52}
            borderRadius={6}
          />

          {/* Info */}
          <View style={styles.info}>
            <Text
              style={[styles.name, isPlaying && styles.namePlaying]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {item.primaryArtists}
              {' | '}
              {formatDuration(item.duration)} mins
            </Text>
          </View>

          {/* Play button */}
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => handlePlay(index)}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons
              name={isPlaying && player.isPlaying ? "pause" : "play"}
              size={18}
              color={Colors.textInverse}
            />
          </TouchableOpacity>

          {/* Filled heart — tap to unlike */}
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.heartBtn}
          >
            <Ionicons name="heart" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [player.currentSong, player.isPlaying, handlePlay, openSheet, toggleFavorite],
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Favourites</Text>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Favourites</Text>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Favourites Yet</Text>
          <Text style={styles.emptySub}>
            Tap the ♡ on any song to add it here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Filled state ───────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Favourites</Text>
        <Text style={styles.count}>{favorites.length} songs</Text>
      </View>

      {/* Play all button */}
      <TouchableOpacity
        style={styles.playAllBtn}
        onPress={() => handlePlay(0)}
        activeOpacity={0.85}
      >
        <Ionicons name="play" size={18} color={Colors.textInverse} />
        <Text style={styles.playAllText}>Play All</Text>
      </TouchableOpacity>

      {/* Song list */}
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Options sheet */}
      <SongOptionsSheet
        song={selectedSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => player.addToQueue(song)}
        onAddToQueue={(song) => player.addToQueue(song)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  header: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
  },

  // ── Play all ───────────────────────────────────────────────────────────────
  playAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: Spacing.xs,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  playAllText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm + 1,
  },

  // ── Song row ───────────────────────────────────────────────────────────────
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  info: {
    flex: 1,
    marginLeft: Spacing.sm + 2,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  namePlaying: { color: Colors.primary },
  meta: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  heartBtn: {
    padding: Spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 52 + Spacing.md + Spacing.sm + 2,
  },

  // ── Empty ──────────────────────────────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
  },
});