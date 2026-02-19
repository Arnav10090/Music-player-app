import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Colors, Spacing, FontSize, FontWeight } from "../constants/theme";

interface Tab {
  key: string;
  label: string;
}
interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function TopTabs({ tabs, activeTab, onTabChange }: Props) {
  return (
    <View style={styles.wrapper}>
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
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
              {isActive && <View style={styles.indicator} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View style={styles.border} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: Colors.background },
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
    color: Colors.textSecondary,
    paddingBottom: 6,
  },
  labelActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  indicator: {
    position: "absolute",
    bottom: 0,
    left: Spacing.md,
    right: Spacing.md,
    height: 2,
    backgroundColor: Colors.primary,
    borderRadius: 1,
  },
  border: { height: 1, backgroundColor: Colors.border },
});
