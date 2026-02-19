import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
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
  BorderRadius,
} from "../../constants/theme";

interface AlbumGroup {
  id: string;
  name: string;
  artist: string;
  songs: Song[];
  image: any[];
}

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - Spacing.md * 3) / 2;

export function AlbumsTab({ navigation }: any) {
  const search = useSearch();
  const player = usePlayer();

  useEffect(() => {
    if (search.results.length === 0) search.search("top hindi songs");
  }, []);

  const albumGroups: AlbumGroup[] = Object.values(
    search.results.reduce((acc: Record<string, AlbumGroup>, song) => {
      const key = song.album.id || `${song.album.name}__${song.primaryArtists}`;
      if (!acc[key])
        acc[key] = {
          id: key,
          name: song.album.name,
          artist: song.primaryArtists,
          songs: [],
          image: song.image,
        };
      acc[key].songs.push(song);
      return acc;
    }, {}),
  );

  const renderItem = ({ item }: { item: AlbumGroup }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        // Navigate to AlbumDetail instead of playing directly
        navigation.navigate("AlbumDetail", {
          albumName: item.name,
          artist: item.artist,
          songs: item.songs,
          image: item.image,
        });
      }}
      activeOpacity={0.8}
    >
      <ArtworkImage
        uri={getBestImageUrl(item.image)}
        size={CARD_SIZE}
        borderRadius={BorderRadius.md}
      />
      <View style={styles.cardFooter}>
        <View style={{ flex: 1 }}>
          <Text style={styles.albumName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.albumMeta} numberOfLines={1}>
            {item.artist} | {item.songs.length} songs
          </Text>
        </View>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => {
            navigation.navigate("AlbumDetail", {
              albumName: item.name,
              artist: item.artist,
              songs: item.songs,
              image: item.image,
            });
          }}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={16}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <View style={styles.sortBar}>
        <Text style={styles.countText}>
          {albumGroups.length > 0 ? `${albumGroups.length} albums` : ""}
        </Text>
        <View style={styles.sortBtn}>
          <Text style={styles.sortText}>Date Modified</Text>
          <Ionicons
            name="swap-vertical-outline"
            size={16}
            color={Colors.primary}
          />
        </View>
      </View>
      {search.isLoading && (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      )}
      <FlatList
        data={albumGroups}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
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
  sortText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  grid: { paddingHorizontal: Spacing.md, paddingBottom: 120 },
  row: { justifyContent: "space-between", marginBottom: Spacing.md },
  card: { width: CARD_SIZE },
  cardFooter: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: Spacing.xs + 2,
  },
  albumName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
  },
  albumMeta: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});