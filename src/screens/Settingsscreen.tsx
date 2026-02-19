import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  Spacing,
  FontSize,
  FontWeight,
  BorderRadius,
} from "../constants/theme";

const SETTINGS = [
  { icon: "musical-notes-outline", label: "Audio Quality", value: "320 kbps" },
  { icon: "download-outline", label: "Download Quality", value: "160 kbps" },
  { icon: "moon-outline", label: "Dark Mode", value: "Off" },
  { icon: "language-outline", label: "Language", value: "English" },
  { icon: "information-circle-outline", label: "About", value: "v1.0.0" },
];

export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      {SETTINGS.map((item, i) => (
        <TouchableOpacity
          key={item.label}
          style={styles.row}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={Colors.primary}
            style={{ width: 32 }}
          />
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.value}>{item.value}</Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  label: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginLeft: Spacing.sm,
  },
  value: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
});
