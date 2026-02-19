import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song } from '../types/song.types';

const FAVORITES_KEY = '@mume/favorites';

interface FavoritesState {
  favorites: Song[];
  isLoaded: boolean;
}

interface FavoritesActions {
  loadFavorites: () => Promise<void>;
  toggleFavorite: (song: Song) => Promise<void>;
  isFavorite: (songId: string) => boolean;
}

type FavoritesStore = FavoritesState & FavoritesActions;

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favorites: [],
  isLoaded: false,

  loadFavorites: async () => {
    try {
      const raw = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites: Song[] = raw ? JSON.parse(raw) : [];
      set({ favorites, isLoaded: true });
    } catch {
      set({ favorites: [], isLoaded: true });
    }
  },

  toggleFavorite: async (song: Song) => {
    const { favorites } = get();
    const exists = favorites.some((s) => s.id === song.id);
    const updated = exists
      ? favorites.filter((s) => s.id !== song.id)
      : [song, ...favorites];
    set({ favorites: updated });
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // revert on failure
      set({ favorites });
    }
  },

  isFavorite: (songId: string) => {
    return get().favorites.some((s) => s.id === songId);
  },
}));