import React, { useState } from 'react';
import { Image, View, StyleSheet, ImageStyle, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../constants/theme';

interface Props {
  uri: string;
  size: number;
  style?: ImageStyle;
  borderRadius?: number;
}

export function ArtworkImage({ uri, size, style, borderRadius = BorderRadius.md }: Props) {
  const [errored, setErrored] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius },
      ]}
    >
      {uri && !errored ? (
        <Image
          source={{ uri }}
          style={[{ width: size, height: size, borderRadius }, style]}
          resizeMode="cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.backgroundSecondary,
  },
  placeholder: {
    backgroundColor: Colors.border,
  },
});