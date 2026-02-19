import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSearch } from '../hooks/useSearch';
import { usePlayer } from '../hooks/usePlayer';
import { SearchBar } from '../components/SearchBar';
import { SongListItem } from '../components/SongListItem';
import { Song, normalizeSearchSong } from '../types/song.types';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';
import { searchSongs } from '../api/searchApi';

/**
 * HomeScreen
 * - Displays a searchable, paginated list of songs
 * - Default query on mount: "arijit" (popular Hindi artist to seed the list)
 * - Search updates in real time (debounced 400ms)
 * - Pagination: loads more on scroll end
 */
export function HomeScreen({ navigation }: any) {
  const search = useSearch();
  const player = usePlayer();

  // Load default songs on mount
  useEffect(() => {
    search.search('top hindi songs');
  }, []);

  const handleSongPress = useCallback(
    (song: Song, index: number) => {
      player.playSong(search.results, index);
      player.setPlayerVisible(true);
    },
    [search.results, player]
  );

  const handleMorePress = useCallback(
    (song: Song) => {
      // Show action sheet — simplified to addToQueue inline
      player.addToQueue(song);
    },
    [player]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Song; index: number }) => (
      <SongListItem
        song={item}
        onPress={() => handleSongPress(item, index)}
        onMorePress={() => handleMorePress(item)}
        isPlaying={player.currentSong?.id === item.id && player.isPlaying}
      />
    ),
    [player.currentSong, player.isPlaying, handleSongPress, handleMorePress]
  );

  const renderFooter = useCallback(() => {
    if (!search.isLoadingMore) return <View style={{ height: 16 }} />;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }, [search.isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (search.isLoading) return null;
    return (
      <View style={styles.empty}>
        {search.error ? (
          <>
            <Ionicons name="cloud-offline-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{search.error}</Text>
          </>
        ) : search.query ? (
          <>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>
              Try a different search term
            </Text>
          </>
        ) : null}
      </View>
    );
  }, [search.isLoading, search.error, search.query]);

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="musical-notes" size={28} color={Colors.primary} />
          <Text style={styles.appName}>Mume</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <SearchBar
        value={search.query}
        onChangeText={search.search}
        onClear={search.clearResults}
      />

      {/* Results label */}
      {search.total > 0 && (
        <Text style={styles.resultCount}>
          {search.total.toLocaleString()} songs
        </Text>
      )}

      {/* Loading spinner for initial load */}
      {search.isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}

      {/* Song list */}
      <FlatList
        data={search.results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={search.loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={search.results.length === 0 ? styles.listEmpty : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  resultCount: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16 + 48 + 12, // indent past artwork
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  listEmpty: {
    flexGrow: 1,
  },
});