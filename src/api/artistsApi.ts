import apiClient from './client';
import { Artist } from '../types/artist.types';
import { SongDetail } from '../types/song.types';

interface ArtistResponse {
  status: string;
  data: Artist;
}

interface ArtistSongsResponse {
  status: string;
  data: {
    total: number;
    songs: SongDetail[];
  };
}

// GET /api/artists/{id}
export async function getArtistById(id: string): Promise<Artist | null> {
  const response = await apiClient.get<ArtistResponse>(`/api/artists/${id}`);
  return response.data?.data ?? null;
}

// GET /api/artists/{id}/songs
export async function getArtistSongs(
  id: string,
  page: number = 1
): Promise<{ total: number; songs: SongDetail[] }> {
  const response = await apiClient.get<ArtistSongsResponse>(
    `/api/artists/${id}/songs`,
    { params: { page } }
  );
  return response.data?.data ?? { total: 0, songs: [] };
}