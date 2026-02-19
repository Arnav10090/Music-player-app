import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePlayer } from "../hooks/usePlayer";
import { ArtworkImage } from "../components/ArtworkImage";
import { SeekBar } from "../components/SeekBar";
import { SongOptionsSheet } from "../components/SongOptionsSheet";
import { getBestImageUrl } from "../types/song.types";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from "../constants/theme";

export function PlayerScreen({ navigation }: any) {
  const {
    currentSong,
    isPlaying,
    isLoading,
    position,
    duration,
    shuffleMode,
    repeatMode,
    togglePlayPause,
    seekTo,
    skipToNext,
    skipToPrevious,
    toggleShuffle,
    cycleRepeatMode,
    queue,
    currentIndex,
    addToQueue,
  } = usePlayer();
  const [sheetVisible, setSheetVisible] = useState(false);

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.emptyText}>No song playing</Text>
      </SafeAreaView>
    );
  }

  const repeatIcon = repeatMode === "one" ? "repeat" : "repeat-outline";
  const repeatColor =
    repeatMode !== "none" ? Colors.primary : Colors.textSecondary;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="ellipsis-horizontal-circle-outline"
            size={26}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Artwork */}
      <View style={styles.artworkContainer}>
        <ArtworkImage
          uri={getBestImageUrl(currentSong.image)}
          size={300}
          borderRadius={BorderRadius.xl}
        />
      </View>

      {/* Song info */}
      <View style={styles.songInfo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.songName} numberOfLines={1}>
            {currentSong.name}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {currentSong.primaryArtists}
          </Text>
        </View>
      </View>

      {/* Seek bar */}
      <SeekBar position={position} duration={duration} onSeek={seekTo} />

      {/* Main controls row: |< -10 ▶ +10 >| */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          onPress={skipToPrevious}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="play-skip-back"
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => seekTo(Math.max(0, position - 10))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="refresh-outline"
            size={28}
            color={Colors.textPrimary}
            style={{ transform: [{ scaleX: -1 }] }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={30}
            color={Colors.textInverse}
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => seekTo(Math.min(duration, position + 10))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="refresh-outline"
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={skipToNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="play-skip-forward"
            size={28}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>

      {/* Secondary controls: shuffle, timer, cast, more */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          onPress={toggleShuffle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="shuffle-outline"
            size={24}
            color={shuffleMode ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name="timer-outline"
            size={24}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="tv-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={cycleRepeatMode}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name={repeatIcon} size={24} color={repeatColor} />
        </TouchableOpacity>
      </View>

      {/* Lyrics button */}
      <TouchableOpacity
        style={styles.lyricsBtn}
        onPress={() => navigation.navigate("Queue")}
      >
        <Ionicons name="chevron-up" size={20} color={Colors.textSecondary} />
        <Text style={styles.lyricsText}>Lyrics</Text>
      </TouchableOpacity>

      <SongOptionsSheet
        song={currentSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => addToQueue(song)}
        onAddToQueue={(song) => addToQueue(song)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: { fontSize: FontSize.md, color: Colors.textSecondary },
  closeBtn: { position: "absolute", top: Spacing.lg, left: Spacing.md },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  artworkContainer: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    flex: 1,
    justifyContent: "center",
  },
  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  songName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  artistName: { fontSize: FontSize.md, color: Colors.textSecondary },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  lyricsBtn: { alignItems: "center", paddingBottom: Spacing.lg },
  lyricsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
});
