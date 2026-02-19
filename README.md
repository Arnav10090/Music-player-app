# Mume — Music Player

A React Native (Expo) music player app built with the JioSaavn API.

---

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for APK): `npm install -g eas-cli`
- Android Studio / Xcode (for local builds)

### Install & Run

```bash
git clone <repo-url>
cd music-player
npm install

# Start dev server
npx expo start

# Run on Android device/emulator
npx expo run:android

# Build APK
eas build --platform android --profile preview
```

### Environment
No API key required. Base URL: `https://saavn.sumit.co`

> **Note:** `expo-av`, `expo-file-system`, and `expo-media-library` require a **bare** Expo workflow. Use `npx expo run:android` or build with EAS. These packages do **not** work in Expo Go.

---

## Architecture

### State Management: Zustand

**Why Zustand over Redux Toolkit:**
- Zero boilerplate — no reducers, action creators, or slices needed for this scope
- Synchronous reads perfect for audio callback integration
- `expo-av` status callbacks fire outside React's render cycle — Zustand's `getState()` works safely there
- RTK would add ~3x the code for identical behavior at this scale

**Stores:**

| Store | Responsibility |
|---|---|
| `playerStore` | `currentSong`, `isPlaying`, `position`, `duration`, `isLoading`, `error`, `isPlayerVisible` |
| `queueStore` | `queue` array, `currentIndex`, `shuffleMode`, `repeatMode`, `shuffledIndices`, persistence |
| `searchStore` | `query`, `results`, `total`, `page`, pagination, loading states |
| `favoritesStore` | `favorites` array, `isFavorite()`, `toggleFavorite()`, AsyncStorage persistence |
| `themeStore` | `isDark`, `toggleTheme()`, AsyncStorage persistence |

**Sync mechanism:** Both `MiniPlayer` and `PlayerScreen` consume the same `usePlayer()` hook, which reads from the same Zustand stores. No prop drilling or event bus. Any write (from audio callbacks or user actions) is immediately reflected in all subscribers.

### Storage: AsyncStorage

`@react-native-async-storage/async-storage` is used throughout for persistence:
- Queue and current index saved on every mutation in `queueStore`
- Favorites persisted in `favoritesStore`
- Downloaded song records tracked in `storageService`
- Theme preference stored in `themeStore`
- Recent search history stored directly in `SearchScreen`

> **Note:** The README previously mentioned MMKV. The actual implementation uses AsyncStorage for compatibility with the Expo bare workflow without additional native configuration.

### Audio: expo-av

`expo-av` (`Audio.Sound`) handles all audio playback:

- `setupPlayer()` configures `staysActiveInBackground: true` and `playsInSilentModeIOS: true` for background audio
- A single `Audio.Sound` instance is managed in `audioService.ts`, replaced on track change
- Status callbacks (position, duration, buffering, `didJustFinish`) are bridged into Zustand via `playbackService.ts`
- Background playback on iOS requires `UIBackgroundModes: ["audio"]` in `app.json` → `infoPlist` (already configured)

> **Note:** Unlike `react-native-track-player`, `expo-av` does not provide a native lock screen media controller or a foreground service on Android. Background audio continues while the app is backgrounded, but notification/lock screen controls are not available.

---

## Navigation

Uses **React Navigation v6 NativeStack** (Expo Router explicitly NOT used per assignment).

```
Root Stack
├── MainTabs (BottomTabNavigator)
│   ├── Home       (song list, tabs, search entry point)
│   ├── Favorites  (liked songs)
│   ├── Playlists  (placeholder)
│   └── Settings   (dark mode toggle, static options)
├── Player         (modal, slide_from_bottom)
├── Search         (full-screen search with recent history)
├── ArtistDetail   (slide_from_right)
└── AlbumDetail    (slide_from_right)
```

`MiniPlayer` is rendered **outside** the navigator in `App.tsx` so it persists across all screens and is hidden only when the full `PlayerScreen` is active.

---

## API

Base URL: `https://saavn.sumit.co` — No API key required.

Endpoints used:

| Endpoint | Used In |
|---|---|
| `GET /api/search/songs?query=&page=&limit=` | Home tabs (Songs, Artists, Albums, Suggested), SearchScreen |
| `GET /api/songs/{id}/suggestions` | (defined in `songsApi.ts`, available for use) |
| `GET /api/artists/{id}` | (defined in `artistsApi.ts`, available for use) |
| `GET /api/artists/{id}/songs` | (defined in `artistsApi.ts`, available for use) |

TypeScript types are derived strictly from documented API responses. Both field naming inconsistencies between the search API (`link`) and songs API (`url`) are handled in `getBestImageUrl()` and `getStreamUrl()`. HTML entities (e.g. `&quot;`, `&amp;`) in song/album/artist names are decoded via `decodeHtml()`.

---

## Features

### Required

- ✅ **Home:** Song list with tabs (Suggested, Songs, Artists, Albums), search entry, pagination via infinite scroll
- ✅ **Player:** Full controls (play/pause, skip, ±10s seek, seek bar), background audio (`expo-av` with `staysActiveInBackground`)
- ✅ **Mini Player:** Persistent across all non-Player screens, perfectly synced with full player via shared Zustand store
- ✅ **Queue:** View queue, add songs, remove songs, persisted via AsyncStorage

### Bonus

