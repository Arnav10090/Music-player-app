import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";
import { FontSize, FontWeight } from "../constants/theme";

export function PlaylistsScreen() {
  const Colors = useThemeColors();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <View style={styles.content}>
        <Ionicons name="list-outline" size={64} color={Colors.textTertiary} />
        <Text style={[styles.title, { color: Colors.textPrimary }]}>No Playlists Yet</Text>
        <Text style={[styles.sub, { color: Colors.textSecondary }]}>Create a playlist to get started</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginTop: 16,
  },
  sub: { fontSize: FontSize.sm, marginTop: 8 },
});
