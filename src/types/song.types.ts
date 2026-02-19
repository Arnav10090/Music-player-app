// Typed STRICTLY from actual API response fields documented in assignment

export interface ImageQuality {
  quality: string;
  link?: string; // search API uses "link"
  url?: string;  // songs API uses "url"
}

export interface DownloadUrl {
  quality: string;
  link?: string; // search API uses "link"
  url?: string;  // songs API uses "url"
}

export interface Album {
  id: string;
  name: string;
  url?: string;
}

// Search API song shape
export interface SearchSong {
  id: string;
  name: string;
  type: string;
  album: Album;
  year: string;
  releaseDate: string | null;
  duration: string; // string in search response
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists: string;
  featuredArtistsId: string;
  explicitContent: number;
  playCount: string;
  language: string;
  hasLyrics: string;
  url: string;
  copyright: string;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

// Songs API (/api/songs/{id}) shape
export interface ArtistRef {
  id: string;
  name: string;
}

export interface SongArtists {
  primary: ArtistRef[];
}

export interface SongDetail {
  id: string;
  name: string;
  duration: number; // number in songs API
  language: string;
  album: Album;
  artists: SongArtists;
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
}

// Unified song shape used across the app (normalized from both API shapes)
export interface Song {
  id: string;
  name: string;
  duration: number;       // always stored as number (seconds)
  album: Album;
  primaryArtists: string; // display string
  image: ImageQuality[];
  downloadUrl: DownloadUrl[];
  language: string;
}

// Normalizer: SearchSong → Song
export function normalizeSearchSong(s: SearchSong): Song {
  return {
    id: s.id,
    name: s.name,
    duration: parseInt(s.duration, 10),
    album: s.album,
    primaryArtists: s.primaryArtists,
    image: s.image,
    downloadUrl: s.downloadUrl,
    language: s.language,
  };
}

// Normalizer: SongDetail → Song
export function normalizeSongDetail(s: SongDetail): Song {
  return {
    id: s.id,
    name: s.name,
    duration: s.duration,
    album: s.album,
    primaryArtists: s.artists.primary.map((a) => a.name).join(', '),
    image: s.image,
    downloadUrl: s.downloadUrl,
    language: s.language,
  };
}

// Get best image URL from either API shape
export function getBestImageUrl(images: ImageQuality[]): string {
  const large = images.find((i) => i.quality === '500x500');
  const medium = images.find((i) => i.quality === '150x150');
  const found = large || medium || images[0];
  return found?.link || found?.url || '';
}

// Get streaming URL (prefer 160kbps, fallback to 96kbps, then first)
export function getStreamUrl(downloadUrls: DownloadUrl[]): string {
  const prefer = downloadUrls.find((d) => d.quality === '160kbps');
  const fallback = downloadUrls.find((d) => d.quality === '96kbps');
  const found = prefer || fallback || downloadUrls[0];
  return found?.link || found?.url || '';
}

// Format seconds → mm:ss
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}