import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@mume/dark_mode';

interface ThemeState {
  isDark: boolean;
  isLoaded: boolean;
}
interface ThemeActions {
  loadTheme: () => Promise<void>;
  toggleTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState & ThemeActions>((set, get) => ({
  isDark: false,
  isLoaded: false,

  loadTheme: async () => {
    try {
      const raw = await AsyncStorage.getItem(THEME_KEY);
      set({ isDark: raw === 'true', isLoaded: true });
    } catch {
      set({ isLoaded: true });
    }
  },

  toggleTheme: async () => {
    const next = !get().isDark;
    set({ isDark: next });
    await AsyncStorage.setItem(THEME_KEY, String(next));
  },
}));