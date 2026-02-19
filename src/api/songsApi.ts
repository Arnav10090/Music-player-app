import apiClient from './client';
import { SongDetail } from '../types/song.types';

interface SongDetailResponse {
  success: boolean;
  data: SongDetail[];
}

interface SongSuggestionsResponse {
  status: string;
  data: SongDetail[];
}

// GET /api/songs/{id}
export async function getSongById(id: string): Promise<SongDetail | null> {
  const response = await apiClient.get<SongDetailResponse>(`/api/songs/${id}`);
  return response.data?.data?.[0] ?? null;
}

// GET /api/songs/{id}/suggestions
export async function getSongSuggestions(id: string): Promise<SongDetail[]> {
  const response = await apiClient.get<SongSuggestionsResponse>(
    `/api/songs/${id}/suggestions`
  );
  return response.data?.data ?? [];
}