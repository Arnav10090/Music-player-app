import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { PlayerScreen } from '../screens/PlayerScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ArtistDetailScreen } from '../screens/ArtistDetailScreen';
import { AlbumDetailScreen } from '../screens/AlbumDetailScreen';
import { FavoritesScreen } from '../screens/Favoritesscreen';
import { PlaylistsScreen } from '../screens/Playlistsscreen';
import { SettingsScreen } from '../screens/Settingsscreen';
import { useThemeColors } from '../hooks/useThemeColors';
import { FontSize, FontWeight } from '../constants/theme';
import { Song } from '../types/song.types';

export type RootStackParamList = {
  MainTabs: undefined;
  Player: undefined;
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

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

interface Props { onRouteChange?: (routeName: string) => void; }

function BottomTabs() {
  const Colors = useThemeColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.tabBarBorder,
          backgroundColor: Colors.tabBarBg,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Playlists" component={PlaylistsScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen}
        options={{ tabBarIcon: ({ focused, color }) => <Ionicons name={focused ? 'settings' : 'settings-outline'} size={24} color={color} /> }} />
    </Tab.Navigator>
  );
}

export function RootNavigator({ onRouteChange }: Props) {
  const Colors = useThemeColors();

  const getActiveRouteName = (state: any): string => {
    if (!state) return '';
    const route = state.routes[state.index];
    if (route.state) return getActiveRouteName(route.state);
    return route.name;
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer
        onStateChange={(state) => {
          if (state && onRouteChange) onRouteChange(getActiveRouteName(state));
        }}
      >
        <Stack.Navigator
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}
        >
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="Player" component={PlayerScreen}
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="ArtistDetail" component={ArtistDetailScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} options={{ animation: 'slide_from_right' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}