import { SearchSong } from './song.types';
import { ArtistListItem } from './artist.types';

export interface SearchSongsResponse {
  status: string;
  data: {
    results: SearchSong[];
    total: number;
    start: number;
  };
}

export interface SearchArtistsResponse {
  status: string;
  data: {
    results: ArtistListItem[];
    total: number;
    start: number;
  };
}

export interface SearchAllResponse {
  status: string;
  data: {
    songs?: {
      results: SearchSong[];
      total: number;
    };
    artists?: {
      results: ArtistListItem[];
      total: number;
    };
  };
}