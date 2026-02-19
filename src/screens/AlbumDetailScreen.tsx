import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  Song,
  getBestImageUrl,
  formatDuration,
} from '../types/song.types';
import { ArtworkImage } from '../components/ArtworkImage';
import { SongOptionsSheet } from '../components/SongOptionsSheet';
import { usePlayer } from '../hooks/usePlayer';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARTWORK_SIZE = SCREEN_WIDTH * 0.52;

interface Props {
  navigation: any;
  route: {
    params: {
      albumName: string;
      artist: string;
      songs: Song[];
      image: any[];
    };
  };
}

export function AlbumDetailScreen({ navigation, route }: Props) {
  const { albumName, artist, songs, image } = route.params;
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const player = usePlayer();
  const insets = useSafeAreaInsets();

  const handlePlay = useCallback(
    (startIndex = 0) => {
      if (songs.length) {
        player.playSong(songs, startIndex);
        navigation.navigate('Player');
      }
    },
    [songs, player, navigation],
  );

  const handleShuffle = useCallback(() => {
    if (!songs.length) return;
    const idx = Math.floor(Math.random() * songs.length);
    player.playSong(songs, idx);
    player.toggleShuffle();
    navigation.navigate('Player');
  }, [songs, player, navigation]);

  const totalDuration = songs.reduce((acc, s) => acc + (s.duration ?? 0), 0);
  const totalMins = formatDuration(totalDuration);
  const year = (songs[0] as any)?.year ?? '';

  const ListHeader = () => (
    <View style={styles.header}>
      {/* Artwork */}
      <ArtworkImage
        uri={getBestImageUrl(image)}
        size={ARTWORK_SIZE}
        borderRadius={BorderRadius.lg}
        style={styles.artwork}
      />

      {/* Name + meta */}
      <Text style={styles.albumName}>{albumName}</Text>
      <Text style={styles.albumMeta}>
        {artist}
        {year ? `  |  ${year}` : ''}
      </Text>
      <Text style={styles.albumMeta}>
        {songs.length} Songs{'  |  '}{totalMins} mins
      </Text>

      {/* Shuffle + Play */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.shuffleBtn} onPress={handleShuffle} activeOpacity={0.85}>
          <Ionicons name="shuffle-outline" size={18} color={Colors.textInverse} />
          <Text style={styles.shuffleBtnText}>Shuffle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={() => handlePlay(0)} activeOpacity={0.85}>
          <Ionicons name="play" size={18} color={Colors.primary} />
          <Text style={styles.playBtnText}>Play</Text>
        </TouchableOpacity>
      </View>

      {/* Songs header */}
      <View style={styles.songsSectionHeader}>
        <Text style={styles.songsSectionTitle}>Songs</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.xs }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="search-outline" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={songs}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={({ item, index }) => (
          <View style={styles.songRow}>
            <ArtworkImage uri={getBestImageUrl(item.image)} size={48} borderRadius={6} />
            <View style={styles.songInfo}>
              <Text
                style={[
                  styles.songName,
                  player.currentSong?.id === item.id && styles.songNamePlaying,
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text style={styles.songArtist} numberOfLines={1}>
                {item.primaryArtists}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.playIconBtn}
              onPress={() => handlePlay(index)}
            >
              <Ionicons
                name={player.currentSong?.id === item.id && player.isPlaying ? 'pause' : 'play'}
                size={16}
                color={Colors.textInverse}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.moreBtn}
              onPress={() => { setSelectedSong(item); setSheetVisible(true); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={ListHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

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
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: Spacing.xs },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  artwork: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  albumName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  albumMeta: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    gap: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  shuffleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.xs,
  },
  shuffleBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  playBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm + 4,
    gap: Spacing.xs,
    backgroundColor: Colors.background,
  },
  playBtnText: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.md,
  },
  songsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: Spacing.xs,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  songsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  songNamePlaying: { color: Colors.primary },
  songArtist: {
    fontSize: FontSize.xs + 1,
    color: Colors.textSecondary,
  },
  playIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  moreBtn: { padding: Spacing.xs },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: Spacing.md + 48 + Spacing.sm + 2,
  },
});