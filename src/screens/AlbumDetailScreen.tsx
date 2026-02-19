import React, { useCallback, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import { Song, getBestImageUrl, formatDuration } from "../types/song.types";
import { useThemeColors } from "../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

export function AlbumDetailScreen({ route, navigation }: any) {
  const Colors = useThemeColors();
  const { albumName, artist, songs, image } = route.params;
  const player = usePlayer();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handlePlay = useCallback((index: number) => {
    player.playSong(songs, index);
    navigation.navigate("Player");
  }, [songs, player, navigation]);

  const totalDuration = songs.reduce((sum: number, s: Song) => sum + s.duration, 0);
  const artworkUri = getBestImageUrl(image);

  const renderItem = useCallback(({ item, index }: { item: Song; index: number }) => {
    const isPlaying = player.currentSong?.id === item.id;
    return (
      <View style={styles.songRow}>
        <ArtworkImage uri={getBestImageUrl(item.image)} size={52} borderRadius={6} />
        <View style={styles.songInfo}>
          <Text style={[styles.songName, { color: isPlaying ? Colors.primary : Colors.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.songArtist, { color: Colors.textSecondary }]} numberOfLines={1}>
            {item.primaryArtists}
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
          style={styles.moreBtn}
          onPress={() => { setSelectedSong(item); setSheetVisible(true); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }, [player.currentSong, player.isPlaying, handlePlay, Colors]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <FlatList
        data={songs}
        keyExtractor={(item: Song, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.md + Spacing.sm }} />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Artwork with overlaid back button */}
            <View style={{ position: "relative" }}>
              <ArtworkImage uri={artworkUri} size={SCREEN_WIDTH} borderRadius={0} style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }} />
              <TouchableOpacity
                style={[styles.backBtn, { backgroundColor: Colors.background + 'CC' }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.heroControls}>
                <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
                <View style={[styles.moreCircle, { backgroundColor: Colors.backgroundSecondary }]}>
                  <Ionicons name="ellipsis-horizontal" size={20} color={Colors.textPrimary} />
                </View>
              </View>
            </View>

            {/* Album info */}
            <View style={[styles.albumInfo, { backgroundColor: Colors.background }]}>
              <Text style={[styles.albumName, { color: Colors.textPrimary }]}>{albumName}</Text>
              <Text style={[styles.albumStats, { color: Colors.textSecondary }]}>
                1 Album  |  {songs.length} Songs  |  {formatDuration(totalDuration)} mins
              </Text>

              {/* Action buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, { backgroundColor: Colors.primary }]}
                  onPress={() => { 
                    if (!player.shuffleMode) player.toggleShuffle(); 
                    handlePlay(0); 
                  }}
                >
                  <Ionicons name="shuffle" size={18} color="#FFF" />
                  <Text style={styles.actionBtnTextPrimary}>Shuffle</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtnSecondary, { backgroundColor: Colors.backgroundSecondary }]}
                  onPress={() => handlePlay(0)}
                >
                  <Ionicons name="play" size={18} color={Colors.textPrimary} />
                  <Text style={[styles.actionBtnTextSecondary, { color: Colors.textPrimary }]}>Play</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Songs</Text>
                <TouchableOpacity>
                  <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
      />

      <SongOptionsSheet
        song={selectedSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => player.playNext(song)}
        onAddToQueue={(song) => player.addToQueue(song)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: {
    position: "absolute", top: Spacing.lg, left: Spacing.md,
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  heroControls: {
    position: "absolute", top: Spacing.lg, right: Spacing.md,
    flexDirection: "row", alignItems: "center", gap: Spacing.sm,
  },
  moreCircle: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
  },
  albumInfo: { padding: Spacing.md },
  albumName: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, marginBottom: Spacing.xs },
  albumStats: { fontSize: FontSize.sm, marginBottom: Spacing.lg },
  actionRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  actionBtnPrimary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.sm + 4, borderRadius: BorderRadius.full, gap: Spacing.sm,
  },
  actionBtnSecondary: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    paddingVertical: Spacing.sm + 4, borderRadius: BorderRadius.full, gap: Spacing.sm,
  },
  actionBtnTextPrimary: { color: "#FFFFFF", fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  actionBtnTextSecondary: { fontWeight: FontWeight.semibold, fontSize: FontSize.md },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  songRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2,
  },
  songInfo: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  songName: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.medium, marginBottom: 3 },
  songArtist: { fontSize: FontSize.xs + 1 },
  playBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#FF6B2C',
    alignItems: "center", justifyContent: "center", marginRight: Spacing.sm,
  },
  moreBtn: { padding: Spacing.xs },
});