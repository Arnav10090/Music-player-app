import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { Spacing, FontSize } from '../constants/theme';
import { formatDuration } from '../types/song.types';

interface Props {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
}

const BAR_HEIGHT = 4;
const THUMB_SIZE = 14;

export function SeekBar({ position, duration, onSeek }: Props) {
  const Colors = useThemeColors();
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;
  const [barWidth, setBarWidth] = React.useState(300);

  const handleBarPress = useCallback(
    (evt: any) => {
      const x = evt.nativeEvent.locationX;
      const ratio = Math.max(0, Math.min(1, x / barWidth));
      onSeek(ratio * duration);
    },
    [barWidth, duration, onSeek],
  );

  return (
    <View style={styles.container}>
      <View
        style={styles.barContainer}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onResponderRelease={handleBarPress}
      >
        <View style={[styles.track, { backgroundColor: Colors.seekBarEmpty }]}>
          <View style={[styles.filled, {
            width: `${progress * 100}%`,
            backgroundColor: Colors.seekBarFilled,
          }]} />
        </View>
        <View style={[styles.thumb, {
          left: `${progress * 100}%`,
          marginLeft: -(THUMB_SIZE / 2),
          backgroundColor: Colors.seekBarThumb,
        }]} />
      </View>

      <View style={styles.labels}>
        <Text style={[styles.time, { color: Colors.textSecondary }]}>
          {formatDuration(position)}
        </Text>
        <Text style={[styles.time, { color: Colors.textSecondary }]}>
          {formatDuration(duration)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.md },
  barContainer: {
    height: THUMB_SIZE + 8,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT,
    overflow: 'hidden',
  },
  filled: {
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: '50%',
    marginTop: -(THUMB_SIZE / 2),
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  time: { fontSize: FontSize.xs },
});