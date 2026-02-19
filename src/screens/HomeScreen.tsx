import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopTabs } from '../components/TopTabs';
import { SuggestedTab } from './tabs/SuggestedTab';
import { SongsTab } from './tabs/SongsTab';
import { ArtistsTab } from './tabs/ArtistsTab';
import { AlbumsTab } from './tabs/AlbumsTab';
import { Colors, Spacing, FontSize, FontWeight } from '../constants/theme';

const TABS = [
  { key: 'suggested', label: 'Suggested' },
  { key: 'songs', label: 'Songs' },
  { key: 'artists', label: 'Artists' },
  { key: 'albums', label: 'Albums' },
];

export function HomeScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState('suggested');

  const handleTabChange = useCallback((key: string) => setActiveTab(key), []);

  const renderTab = () => {
    switch (activeTab) {
      case 'suggested': return <SuggestedTab navigation={navigation} onTabChange={handleTabChange} />;
      case 'songs': return <SongsTab navigation={navigation} />;
      case 'artists': return <ArtistsTab navigation={navigation} />;
      case 'albums': return <AlbumsTab navigation={navigation} />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="musical-notes" size={26} color={Colors.primary} />
          <Text style={styles.appName}>Mume</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons name="search-outline" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <TopTabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      <View style={{ flex: 1 }}>
        {renderTab()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  appName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textPrimary,
    marginLeft: Spacing.xs + 2,
  },
});