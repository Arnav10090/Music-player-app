import { create } from 'zustand';
import { Song, normalizeSearchSong } from '../types/song.types';
import { searchSongs } from '../api/searchApi';

interface SearchState {
  query: string;
  results: Song[];
  total: number;
  page: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
}

interface SearchActions {
  setQuery: (q: string) => void;
  search: (query: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearResults: () => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>((set, get) => ({
  query: '',
  results: [],
  total: 0,
  page: 1,
  isLoading: false,
  isLoadingMore: false,
  error: null,

  setQuery: (q) => set({ query: q }),

  search: async (query) => {
    if (!query.trim()) {
      set({ results: [], total: 0, page: 1, query: '' });
      return;
    }
    set({ isLoading: true, error: null, query, results: [], page: 1 });
    try {
      const data = await searchSongs(query, 1, 20);
      const songs = data.data.results.map(normalizeSearchSong);
      set({
        results: songs,
        total: data.data.total,
        page: 1,
        isLoading: false,
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  loadMore: async () => {
    const { query, results, total, page, isLoadingMore, isLoading } = get();
    if (isLoading || isLoadingMore || results.length >= total || !query) return;
    const nextPage = page + 1;
    set({ isLoadingMore: true });
    try {
      const data = await searchSongs(query, nextPage, 20);
      const newSongs = data.data.results.map(normalizeSearchSong);
      set({
        results: [...results, ...newSongs],
        page: nextPage,
        isLoadingMore: false,
      });
    } catch (e: any) {
      set({ error: e.message, isLoadingMore: false });
    }
  },

  clearResults: () => set({ results: [], query: '', total: 0, page: 1, error: null }),
}));