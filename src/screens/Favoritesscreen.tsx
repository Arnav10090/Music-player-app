import React, { useEffect, useCallback, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFavoritesStore } from "../store/favoritesStore";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import { Song, getBestImageUrl, formatDuration } from "../types/song.types";
import { useThemeColors } from "../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../constants/theme";

export function FavoritesScreen({ navigation }: any) {
  const Colors = useThemeColors();
  const { favorites, isLoaded, loadFavorites, toggleFavorite } = useFavoritesStore();
  const player = usePlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => { if (!isLoaded) loadFavorites(); }, []);

  const handlePlay = useCallback((index: number) => {
    player.playSong(favorites, index);
    navigation.navigate("Player");
  }, [favorites, player, navigation]);

  const openSheet = useCallback((song: Song) => {
    setSelectedSong(song); setSheetVisible(true);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Song; index: number }) => {
    const isPlaying = player.currentSong?.id === item.id;
    return (
      <TouchableOpacity style={styles.row} onPress={() => openSheet(item)} activeOpacity={0.75}>
        <ArtworkImage uri={getBestImageUrl(item.image)} size={52} borderRadius={6} />
        <View style={styles.info}>
          <Text style={[styles.name, { color: isPlaying ? Colors.primary : Colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: Colors.textSecondary }]} numberOfLines={1}>
            {item.primaryArtists} | {formatDuration(item.duration)} mins
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => handlePlay(index)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Ionicons name={isPlaying && player.isPlaying ? "pause" : "play"} size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFavorite(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.heartBtn}
        >
          <Ionicons name="heart" size={20} color={Colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }, [player.currentSong, player.isPlaying, handlePlay, openSheet, toggleFavorite, Colors]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.header, { color: Colors.textPrimary }]}>Favourites</Text>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
        <Text style={[styles.header, { color: Colors.textPrimary }]}>Favourites</Text>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={Colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No Favourites Yet</Text>
          <Text style={[styles.emptySub, { color: Colors.textSecondary }]}>
            Tap the ♡ on any song to add it here
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: Colors.textPrimary }]}>Favourites</Text>
        <Text style={[styles.count, { color: Colors.textSecondary }]}>{favorites.length} songs</Text>
      </View>

      <TouchableOpacity style={styles.playAllBtn} onPress={() => handlePlay(0)} activeOpacity={0.85}>
        <Ionicons name="play" size={18} color="#FFFFFF" />
        <Text style={styles.playAllText}>Play All</Text>
      </TouchableOpacity>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.md + Spacing.sm + 2 }} />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      <SongOptionsSheet
        song={selectedSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => player.playNext(song)}
        onAddToQueue={(song) => player.addToQueue(song)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row", alignItems: "baseline", justifyContent: "space-between",
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  header: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  count: { fontSize: FontSize.sm },
  playAllBtn: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start", gap: Spacing.xs,
    marginHorizontal: Spacing.md, marginBottom: Spacing.md,
    backgroundColor: '#FF6B2C',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  playAllText: { color: "#FFFFFF", fontWeight: FontWeight.semibold, fontSize: FontSize.sm + 1 },
  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.medium, marginBottom: 3 },
  meta: { fontSize: FontSize.xs + 1 },
  playBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: '#FF6B2C',
    alignItems: "center", justifyContent: "center", marginRight: Spacing.sm,
  },
  heartBtn: { padding: Spacing.xs },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: Spacing.xl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, marginTop: Spacing.md },
  emptySub: { fontSize: FontSize.sm, marginTop: Spacing.sm, textAlign: "center" },
});