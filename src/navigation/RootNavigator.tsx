import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { QueueScreen } from '../screens/QueueScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ArtistDetailScreen } from '../screens/ArtistDetailScreen';
import { AlbumDetailScreen } from '../screens/AlbumDetailScreen';
import { FavoritesScreen } from '../screens/Favoritesscreen';
import { PlaylistsScreen } from '../screens/Playlistsscreen';
import { SettingsScreen } from '../screens/Settingsscreen';
import { Colors, FontSize, FontWeight } from '../constants/theme';
import { Song } from '../types/song.types';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
  Queue: undefined;
  Search: undefined;
  ArtistDetail: {
    artistId?: string;
    artistName: string;
    prefetchedSongs?: Song[];
    prefetchedImage?: string;
  };
  AlbumDetail: {
    albumName: string;
    artist: string;
    songs: Song[];
    image: any[];
  };
};

export type TabParamList = {
  Home: undefined;
  Favorites: undefined;
  Playlists: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

interface RootNavigatorProps {
  onRouteChange?: (routeName: string) => void;
}

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return <Ionicons name={name} size={24} color={focused ? Colors.primary : Colors.textSecondary} />;
}

function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'heart' : 'heart-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Playlists"
        component={PlaylistsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator({ onRouteChange }: RootNavigatorProps) {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        onStateChange={(state) => {
          if (!state || !onRouteChange) return;
          const getActiveRouteName = (navState: any): string => {
            if (!navState) return '';
            const route = navState.routes[navState.index];
            if (route.state) return getActiveRouteName(route.state);
            return route.name;
          };
          onRouteChange(getActiveRouteName(state));
        }}
      >
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen
            name="Player"
            component={PlayerScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Queue"
            component={QueueScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Search"
            component={SearchScreen}
            options={{ animation: 'fade' }}
          />
          <Stack.Screen
            name="ArtistDetail"
            component={ArtistDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="AlbumDetail"
            component={AlbumDetailScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
});