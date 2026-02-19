import React, { useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, FlatList, StyleSheet, Dimensions, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSearch } from "../../hooks/useSearch";
import { usePlayer } from "../../hooks/usePlayer";
import { ArtworkImage } from "../../components/ArtworkImage";
import { Song, getBestImageUrl } from "../../types/song.types";
import { useThemeColors } from "../../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const RECENT_CARD_SIZE = (SCREEN_WIDTH - Spacing.md * 2 - Spacing.md * 2) / 3;

interface Props { navigation: any; onTabChange: (key: string) => void; }

export function SuggestedTab({ navigation, onTabChange }: Props) {
  const Colors = useThemeColors();
  const search = useSearch();
  const player = usePlayer();

  useEffect(() => {
    if (search.results.length === 0) search.search("top trending songs");
  }, []);

  const handlePlay = useCallback((index: number) => {
    player.playSong(search.results, index);
    navigation.navigate("Player");
  }, [search.results, player, navigation]);

  const recentlyPlayed = search.results.slice(0, 5);
  const artists = search.results.slice(5, 8);
  const mostPlayed = search.results.slice(8, 14);

  const renderMostPlayedItem = ({ item, index }: { item: Song; index: number }) => {
    const isPlaying = player.currentSong?.id === item.id;
    return (
      <TouchableOpacity style={styles.mostPlayedCard} onPress={() => handlePlay(index + 8)} activeOpacity={0.8}>
        <ArtworkImage uri={getBestImageUrl(item.image)} size={RECENT_CARD_SIZE + 20} borderRadius={BorderRadius.md} />
        <Text style={[styles.mostPlayedName, { color: Colors.textPrimary }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.mostPlayedArtist, { color: Colors.textSecondary }]} numberOfLines={1}>
          {item.primaryArtists}
        </Text>
      </TouchableOpacity>
    );
  };

  if (search.isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.background }]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: Colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Recently Played */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recently Played</Text>
          <TouchableOpacity onPress={() => onTabChange("songs")}>
            <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {recentlyPlayed.map((song, index) => (
            <TouchableOpacity key={`${song.id}-${index}`} style={styles.recentCard} onPress={() => handlePlay(index)} activeOpacity={0.8}>
              <ArtworkImage uri={getBestImageUrl(song.image)} size={RECENT_CARD_SIZE} borderRadius={BorderRadius.md} />
              <Text style={[styles.recentName, { color: Colors.textPrimary }]} numberOfLines={2}>{song.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Artists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Artists</Text>
          <TouchableOpacity onPress={() => onTabChange("artists")}>
            <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          {artists.map((song, index) => (
            <TouchableOpacity
              key={`${song.id}-${index}`}
              style={styles.artistCard}
              onPress={() => navigation.navigate("ArtistDetail", {
                artistName: song.primaryArtists,
                prefetchedSongs: search.results.filter((s) => s.primaryArtists === song.primaryArtists),
                prefetchedImage: getBestImageUrl(song.image),
              })}
              activeOpacity={0.8}
            >
              <ArtworkImage uri={getBestImageUrl(song.image)} size={80} borderRadius={40} />
              <Text style={[styles.artistName, { color: Colors.textPrimary }]} numberOfLines={1}>{song.primaryArtists}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Most Played */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Most Played</Text>
          <TouchableOpacity onPress={() => onTabChange("songs")}>
            <Text style={[styles.seeAll, { color: Colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={mostPlayed}
          horizontal
          keyExtractor={(item, i) => `${item.id}-${i}`}
          renderItem={renderMostPlayedItem}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  seeAll: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  horizontalScroll: { paddingHorizontal: Spacing.md, gap: Spacing.md },
  recentCard: { width: RECENT_CARD_SIZE, alignItems: "center" },
  recentName: { fontSize: FontSize.xs + 1, fontWeight: FontWeight.medium, textAlign: "center", marginTop: Spacing.xs, flexWrap: "wrap" },
  artistCard: { alignItems: "center", width: 80 },
  artistName: { fontSize: FontSize.xs + 1, fontWeight: FontWeight.medium, textAlign: "center", marginTop: Spacing.xs },
  mostPlayedCard: { width: RECENT_CARD_SIZE + 20, marginRight: 0 },
  mostPlayedName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, marginTop: Spacing.xs },
  mostPlayedArtist: { fontSize: FontSize.xs },
});