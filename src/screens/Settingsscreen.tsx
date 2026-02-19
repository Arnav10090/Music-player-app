import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColors } from "../hooks/useThemeColors";
import { useThemeStore } from "../store/themeStore";
import { Spacing, FontSize, FontWeight, BorderRadius } from "../constants/theme";

export function SettingsScreen() {
  const Colors = useThemeColors();
  const { isDark, toggleTheme } = useThemeStore();

  const staticSettings = [
    { icon: "musical-notes-outline", label: "Audio Quality", value: "320 kbps" },
    { icon: "download-outline", label: "Download Quality", value: "160 kbps" },
    { icon: "language-outline", label: "Language", value: "English" },
    { icon: "information-circle-outline", label: "About", value: "v1.0.0" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.background }]}>
      <Text style={[styles.header, { color: Colors.textPrimary }]}>Settings</Text>

      {/* Dark mode row — has a real Switch */}
      <TouchableOpacity
        style={[styles.row, { borderBottomColor: Colors.border }]}
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons
          name="moon-outline"
          size={22}
          color={Colors.primary}
          style={{ width: 32 }}
        />
        <Text style={[styles.label, { color: Colors.textPrimary }]}>Dark Mode</Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
        />
      </TouchableOpacity>

      {/* Static settings rows */}
      {staticSettings.map((item) => (
        <TouchableOpacity
          key={item.label}
          style={[styles.row, { borderBottomColor: Colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={item.icon as any}
            size={22}
            color={Colors.primary}
            style={{ width: 32 }}
          />
          <Text style={[styles.label, { color: Colors.textPrimary }]}>{item.label}</Text>
          <Text style={[styles.value, { color: Colors.textSecondary }]}>{item.value}</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
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
  },
  label: {
    flex: 1,
    fontSize: FontSize.md,
    marginLeft: Spacing.sm,
  },
  value: {
    fontSize: FontSize.sm,
    marginRight: Spacing.sm,
  },
});