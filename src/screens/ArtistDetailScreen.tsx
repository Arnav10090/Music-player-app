import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getArtistById, getArtistSongs } from '../api/artistsApi';
import { Artist } from '../types/artist.types';
import { Song, normalizeSongDetail, getBestImageUrl, decodeHtml } from '../types/song.types';
import { ArtworkImage } from '../components/ArtworkImage';
import { SongListItem } from '../components/SongListItem';
import { SongOptionsSheet } from '../components/SongOptionsSheet';
import { usePlayer } from '../hooks/usePlayer';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

interface Props {
  navigation: any;
  route: { params: { artistId: string; artistName: string } };
}

/**
 * ArtistDetailScreen — matches Figma screen 14
 * Shows artist image, name, Shuffle + Play buttons, and song list
 */
export function ArtistDetailScreen({ navigation, route }: Props) {
  const { artistId, artistName } = route.params;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const player = usePlayer();

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [artistData, songsData] = await Promise.all([
          getArtistById(artistId),
          getArtistSongs(artistId, 1),
        ]);
        setArtist(artistData);
        setSongs(songsData.songs.map(normalizeSongDetail));
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [artistId]);

  const handlePlay = useCallback(
    (startIndex = 0) => {
      if (songs.length) player.playSong(songs, startIndex);
    },
    [songs, player]
  );

  const handleShuffle = useCallback(() => {
    if (!songs.length) return;
    const idx = Math.floor(Math.random() * songs.length);
    player.playSong(songs, idx);
    player.toggleShuffle();
  }, [songs, player]);

  const handleMorePress = useCallback((song: Song) => {
    setSelectedSong(song);
    setSheetVisible(true);
  }, []);

  const artistImage = artist?.image ? getBestImageUrl(artist.image) : '';
  const displayName = artist ? decodeHtml(artist.name) : artistName;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Ionicons name="cloud-offline-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ListHeader = () => (
    <View>
      {/* Artist Hero */}
      <View style={styles.hero}>
        <ArtworkImage
          uri={artistImage}
          size={160}
          borderRadius={80}
          style={styles.artistImage}
        />
        <Text style={styles.artistName}>{displayName}</Text>

        {artist && (
          <Text style={styles.artistMeta}>
            {songs.length} Songs
          </Text>
        )}

        {/* Shuffle + Play buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle}>
            <Ionicons name="shuffle-outline" size={18} color={Colors.primary} />
            <Text style={styles.shuffleBtnText}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playBtn} onPress={() => handlePlay(0)}>
            <Ionicons name="play" size={18} color={Colors.textInverse} />
            <Text style={styles.playBtnText}>Play</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Songs header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Songs</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SongListItem
            song={item}
            onPress={() => handlePlay(index)}
            onMorePress={() => handleMorePress(item)}
            isPlaying={player.currentSong?.id === item.id && player.isPlaying}
          />
        )}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

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
  centered: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  artistImage: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  artistName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  artistMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  shuffleBtnText: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  playBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16 + 48 + 12,
  },
  errorText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  backBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
  },
});