import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useThemeColors } from "../hooks/useThemeColors";
import { Spacing, FontSize, FontWeight } from "../constants/theme";

interface Tab { key: string; label: string; }
interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TopTabs({ tabs, activeTab, onTabChange }: Props) {
  const Colors = useThemeColors();

  return (
    <View style={[styles.wrapper, { backgroundColor: Colors.background }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.label,
                { color: isActive ? Colors.primary : Colors.textSecondary },
                isActive && styles.labelActive,
              ]}>
                {tab.label}
              </Text>
              {isActive && (
                <View style={[styles.indicator, { backgroundColor: Colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={[styles.border, { backgroundColor: Colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {},
  container: { paddingHorizontal: Spacing.sm },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    alignItems: "center",
    position: "relative",
  },
  label: {
    fontSize: FontSize.sm + 1,
    fontWeight: FontWeight.medium,
    paddingBottom: 6,
  },
  labelActive: { fontWeight: FontWeight.semibold },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    height: 2,
    borderRadius: 1,
  },
  border: { height: 1 },
});