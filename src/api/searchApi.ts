import apiClient from './client';
import { SearchSongsResponse, SearchAllResponse } from '../types/search.types';

// GET /api/search/songs
export async function searchSongs(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<SearchSongsResponse> {
  const response = await apiClient.get<SearchSongsResponse>('/api/search/songs', {
    params: { query, page, limit },
  });
  return response.data;
}

// GET /api/search
export async function searchAll(query: string): Promise<SearchAllResponse> {
  const response = await apiClient.get<SearchAllResponse>('/api/search', {
    params: { query },
  });
  return response.data;
}

// GET /api/search/artists
export async function searchArtists(query: string, page: number = 1): Promise<any> {
  const response = await apiClient.get('/api/search/artists', {
    params: { query, page },
  });
  return response.data;
}

// GET /api/search/albums
export async function searchAlbums(query: string, page: number = 1): Promise<any> {
  const response = await apiClient.get('/api/search/albums', {
    params: { query, page },
  });
  return response.data;
}