import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, FontSize, FontWeight } from "../constants/theme";

export function PlaylistsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="list-outline" size={64} color={Colors.textTertiary} />
        <Text style={styles.title}>No Playlists Yet</Text>
        <Text style={styles.sub}>Create a playlist to get started</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: Colors.textPrimary,
    marginTop: 16,
  },
  sub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 8 },
});
