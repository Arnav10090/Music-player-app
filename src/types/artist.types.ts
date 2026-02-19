import { ImageQuality } from './song.types';

// GET /api/artists/{id} response shape
export interface Artist {
  id: string;
  name: string;
  image: ImageQuality[];
  followerCount?: string;
  fanCount?: string;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: Array<{ text: string; title: string; sequence: string }>;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
}

export interface ArtistListItem {
  id: string;
  name: string;
  image: ImageQuality[];
  // from search
  type?: string;
  description?: string;
}