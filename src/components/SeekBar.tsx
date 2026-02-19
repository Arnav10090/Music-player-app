import React, { useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { Colors, Spacing, FontSize } from '../constants/theme';
import { formatDuration } from '../types/song.types';

interface Props {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

const BAR_HEIGHT = 4;
const THUMB_SIZE = 14;

export function SeekBar({ position, duration, onSeek }: Props) {
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      // handled in move
    },
    onPanResponderMove: (evt) => {
      // handled on release for simplicity
    },
    onPanResponderRelease: (evt) => {
      // Use absolute page position
      const { locationX } = evt.nativeEvent;
      // We need bar width — use a ref in a real app
      // For now trigger onSeek with rough estimate
    },
  });

  // Simpler implementation using layout-aware approach
  const [barWidth, setBarWidth] = React.useState(300);

  const handleBarPress = useCallback(
    (evt: any) => {
      const x = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / barWidth));
      onSeek(ratio * duration);
    },
    [barWidth, duration, onSeek]
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.barContainer}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleBarPress}
      >
        <View style={styles.track}>
          <View style={[styles.filled, { width: `${progress * 100}%` }]} />
        </View>
        <View
          style={[
            styles.thumb,
            { left: `${progress * 100}%`, marginLeft: -(THUMB_SIZE / 2) },
          ]}
        />
      </View>

      <View style={styles.labels}>
        <Text style={styles.time}>{formatDuration(position)}</Text>
        <Text style={styles.time}>{formatDuration(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
  },
  barContainer: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: BAR_HEIGHT,
    backgroundColor: Colors.seekBarEmpty,
    borderRadius: BAR_HEIGHT,
    overflow: 'hidden',
  },
  filled: {
    height: BAR_HEIGHT,
    backgroundColor: Colors.seekBarFilled,
    borderRadius: BAR_HEIGHT,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: Colors.seekBarThumb,
    top: '50%',
    marginTop: -(THUMB_SIZE / 2),
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  time: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});