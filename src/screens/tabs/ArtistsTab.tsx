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
import { ArtworkImage } from "../../components/ArtworkImage";
import { Song, getBestImageUrl } from "../../types/song.types";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
} from "../../constants/theme";

interface ArtistGroup {
  name: string;
  songs: Song[];
  image: any[];
}

interface ArtistOptionSheetProps {
  artist: ArtistGroup | null;
  visible: boolean;
  onClose: () => void;
  onViewArtist: () => void;
  onPlayNext: () => void;
  onAddToQueue: () => void;
}

function ArtistOptionSheet({
  artist,
  visible,
  onClose,
  onViewArtist,
  onPlayNext,
  onAddToQueue,
}: ArtistOptionSheetProps) {
  if (!artist) return null;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.dragHandle} />
        <View style={styles.sheetHeader}>
          <ArtworkImage
            uri={getBestImageUrl(artist.image)}
            size={52}
            borderRadius={26}
          />
          <View style={{ marginLeft: Spacing.md }}>
            <Text style={styles.sheetName}>{artist.name}</Text>
            <Text style={styles.sheetMeta}>
              1 Album | {artist.songs.length} Songs
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        {[
          {
            icon: "play-circle-outline",
            label: "Play",
            action: () => { onViewArtist(); onClose(); },
          },
          {
            icon: "play-skip-forward-outline",
            label: "Play Next",
            action: () => { onPlayNext(); onClose(); },
          },
          {
            icon: "list-outline",
            label: "Add to Playing Queue",
            action: () => { onAddToQueue(); onClose(); },
          },
          {
            icon: "add-circle-outline",
            label: "Add to Playlist",
            action: onClose,
          },
          {
            icon: "share-social-outline",
            label: "Share",
            action: onClose,
          },
        ].map((opt) => (
          <TouchableOpacity
            key={opt.label}
            style={styles.sheetOption}
            onPress={opt.action}
          >
            <Ionicons
              name={opt.icon as any}
              size={22}
              color={Colors.textPrimary}
              style={{ marginRight: Spacing.md, width: 28 }}
            />
            <Text style={styles.sheetOptionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Modal>
  );
}

export function ArtistsTab({ navigation }: any) {
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

  const handleRowPress = useCallback((item: ArtistGroup) => {
    setSelectedArtist(item);
    setSheetVisible(true);
  }, []);

  // Navigate to ArtistDetailScreen with songs pre-loaded
  const handleViewArtist = useCallback(() => {
    if (!selectedArtist) return;
    navigation.navigate("ArtistDetail", {
      artistName: selectedArtist.name,
      prefetchedSongs: selectedArtist.songs,
      prefetchedImage: getBestImageUrl(selectedArtist.image),
    });
  }, [selectedArtist, navigation]);

  const renderItem = useCallback(
    ({ item }: { item: ArtistGroup }) => (
      <TouchableOpacity
        style={styles.row}
        onPress={() => handleRowPress(item)}
        activeOpacity={0.7}
      >
        <ArtworkImage
          uri={getBestImageUrl(item.image)}
          size={52}
          borderRadius={26}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.meta}>1 Album | {item.songs.length} Songs</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleRowPress(item)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={18}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleRowPress],
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.sortBar}>
        <Text style={styles.countText}>
          {artistGroups.length > 0 ? `${artistGroups.length} artists` : ""}
        </Text>
        <View style={styles.sortBtn}>
          <Text style={styles.sortText}>Date Added</Text>
          <Ionicons name="swap-vertical-outline" size={16} color={Colors.primary} />
        </View>
      </View>

      {search.isLoading && (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      )}

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

      <ArtistOptionSheet
        artist={selectedArtist}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onViewArtist={handleViewArtist}
        onPlayNext={() => selectedArtist?.songs.forEach((s) => player.addToQueue(s))}
        onAddToQueue={() => selectedArtist?.songs.forEach((s) => player.addToQueue(s))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sortBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  countText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  sortText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  info: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  name: { fontSize: FontSize.sm + 1, fontWeight: FontWeight.semibold, color: Colors.textPrimary, marginBottom: 3 },
  meta: { fontSize: FontSize.xs + 1, color: Colors.textSecondary },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  dragHandle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginTop: Spacing.sm, marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sheetName: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  sheetMeta: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  sheetOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  sheetOptionText: { fontSize: FontSize.md, color: Colors.textPrimary },
});