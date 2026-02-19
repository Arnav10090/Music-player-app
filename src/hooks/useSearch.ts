import { useCallback, useRef } from 'react';
import { useSearchStore } from '../store/searchStore';

/**
 * useSearch — debounced search with pagination.
 * Debounce prevents hammering the API on every keystroke.
 */
export function useSearch() {
  const store = useSearchStore();
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      store.setQuery(query);
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (!query.trim()) {
        store.clearResults();
        return;
      }
      debounceTimer.current = setTimeout(() => {
        store.search(query);
      }, 400);
    },
    [store]
  );

  return {
    query: store.query,
    results: store.results,
    total: store.total,
    isLoading: store.isLoading,
    isLoadingMore: store.isLoadingMore,
    error: store.error,
    search: debouncedSearch,
    loadMore: store.loadMore,
    clearResults: store.clearResults,
  };
}