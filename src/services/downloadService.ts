/**
 * BONUS FEATURE: Offline Song Download
 *
 * Downloads the 160kbps stream URL to the device's file system.
 * Uses expo-file-system for downloading + expo-media-library for saving.
 * Tracks downloaded songs in MMKV storage.
 */

import * as FileSystem from 'expo-file-system';
import { Song, getStreamUrl } from '../types/song.types';
import {
  loadDownloadedSongs,
  saveDownloadedSongs,
  isDownloaded,
} from './storageService';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export { isDownloaded };

async function ensureDownloadDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

export function getLocalPath(songId: string): string {
  return `${DOWNLOAD_DIR}${songId}.mp4`;
}

export async function downloadSong(
  song: Song,
  onProgress?: (progress: number) => void
): Promise<string> {
  await ensureDownloadDir();

  const localPath = getLocalPath(song.id);
  const localInfo = await FileSystem.getInfoAsync(localPath);
  if (localInfo.exists) {
    // Already downloaded
    return localPath;
  }

  const streamUrl = getStreamUrl(song.downloadUrl);
  if (!streamUrl) throw new Error('No stream URL available for download');

  const downloadResumable = FileSystem.createDownloadResumable(
    streamUrl,
    localPath,
    {},
    (progress) => {
      const ratio =
        progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
      onProgress?.(ratio);
    }
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed');

  // Persist record in MMKV
  const existing = loadDownloadedSongs();
  if (!existing.find((s) => s.id === song.id)) {
    saveDownloadedSongs([...existing, song]);
  }

  return result.uri;
}

export async function deleteDownload(songId: string): Promise<void> {
  const localPath = getLocalPath(songId);
  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) {
    await FileSystem.deleteAsync(localPath, { idempotent: true });
  }
  const existing = loadDownloadedSongs();
  saveDownloadedSongs(existing.filter((s) => s.id !== songId));
}

export function getDownloadedSongs(): Song[] {
  return loadDownloadedSongs();
}