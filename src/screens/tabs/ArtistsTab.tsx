import React, { useCallback, useEffect, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Modal, Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearch } from "../../hooks/useSearch";
import { usePlayer } from "../../hooks/usePlayer";
import { ArtworkImage } from "../../components/ArtworkImage";
import { Song, getBestImageUrl } from "../../types/song.types";
import { useThemeColors } from "../../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../../constants/theme";

interface ArtistGroup { name: string; songs: Song[]; image: any[]; }

export function ArtistsTab({ navigation }: any) {
  const Colors = useThemeColors();
  const search = useSearch();
  const player = usePlayer();
  const [selectedArtist, setSelectedArtist] = useState<ArtistGroup | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    if (search.results.length === 0) search.search("top hindi songs");
  }, []);

  const artistGroups: ArtistGroup[] = Object.values(
    search.results.reduce((acc: Record<string, ArtistGroup>, song) => {
      const name = song.primaryArtists;
      if (!acc[name]) acc[name] = { name, songs: [], image: song.image };
      acc[name].songs.push(song);
      return acc;
    }, {}),
  );

  const handleViewArtist = useCallback(() => {
    if (!selectedArtist) return;
    setSheetVisible(false);
    navigation.navigate("ArtistDetail", {
      artistName: selectedArtist.name,
      prefetchedSongs: selectedArtist.songs,
      prefetchedImage: getBestImageUrl(selectedArtist.image),
    });
  }, [selectedArtist, navigation]);

  const renderItem = useCallback(({ item }: { item: ArtistGroup }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => { setSelectedArtist(item); setSheetVisible(true); }}
      activeOpacity={0.7}
    >
      <ArtworkImage uri={getBestImageUrl(item.image)} size={52} borderRadius={26} />
      <View style={styles.info}>
        <Text style={[styles.name, { color: Colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.meta, { color: Colors.textSecondary }]}>1 Album | {item.songs.length} Songs</Text>
      </View>
      <TouchableOpacity
        onPress={() => { setSelectedArtist(item); setSheetVisible(true); }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [Colors]);

  return (
    <View style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.sortBar}>
        <Text style={[styles.countText, { color: Colors.textSecondary }]}>
          {artistGroups.length > 0 ? `${artistGroups.length} artists` : ""}
        </Text>
        <View style={styles.sortBtn}>
          <Text style={[styles.sortText, { color: Colors.primary }]}>Date Added</Text>
          <Ionicons name="swap-vertical-outline" size={16} color={Colors.primary} />
        </View>
      </View>

      {search.isLoading && <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />}

      <FlatList
        data={artistGroups}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        ItemSeparatorComponent={() => (
          <View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 52 + Spacing.md + Spacing.sm }} />
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Artist Options Sheet */}
      <Modal visible={sheetVisible} transparent animationType="slide" onRequestClose={() => setSheetVisible(false)} statusBarTranslucent>
        <Pressable style={[styles.backdrop, { backgroundColor: Colors.modalBackdrop }]} onPress={() => setSheetVisible(false)} />
        {selectedArtist && (
          <View style={[styles.sheet, { backgroundColor: Colors.sheetBg }]}>
            <View style={[styles.dragHandle, { backgroundColor: Colors.border }]} />
            <View style={styles.sheetHeader}>
              <ArtworkImage uri={getBestImageUrl(selectedArtist.image)} size={52} borderRadius={26} />
              <View style={{ marginLeft: Spacing.md }}>
                <Text style={[styles.sheetName, { color: Colors.textPrimary }]}>{selectedArtist.name}</Text>
                <Text style={[styles.sheetMeta, { color: Colors.textSecondary }]}>
                  1 Album | {selectedArtist.songs.length} Songs
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: Colors.border }]} />
            {[
              { icon: 'play-circle-outline', label: 'Play',                  action: handleViewArtist },
              { icon: 'play-skip-forward-outline', label: 'Play Next',       action: () => { selectedArtist.songs.forEach((s) => player.addToQueue(s)); setSheetVisible(false); } },
              { icon: 'list-outline', label: 'Add to Playing Queue',         action: () => { selectedArtist.songs.forEach((s) => player.addToQueue(s)); setSheetVisible(false); } },
              { icon: 'add-circle-outline', label: 'Add to Playlist',        action: () => setSheetVisible(false) },
              { icon: 'share-social-outline', label: 'Share',                action: () => setSheetVisible(false) },
            ].map((opt) => (
              <TouchableOpacity key={opt.label} style={styles.sheetOption} onPress={opt.action}>
                <Ionicons name={opt.icon as any} size={22} color={Colors.textPrimary} style={{ marginRight: Spacing.md, width: 28 }} />
                <Text style={[styles.sheetOptionText, { color: Colors.textPrimary }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Modal>
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
  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.semibold, marginBottom: 3 },
  meta: { fontSize: FontSize.xs + 1 },
  backdrop: { flex: 1 },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, paddingBottom: 32,
  },
  dragHandle: {
    width: 36, height: 4, borderRadius: 2, alignSelf: "center",
    marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  sheetName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  sheetMeta: { fontSize: FontSize.sm, marginTop: 2 },
  divider: { height: 1, marginVertical: Spacing.sm },
  sheetOption: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
  },
  sheetOptionText: { fontSize: FontSize.md },
});