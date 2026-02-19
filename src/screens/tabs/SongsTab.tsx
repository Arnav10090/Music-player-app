import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearch } from "../../hooks/useSearch";
import { usePlayer } from "../../hooks/usePlayer";
import { SongOptionsSheet } from "../../components/SongOptionsSheet";
import { ArtworkImage } from "../../components/ArtworkImage";
import { Song, getBestImageUrl, formatDuration } from "../../types/song.types";
import { useThemeColors } from "../../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../../constants/theme";

const SORT_OPTIONS = ["Ascending","Descending","Artist","Album","Year","Date Added","Date Modified","Composer"];

export function SongsTab({ navigation }: any) {
  const Colors = useThemeColors();
  const search = useSearch();
  const player = usePlayer();
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("Ascending");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // Ordered list of song IDs that have been added to the playing queue
  // via "Add to Playing Queue". Index+1 is shown as the badge on the artwork.
  const [queuedSongIds, setQueuedSongIds] = useState<string[]>([]);

  // Tracks how many songs have been inserted after the currently-playing song.
  // Song 1 → inserted at currentIndex+1
  // Song 2 → inserted at currentIndex+2
  // etc.
  const queueOffsetRef = useRef(0);

  // Used to detect when the current song actually changes
  const prevCurrentSongId = useRef<string | null>(null);

  useEffect(() => {
    if (search.results.length === 0) search.search("top hindi songs");
  }, []);

  // When the currently-playing song changes:
  //  • Remove its badge (it is now playing, not queued)
  //  • Reset the offset so new additions land right after the new current song
  useEffect(() => {
    const currentId = player.currentSong?.id ?? null;
    if (currentId && currentId !== prevCurrentSongId.current) {
      setQueuedSongIds(prev => prev.filter(id => id !== currentId));
      queueOffsetRef.current = 0;          // reset – new additions go right after the new current
      prevCurrentSongId.current = currentId;
    }
  }, [player.currentSong?.id]);

  const sortedResults = [...search.results].sort((a, b) => {
    if (sortOption === "Descending") return b.name.localeCompare(a.name);
    if (sortOption === "Artist") return a.primaryArtists.localeCompare(b.primaryArtists);
    if (sortOption === "Album") return a.album.name.localeCompare(b.album.name);
    return a.name.localeCompare(b.name);
  });

  const openSheet = useCallback((song: Song) => {
    setSelectedSong(song); setSheetVisible(true);
  }, []);

  const handlePlay = useCallback((index: number) => {
    // Fresh playback → wipe all queue badges and reset offset
    setQueuedSongIds([]);
    queueOffsetRef.current = 0;
    player.playSong(sortedResults, index);
    navigation.navigate("Player");
  }, [sortedResults, player, navigation]);

  /**
   * Add song to the playing queue directly after the current song
   * (and after any previously queued songs from this session).
   *
   * e.g. current is at index 1:
   *   1st add → inserted at index 2  (plays right after current)
   *   2nd add → inserted at index 3  (plays after the 1st queued song)
   */
  const handleAddToQueue = useCallback((song: Song) => {
    const insertAt = player.currentIndex + 1 + queueOffsetRef.current;
    player.insertIntoQueue(song, insertAt);
    queueOffsetRef.current += 1;

    setQueuedSongIds(prev => {
      if (prev.includes(song.id)) return prev;   // already queued, no duplicate badge
      return [...prev, song.id];
    });
  }, [player]);

  const renderItem = useCallback(({ item, index }: { item: Song; index: number }) => {
    const isPlaying = player.currentSong?.id === item.id;
    const queuePosition = queuedSongIds.indexOf(item.id);  // -1 if not queued
    const isQueued = queuePosition !== -1;

    return (
      <View style={styles.row}>
        {/* Artwork + optional queue-position badge */}
        <TouchableOpacity onPress={() => openSheet(item)} activeOpacity={0.75} style={styles.artworkWrap}>
          <ArtworkImage uri={getBestImageUrl(item.image)} size={52} borderRadius={6} />
          {isQueued && (
            <View style={[styles.queueBadge, { backgroundColor: Colors.primary }]}>
              <Text style={styles.queueBadgeText}>{queuePosition + 1}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.info} onPress={() => openSheet(item)} activeOpacity={0.75}>
          <Text style={[styles.name, { color: isPlaying ? Colors.primary : Colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.meta, { color: Colors.textSecondary }]} numberOfLines={1}>
            {item.primaryArtists}{' | '}{formatDuration(item.duration)} mins
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.playBtn} onPress={() => handlePlay(index)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <Ionicons name={isPlaying && player.isPlaying ? "pause" : "play"} size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreBtn} onPress={() => openSheet(item)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }, [player.currentSong, player.isPlaying, handlePlay, openSheet, Colors, queuedSongIds]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.sortBar}>
        <Text style={[styles.countText, { color: Colors.textSecondary }]}>
          {search.total > 0 ? `${search.total.toLocaleString()} songs` : ""}
        </Text>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModalVisible(true)}>
          <Text style={[styles.sortText, { color: Colors.primary }]}>{sortOption}</Text>
          <Ionicons name="swap-vertical-outline" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {search.isLoading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      <FlatList
        data={sortedResults}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        onEndReached={search.loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: Colors.border }]} />}
        ListFooterComponent={search.isLoadingMore ? <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} /> : null}
      />

      {/* Sort Modal */}
      <Modal visible={sortModalVisible} transparent animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setSortModalVisible(false)} />
        <View style={[styles.sortModal, { backgroundColor: Colors.cardBg }]}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOption}
              onPress={() => { setSortOption(opt); setSortModalVisible(false); }}
            >
              <Text style={[styles.sortOptionText, { color: Colors.textPrimary }]}>{opt}</Text>
              <View style={[styles.radio, { borderColor: sortOption === opt ? Colors.primary : Colors.border }]}>
                {sortOption === opt && <View style={[styles.radioDot, { backgroundColor: Colors.primary }]} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <SongOptionsSheet
        song={selectedSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => player.playNext(song)}
        onAddToQueue={handleAddToQueue}
        onGoToArtist={(song) => {
          setSheetVisible(false);
          navigation.navigate("ArtistDetail", {
            artistName: song.primaryArtists,
            prefetchedSongs: sortedResults.filter((s) => s.primaryArtists === song.primaryArtists),
            prefetchedImage: getBestImageUrl(song.image),
          });
        }}
        onGoToAlbum={(song) => {
          setSheetVisible(false);
          navigation.navigate("AlbumDetail", {
            albumName: song.album.name,
            artist: song.primaryArtists,
            songs: sortedResults.filter((s) => s.album.id === song.album.id),
            image: song.image,
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sortBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  countText: { fontSize: FontSize.sm },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },

  // Wrapper so the badge is positioned relative to the artwork
  artworkWrap: { position: "relative" },

  // Small orange circle with queue number, bottom-right of artwork
  queueBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  queueBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: FontWeight.bold,
    lineHeight: 13,
  },

  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.medium, marginBottom: 3 },
  meta: { fontSize: FontSize.xs + 1 },
  playBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FF6B2C',
    alignItems: "center", justifyContent: "center", marginRight: Spacing.sm,
  },
  moreBtn: { padding: Spacing.xs },
  separator: { height: 1, marginLeft: 52 + Spacing.md + Spacing.sm + 2 },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sortModal: {
    position: "absolute", right: Spacing.md, top: 120,
    borderRadius: BorderRadius.md, paddingVertical: Spacing.sm,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 10, minWidth: 200,
  },
  sortOption: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  sortOptionText: { fontSize: FontSize.sm + 1 },
  radio: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
});