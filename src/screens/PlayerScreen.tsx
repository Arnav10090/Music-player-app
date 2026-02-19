import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ARTWORK_SIZE = SCREEN_WIDTH - Spacing.xl * 2;

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
    addToQueue,
  } = usePlayer();

  const [sheetVisible, setSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();

  if (!currentSong) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <TouchableOpacity
          style={styles.backBtn}
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
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.xs }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconBtn}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSheetVisible(true)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.iconBtn}
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
          size={ARTWORK_SIZE}
          borderRadius={BorderRadius.lg}
        />
      </View>

      {/* Song info */}
      <View style={styles.songInfo}>
        <Text style={styles.songName} numberOfLines={1}>
          {currentSong.name}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {currentSong.primaryArtists}
        </Text>
      </View>

      {/* Seek bar */}
      <View style={styles.seekBarWrapper}>
        <SeekBar position={position} duration={duration} onSeek={seekTo} />
      </View>

      {/* Main controls */}
      <View style={styles.mainControls}>
        <TouchableOpacity
          onPress={skipToPrevious}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-back" size={30} color={Colors.textPrimary} />
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

        <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause} activeOpacity={0.85}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={32}
            color={Colors.textInverse}
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => seekTo(Math.min(duration, position + 10))}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="refresh-outline" size={28} color={Colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={skipToNext}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="play-skip-forward" size={30} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Secondary controls */}
      <View style={styles.secondaryControls}>
        <TouchableOpacity
          onPress={toggleShuffle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.secondaryBtn}
        >
          <Ionicons
            name="shuffle-outline"
            size={24}
            color={shuffleMode ? Colors.primary : Colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.secondaryBtn}
        >
          <Ionicons name="timer-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.secondaryBtn}
        >
          <Ionicons name="tv-outline" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={cycleRepeatMode}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.secondaryBtn}
        >
          <Ionicons name={repeatIcon} size={24} color={repeatColor} />
        </TouchableOpacity>
      </View>

      {/* Lyrics button */}
      <TouchableOpacity
        style={styles.lyricsBtn}
        onPress={() => navigation.navigate("Queue")}
      >
        <Ionicons name="chevron-up" size={18} color={Colors.textSecondary} />
        <Text style={styles.lyricsText}>Lyrics</Text>
      </TouchableOpacity>

      <SongOptionsSheet
        song={currentSong}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPlayNext={(song) => addToQueue(song)}
        onAddToQueue={(song) => addToQueue(song)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  backBtn: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.md,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  artworkContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  songInfo: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  songName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  artistName: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  seekBarWrapper: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  mainControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
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
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  secondaryBtn: {
    padding: Spacing.sm,
  },
  lyricsBtn: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  lyricsText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
});