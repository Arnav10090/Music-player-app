import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import {
  Song,
  getBestImageUrl,
  formatDuration,
  normalizeSearchSong,
} from "../types/song.types";
import { searchSongs } from "../api/searchApi";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from "../constants/theme";

const RECENT_KEY = "@mume/recent_searches";
const FILTER_TABS = ["Songs", "Artists", "Albums", "Folders"];

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Songs");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const player = usePlayer();

  useEffect(() => {
    inputRef.current?.focus();
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) setRecentSearches(JSON.parse(raw));
    });
  }, []);

  const saveRecent = useCallback(
    async (q: string) => {
      const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(
        0,
        10,
      );
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  const clearRecent = useCallback(async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(RECENT_KEY);
  }, []);

  const removeRecent = useCallback(
    async (item: string) => {
      const updated = recentSearches.filter((r) => r !== item);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await searchSongs(q, 1, 20);
      const songs = data.data.results.map(normalizeSearchSong);
      const seen = new Set<string>();
      setResults(
        songs.filter((s) => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        }),
      );
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = useCallback(
    (text: string) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => doSearch(text), 400);
    },
    [doSearch],
  );

  const handleRecentPress = useCallback(
    (q: string) => {
      setQuery(q);
      doSearch(q);
    },
    [doSearch],
  );

  const handleSongPress = useCallback(
    (song: Song, index: number) => {
      saveRecent(query);
      player.playSong(results, index);
      navigation.navigate("Player");
    },
    [results, query, player, saveRecent, navigation],
  );

  const showResults = query.trim().length > 0;
  const notFound = showResults && !isLoading && results.length === 0;

  const renderSongItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => (
      <View style={styles.songRow}>
        <ArtworkImage
          uri={getBestImageUrl(item.image)}
          size={52}
          borderRadius={6}
        />
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.songMeta} numberOfLines={1}>
            {item.primaryArtists}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playBtn}
          onPress={() => handleSongPress(item, index)}
        >
          <Ionicons name="play" size={18} color={Colors.textInverse} />
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
    ),
    [handleSongPress],
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.primary}
            style={{ marginRight: Spacing.sm }}
          />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={handleChangeText}
            placeholder="Search songs, artists..."
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (query.trim()) saveRecent(query);
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setQuery("");
                setResults([]);
              }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter tabs (shown when typing) */}
      {showResults && (
        <View style={styles.filterRow}>
          {FILTER_TABS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterChip,
                activeFilter === f && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent searches (no query) */}
      {!showResults && (
        <View style={styles.recentContainer}>
          {recentSearches.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={styles.recentTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecent}>
                  <Text style={styles.clearAll}>Clear All</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map((item) => (
                <View key={item} style={styles.recentRow}>
                  <TouchableOpacity
                    style={{ flex: 1 }}
                    onPress={() => handleRecentPress(item)}
                  >
                    <Text style={styles.recentItem}>{item}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeRecent(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name="close"
                      size={18}
                      color={Colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      )}

      {/* Not found */}
      {notFound && (
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>😞</Text>
          <Text style={styles.notFoundTitle}>Not Found</Text>
          <Text style={styles.notFoundSub}>
            Sorry, the keyword you entered cannot be found, please check again
            or search with another keyword.
          </Text>
        </View>
      )}

      {/* Results */}
      {showResults && !isLoading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={renderSongItem}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  container: { flex: 1, backgroundColor: Colors.background },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm + 1,
    color: Colors.textPrimary,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  filterTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
  },
  recentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  recentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  recentTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  clearAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentItem: { fontSize: FontSize.md, color: Colors.textPrimary },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingBottom: 80,
  },
  notFoundEmoji: { fontSize: 64 },
  notFoundTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  notFoundSub: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: "center",
    lineHeight: 20,
  },
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  songInfo: { flex: 1, marginLeft: Spacing.sm + 2, marginRight: Spacing.sm },
  songName: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  songMeta: { fontSize: FontSize.xs + 1, color: Colors.textSecondary },
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
});
