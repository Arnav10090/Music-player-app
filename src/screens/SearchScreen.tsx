import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import {
  Song,
  getBestImageUrl,
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
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const player = usePlayer();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    AsyncStorage.getItem(RECENT_KEY).then((raw) => {
      if (raw) setRecentSearches(JSON.parse(raw));
    });
    return () => clearTimeout(t);
  }, []);

  const saveRecent = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      const updated = [
        trimmed,
        ...recentSearches.filter((r) => r !== trimmed),
      ].slice(0, 10);
      setRecentSearches(updated);
      await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    },
    [recentSearches],
  );

  const clearAllRecent = useCallback(async () => {
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

  const clearQuery = useCallback(() => {
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }, []);

  const showResults = query.trim().length > 0;
  const notFound = showResults && !isLoading && results.length === 0;

  const renderSongItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => (
      <TouchableOpacity
        style={styles.songRow}
        onPress={() => handleSongPress(item, index)}
        activeOpacity={0.7}
      >
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
          style={styles.playCircleBtn}
          onPress={() => handleSongPress(item, index)}
        >
          <Ionicons name="play" size={16} color={Colors.textInverse} />
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
      </TouchableOpacity>
    ),
    [handleSongPress],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <View style={styles.searchBarRow}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View
          style={[
            styles.inputWrapper,
            isFocused && styles.inputWrapperFocused,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isFocused ? Colors.primary : Colors.textSecondary}
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
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={() => {
              if (query.trim()) saveRecent(query);
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={clearQuery}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter chips ───────────────────────────────────────────────────────
           Key fix: wrapped in a plain <View style={filterContainer}> with a
           fixed height. This is the reliable way to pin chips on Android —
           putting height on the ScrollView itself is ignored in column flex.   */}
      {showResults && (
        <View style={styles.filterContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            keyboardShouldPersistTaps="handled"
          >
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
          </ScrollView>
        </View>
      )}

      {/* ── Recent searches (only when no query typed) ────────────────────── */}
      {!showResults && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Recent Searches</Text>
            <TouchableOpacity onPress={clearAllRecent}>
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
                <Ionicons name="close" size={18} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* ── Content area ───────────────────────────────────────────────────────
           flex:1 here is the ONLY stretching element in the tree.
           Search bar = natural height, chips = fixed 56px, this = everything else.
           Result: chips never move regardless of what's rendered below.         */}
      <View style={styles.contentArea}>

        {isLoading && (
          <ActivityIndicator color={Colors.primary} style={styles.loader} />
        )}

        {notFound && (
          <View style={styles.notFound}>
            <Text style={styles.notFoundEmoji}>😞</Text>
            <Text style={styles.notFoundTitle}>Not Found</Text>
            <Text style={styles.notFoundSub}>
              Sorry, the keyword you entered cannot be found, please check
              again or search with another keyword.
            </Text>
          </View>
        )}

        {showResults && !isLoading && results.length > 0 && (
          <FlatList
            data={results}
            keyExtractor={(item, i) => `${item.id}-${i}`}
            renderItem={renderSongItem}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        )}

      </View>

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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF5F0",
  },
  input: {
    flex: 1,
    fontSize: FontSize.sm + 1,
    color: Colors.textPrimary,
    padding: 0,
  },

  // ── Filter chips ──────────────────────────────────────────────────────────
  // Plain View with fixed height — the only reliable way to constrain a
  // horizontal ScrollView inside a column flex parent on Android.
  filterContainer: {
    height: 56,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: "center",
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
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

  // ── Recent searches ───────────────────────────────────────────────────────
  // No flex — natural height only, never competes with contentArea
  recentContainer: {
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
    paddingVertical: Spacing.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recentItem: {
    fontSize: FontSize.md,
    color: Colors.textPrimary,
  },

  // ── Content area ──────────────────────────────────────────────────────────
  // Sole flex:1 consumer — absorbs all remaining vertical space.
  contentArea: {
    flex: 1,
  },
  loader: {
    marginTop: 48,
  },

  // ── Not found ─────────────────────────────────────────────────────────────
  // No flex:1 — centered via paddingTop so it can't push chips upward
  notFound: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
  },
  notFoundEmoji: {
    fontSize: 72,
  },
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
    lineHeight: 21,
  },

  // ── Song rows ─────────────────────────────────────────────────────────────
  songRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
  },
  songInfo: {
    flex: 1,
    marginLeft: Spacing.sm + 2,
    marginRight: Spacing.sm,
  },
  songName: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  songMeta: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
  },
  playCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  moreBtn: {
    padding: Spacing.xs,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 52 + Spacing.sm + 2,
  },
});