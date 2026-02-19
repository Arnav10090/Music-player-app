import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearch } from "../../hooks/useSearch";
import { usePlayer } from "../../hooks/usePlayer";
import { SongOptionsSheet } from "../../components/SongOptionsSheet";
import { ArtworkImage } from "../../components/ArtworkImage";
import { Song, getBestImageUrl, formatDuration } from "../../types/song.types";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from "../../constants/theme";

const SORT_OPTIONS = [
  "Ascending",
  "Descending",
  "Artist",
  "Album",
  "Year",
  "Date Added",
  "Date Modified",
  "Composer",
];

export function SongsTab({ navigation }: any) {
  const search = useSearch();
  const player = usePlayer();
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState("Ascending");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    if (search.results.length === 0) search.search("top hindi songs");
  }, []);

  const sortedResults = [...search.results].sort((a, b) => {
    if (sortOption === "Descending") return b.name.localeCompare(a.name);
    if (sortOption === "Artist")
      return a.primaryArtists.localeCompare(b.primaryArtists);
    if (sortOption === "Album") return a.album.name.localeCompare(b.album.name);
    return a.name.localeCompare(b.name);
  });

  const handlePlay = useCallback(
    (index: number) => {
      player.playSong(sortedResults, index);
      navigation.navigate("Player");
    },
    [sortedResults, player, navigation],
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => {
      const isPlaying = player.currentSong?.id === item.id;
      return (
        <View style={styles.row}>
          <ArtworkImage
            uri={getBestImageUrl(item.image)}
            size={52}
            borderRadius={6}
          />
          <View style={styles.info}>
            <Text
              style={[styles.name, isPlaying && styles.namePlaying]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text style={styles.meta}>
              {item.primaryArtists} | {formatDuration(item.duration)} mins
            </Text>
          </View>
          <TouchableOpacity
            style={styles.playBtn}
            onPress={() => handlePlay(index)}
          >
            <Ionicons
              name={isPlaying && player.isPlaying ? "pause" : "play"}
              size={18}
              color={Colors.textInverse}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.moreBtn}
            onPress={() => {
              setSelectedSong(item);
              setSheetVisible(true);
            }}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [player.currentSong, player.isPlaying, handlePlay],
  );

  return (
    <View style={styles.container}>
      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.countText}>
          {search.total > 0 ? `${search.total.toLocaleString()} songs` : ""}
        </Text>
        <TouchableOpacity
          style={styles.sortBtn}
          onPress={() => setSortModalVisible(true)}
        >
          <Text style={styles.sortText}>{sortOption}</Text>
          <Ionicons
            name="swap-vertical-outline"
            size={16}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {search.isLoading && (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      )}

      <FlatList
        data={sortedResults}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        onEndReached={search.loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          search.isLoadingMore ? (
            <ActivityIndicator color={Colors.primary} style={{ margin: 16 }} />
          ) : null
        }
      />

      {/* Sort Modal */}
      <Modal
        visible={sortModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSortModalVisible(false)}
        />
        <View style={styles.sortModal}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={styles.sortOption}
              onPress={() => {
                setSortOption(opt);
                setSortModalVisible(false);
              }}
            >
              <Text style={styles.sortOptionText}>{opt}</Text>
              <View
                style={[styles.radio, sortOption === opt && styles.radioActive]}
              >
                {sortOption === opt && <View style={styles.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      <SongOptionsSheet
        song={selectedSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => player.addToQueue(song)}
        onAddToQueue={(song) => player.addToQueue(song)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  countText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  namePlaying: { color: Colors.primary },
  meta: { fontSize: FontSize.xs + 1, color: Colors.textSecondary },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  moreBtn: { padding: Spacing.xs },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 52 + Spacing.md + Spacing.sm + 2,
  },
  modalBackdrop: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  sortModal: {
    position: "absolute",
    right: Spacing.md,
    top: 120,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    minWidth: 200,
  },
  sortOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  sortOptionText: { fontSize: FontSize.sm + 1, color: Colors.textPrimary },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: Colors.primary },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
});
