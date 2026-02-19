import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

interface Props {
  navigation: any;
  onTabChange: (tab: string) => void;
}

export function SuggestedTab({ navigation, onTabChange }: Props) {
  const { queue, currentSong, playSong } = usePlayer();
  const recent = queue.slice(0, 9);

  const handlePlay = (songs: Song[], index: number) => {
    playSong(songs, index);
    navigation.navigate("Player");
  };

  if (recent.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons
          name="musical-notes-outline"
          size={64}
          color={Colors.textTertiary}
        />
        <Text style={styles.emptyTitle}>Nothing here yet</Text>
        <Text style={styles.emptySubtitle}>
          Search for songs and start listening
        </Text>
        <TouchableOpacity
          style={styles.browseBtn}
          onPress={() => onTabChange("songs")}
        >
          <Text style={styles.browseBtnText}>Browse Songs</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recentSongs = recent.slice(0, 6);
  const artists = Array.from(
    new Map(recent.map((s) => [s.primaryArtists, s])).values(),
  ).slice(0, 5);
  const mostPlayed = [...recent].reverse().slice(0, 6);

  const SongCard = ({
    song,
    songs,
    index,
  }: {
    song: Song;
    songs: Song[];
    index: number;
  }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePlay(songs, index)}
      activeOpacity={0.8}
    >
      <ArtworkImage
        uri={getBestImageUrl(song.image)}
        size={100}
        borderRadius={BorderRadius.md}
      />
      <Text style={styles.cardName} numberOfLines={2}>
        {song.name}
      </Text>
      <Text style={styles.cardArtist} numberOfLines={1}>
        {song.primaryArtists}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {/* Recently Played */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recently Played</Text>
          <TouchableOpacity onPress={() => onTabChange("songs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.md }}
        >
          {recentSongs.map((song, i) => (
            <SongCard
              key={`rp-${i}`}
              song={song}
              songs={recentSongs}
              index={i}
            />
          ))}
        </ScrollView>
      </View>

      {/* Artists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artists</Text>
          <TouchableOpacity onPress={() => onTabChange("artists")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.md }}
        >
          {artists.map((song, i) => (
            <TouchableOpacity
              key={`ar-${i}`}
              style={styles.artistCard}
              onPress={() => handlePlay([song], 0)}
              activeOpacity={0.8}
            >
              <ArtworkImage
                uri={getBestImageUrl(song.image)}
                size={80}
                borderRadius={40}
              />
              <Text style={styles.artistName} numberOfLines={1}>
                {song.primaryArtists}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Most Played */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Most Played</Text>
          <TouchableOpacity onPress={() => onTabChange("songs")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.md }}
        >
          {mostPlayed.map((song, i) => (
            <SongCard
              key={`mp-${i}`}
              song={song}
              songs={mostPlayed}
              index={i}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
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
    textAlign: "center",
  },
  browseBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  browseBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  card: { width: 110, marginRight: Spacing.md },
  cardName: {
    fontSize: FontSize.xs + 1,
    fontWeight: FontWeight.medium,
    color: Colors.textPrimary,
    marginTop: Spacing.xs + 2,
  },
  cardArtist: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  artistCard: { alignItems: "center", width: 90, marginRight: Spacing.md },
  artistName: {
    fontSize: FontSize.xs + 1,
    color: Colors.textPrimary,
    marginTop: Spacing.xs + 2,
    textAlign: "center",
  },
});
