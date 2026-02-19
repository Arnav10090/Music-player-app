/**
 * Offline Song Download
 *
 * Strategy:
 *  1. Download the 160 kbps stream to the app's private documentDirectory
 *     (used for in-app playback — always reliable).
 *  2. Copy the finished file into the public Downloads folder via
 *     StorageAccessFramework so it appears in the phone's file manager.
 *  3. isDownloaded() checks the ACTUAL FILE on disk, not just AsyncStorage,
 *     so stale/failed records never show a false "Downloaded" badge.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';
import { Song, getStreamUrl } from '../types/song.types';
import {
  loadDownloadedSongs,
  saveDownloadedSongs,
} from './storageService';

// ─── Paths ────────────────────────────────────────────────────────────────────

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export function getLocalPath(songId: string): string {
  return `${DOWNLOAD_DIR}${songId}.mp4`;
}

// ─── isDownloaded — checks the REAL file, not just the record ─────────────────

export async function isDownloaded(songId: string): Promise<boolean> {
  try {
    const path = getLocalPath(songId);
    const info = await FileSystem.getInfoAsync(path);
    if (!info.exists) {
      // File is gone — clean up any stale AsyncStorage record
      const existing = await loadDownloadedSongs();
      if (existing.some((s) => s.id === songId)) {
        await saveDownloadedSongs(existing.filter((s) => s.id !== songId));
      }
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function ensureDownloadDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
  }
}

/** Sanitise a song name so it's safe to use as a filename. */
function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, '_').trim();
}

/**
 * Copy the private file into the public Downloads folder so it appears
 * in the phone's file manager. Uses StorageAccessFramework on Android.
 * Silently skips on iOS (files are in iCloud-accessible app Documents).
 */
async function copyToPublicDownloads(
  sourcePath: string,
  song: Song,
): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const SAF = FileSystem.StorageAccessFramework;

    // Request persistent access to the Downloads directory
    const permissions = await SAF.requestDirectoryPermissionsAsync();
    if (!permissions.granted) return; // user declined — skip silently

    const fileName = `${safeFilename(song.name)}.mp3`;

    // Create the file entry in the public directory
    const publicUri = await SAF.createFileAsync(
      permissions.directoryUri,
      fileName,
      'audio/mpeg',
    );

    // Read private file as base64 and write to the public URI
    const base64 = await FileSystem.readAsStringAsync(sourcePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await SAF.writeAsStringAsync(publicUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  } catch (e) {
    // Non-fatal — the song still plays offline from the private path
    console.warn('[downloadService] copyToPublicDownloads failed:', e);
  }
}

// ─── Main API ─────────────────────────────────────────────────────────────────

export async function downloadSong(
  song: Song,
  onProgress?: (progress: number) => void,
): Promise<string> {
  await ensureDownloadDir();

  const localPath = getLocalPath(song.id);

  // Already on disk — nothing to do
  const existing = await FileSystem.getInfoAsync(localPath);
  if (existing.exists) {
    return localPath;
  }

  const streamUrl = getStreamUrl(song.downloadUrl);
  if (!streamUrl) throw new Error('No stream URL available for download');

  // ── Step 1: Download to private app storage ─────────────────────────────
  const downloadResumable = FileSystem.createDownloadResumable(
    streamUrl,
    localPath,
    {},
    (progress) => {
      if (progress.totalBytesExpectedToWrite > 0) {
        onProgress?.(
          progress.totalBytesWritten / progress.totalBytesExpectedToWrite,
        );
      }
    },
  );

  const result = await downloadResumable.downloadAsync();
  if (!result?.uri) throw new Error('Download failed — no output URI returned');

  // ── Step 2: Persist the record ───────────────────────────────────────────
  const records = await loadDownloadedSongs();
  if (!records.find((s) => s.id === song.id)) {
    await saveDownloadedSongs([...records, song]);
  }

  // ── Step 3: Copy to public Downloads folder (Android) ───────────────────
  await copyToPublicDownloads(localPath, song);

  return result.uri;
}

export async function deleteDownload(songId: string): Promise<void> {
  const localPath = getLocalPath(songId);
  const info = await FileSystem.getInfoAsync(localPath);
  if (info.exists) {
    await FileSystem.deleteAsync(localPath, { idempotent: true });
  }
  const existing = await loadDownloadedSongs();
  await saveDownloadedSongs(existing.filter((s) => s.id !== songId));
}

export async function getDownloadedSongs(): Promise<Song[]> {
  // Return only songs whose files actually exist on disk
  const records = await loadDownloadedSongs();
  const verified = await Promise.all(
    records.map(async (song) => {
      const info = await FileSystem.getInfoAsync(getLocalPath(song.id));
      return info.exists ? song : null;
    }),
  );
  const clean = verified.filter((s): s is Song => s !== null);
  // Prune stale records if any were removed
  if (clean.length !== records.length) {
    await saveDownloadedSongs(clean);
  }
  return clean;
}