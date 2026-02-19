import React from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../constants/theme';

interface Props {
  isPlaying: boolean;
  isLoading: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  // BONUS
  shuffleMode?: boolean;
  repeatMode?: 'none' | 'one' | 'all';
  onShuffle?: () => void;
  onRepeat?: () => void;
}

export function PlayerControls({
  isPlaying,
  isLoading,
  onPlayPause,
  onNext,
  onPrevious,
  shuffleMode = false,
  repeatMode = 'none',
  onShuffle,
  onRepeat,
}: Props) {
  const repeatIcon =
    repeatMode === 'one' ? 'repeat-sharp' : 'repeat-outline';
  const repeatColor =
    repeatMode !== 'none' ? Colors.primary : Colors.textSecondary;

  return (
    <View style={styles.container}>
      {/* BONUS: Shuffle button */}
      <TouchableOpacity onPress={onShuffle} style={styles.sideBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons
          name="shuffle-outline"
          size={24}
          color={shuffleMode ? Colors.primary : Colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Previous */}
      <TouchableOpacity onPress={onPrevious} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="play-skip-back" size={32} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* Play / Pause (large orange circle) */}
      <TouchableOpacity style={styles.playBtn} onPress={onPlayPause} activeOpacity={0.85}>
        {isLoading ? (
          <ActivityIndicator color={Colors.textInverse} size="small" />
        ) : (
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={30}
            color={Colors.textInverse}
            style={isPlaying ? undefined : { marginLeft: 3 }}
          />
        )}
      </TouchableOpacity>

      {/* Next */}
      <TouchableOpacity onPress={onNext} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="play-skip-forward" size={32} color={Colors.textPrimary} />
      </TouchableOpacity>

      {/* BONUS: Repeat button */}
      <TouchableOpacity onPress={onRepeat} style={styles.sideBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name={repeatIcon} size={24} color={repeatColor} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  skipBtn: {
    padding: Spacing.sm,
  },
  sideBtn: {
    padding: Spacing.sm,
  },
});