- ✅ **Shuffle mode:** Fisher-Yates shuffle of queue indices, toggled from both Player and MiniPlayer controls
- ✅ **Repeat modes:** Cycles `none → all → one`, handled in `usePlayer` track finish logic
- ✅ **Offline download:** `expo-file-system` downloads 160 kbps stream to app-private `documentDirectory`; Android copy to public Downloads via `StorageAccessFramework`; real file existence check (not just AsyncStorage) in `isDownloaded()`

### Extra Features

- **Dark mode:** Full light/dark theme system with `themeStore`, persisted across sessions
- **Favorites screen:** Heart any song; persisted via AsyncStorage; Play All support
- **Artist Detail screen:** Hero image, song list, shuffle/play actions
- **Album Detail screen:** Hero image, song list, shuffle/play actions
- **Search screen:** Debounced search, recent search history (stored via AsyncStorage, individually removable), filter chip UI (Songs/Artists/Albums/Folders), not-found state
- **Song Options Sheet:** Per-song bottom sheet with download progress bar + percentage badge, add to queue, play next, go to artist/album, like/unlike
- **Queue position badges:** In SongsTab, songs added to the playing queue show a numbered orange badge on their artwork indicating their position in the upcoming queue
- **HTML entity decoding:** Song and artist names from the API are decoded before display
- **Theming throughout:** All screens and components use `useThemeColors()` for consistent light/dark rendering

---

## Trade-offs & Known Limitations

1. **No lock screen / notification controls:** `expo-av` does not run a native foreground service or register with the OS media session. Audio plays in the background, but lock screen transport controls are not available. `react-native-track-player` would provide this but requires additional native setup beyond what `expo-av` offers.

2. **Queue drag-to-reorder:** Full drag-to-reorder requires `react-native-draggable-flatlist` with native setup. The Queue screen shows drag handles visually, and `reorderQueue()` is fully implemented in `queueStore`, but the gesture is not wired up. Remove + re-add is the current user-facing workaround.

3. **Home tab data is search-derived:** All four home tabs (Suggested, Songs, Artists, Albums) seed their content from a `searchSongs("top hindi songs")` / `searchSongs("top trending songs")` call on mount. There is no dedicated "trending" or "home feed" endpoint in the API, so this is the closest equivalent. Content refreshes on each app launch.

4. **Albums and Artists are grouped client-side:** Albums and Artist groupings are derived by grouping the search results by `album.id` and `primaryArtists` string respectively — not fetched from dedicated album/artist endpoints. This means the groups reflect whatever the search returns, not full discographies.

5. **Playlists screen is a placeholder:** The Playlists tab shows an empty state. Playlist creation/management was not part of the core requirements and is not implemented.

6. **AsyncStorage vs MMKV:** MMKV offers synchronous writes and better crash-safety for queue persistence on app close. AsyncStorage was used here for simpler Expo bare workflow compatibility without an additional native dependency. Migrating to MMKV would be a drop-in replacement in `storageService.ts`.

7. **No mock data:** All content comes from the live JioSaavn API. If the API is unreachable, error states are shown.

8. **`ArtistsTab` list key uniqueness:** The original `keyExtractor` used only `item.name`, which could collide when multiple result entries share the same `primaryArtists` string. Fixed to `artist-${item.name}-${index}`. The bottom sheet options array was also defined inline (new object references on every render with function values), replaced with a static `SHEET_OPTIONS` constant outside the component so each item has a stable string `key`. This resolved the React warning: _"Each child in a list should have a unique key prop"_ triggered when navigating to the Artists tab.

---

## Project Structure

```
src/
├── api/           # Axios API layer (client, searchApi, songsApi, artistsApi)
├── types/         # TypeScript interfaces matching actual API responses
│   ├── song.types.ts      # Song, SearchSong, SongDetail, normalizers, helpers
│   ├── artist.types.ts
│   └── search.types.ts
├── store/         # Zustand stores
│   ├── playerStore.ts     # Playback state
│   ├── queueStore.ts      # Queue + shuffle/repeat + persistence
│   ├── searchStore.ts     # Search results + pagination
│   ├── favoritesStore.ts  # Liked songs
│   └── themeStore.ts      # Dark/light mode
├── services/
│   ├── audioService.ts    # expo-av wrapper (load, play, pause, seek, skip, queue)
│   ├── playbackService.ts # Bridges AVPlaybackStatus → playerStore
│   ├── downloadService.ts # Offline download via expo-file-system
│   └── storageService.ts  # AsyncStorage helpers (queue, downloads)
├── navigation/    # RootNavigator (React Navigation v6 NativeStack + BottomTabs)
├── screens/
│   ├── HomeScreen.tsx
│   ├── PlayerScreen.tsx
│   ├── SearchScreen.tsx
│   ├── QueueScreen.tsx
│   ├── ArtistDetailScreen.tsx
│   ├── AlbumDetailScreen.tsx
│   ├── Favoritesscreen.tsx
│   ├── Playlistsscreen.tsx
│   ├── Settingsscreen.tsx
│   └── tabs/              # SuggestedTab, SongsTab, ArtistsTab, AlbumsTab
├── components/    # MiniPlayer, SongListItem, SeekBar, ArtworkImage,
│                  # PlayerControls, SearchBar, SongOptionsSheet, TopTabs
├── hooks/         # usePlayer, useSearch, useThemeColors
└── constants/     # theme.ts (LightColors, DarkColors, Spacing, FontSize, …)
```