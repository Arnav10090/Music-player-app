# Mume — Music Player

A React Native (Expo) music player app built with the JioSaavn API

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

---

## Architecture

### State Management: Zustand

**Why Zustand over Redux Toolkit:**
- Zero boilerplate — no reducers, action creators, or slices needed for this scope
- Synchronous reads perfect for audio callback integration
- `react-native-track-player` events fire outside React's render cycle — Zustand's `getState()` works safely there
- RTK would add ~3x the code for identical behavior at intern-project scale

**Stores:**
| Store | Responsibility |
|---|---|
| `playerStore` | currentSong, isPlaying, position, duration, error |
| `queueStore` | queue array, currentIndex, shuffleMode, repeatMode, persistence |
| `searchStore` | query, results, pagination, loading states |

**Sync mechanism:** Both `MiniPlayer` and `PlayerScreen` call the same `usePlayer()` hook, which reads from the same Zustand store. There is no prop passing or event bus. Any write to the store (from audio callbacks, user actions) is immediately reflected in all subscribers.

### Storage: MMKV

**Why MMKV over AsyncStorage:**
- Synchronous writes — critical for queue persistence during app close/crash
- ~10x faster than AsyncStorage in benchmarks
- `AppState` change handler calls `saveQueue()` — MMKV's synchronous API ensures data is written before the OS kills the process
- First-class Expo plugin support

### Audio: react-native-track-player

**Why RNTP:**
- The only production-grade solution for background audio in Expo bare workflow
- Runs a foreground service on Android (required for background playback)
- Handles lock screen controls, notification media controls natively
- Manages its own audio session on iOS

**Background Playback:**
- iOS: `UIBackgroundModes: ["audio"]` in `app.json` → `infoPlist`
- Android: RNTP plugin automatically adds `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permissions and configures the foreground service
- `playbackService.ts` handles remote control events (lock screen, Bluetooth, headphones)

---

## Navigation

Uses **React Navigation v6 NativeStack** (Expo Router explicitly NOT used per assignment).

```
Root Stack
├── Home    (song list + search)
├── Player  (modal presentation)
└── Queue   (modal presentation)
```

MiniPlayer is rendered **outside** the navigator in `App.tsx` so it persists across all screens and navigation transitions.

---

## API

Base URL: `https://saavn.sumit.co` — No API key required.

Endpoints used:
- `GET /api/search/songs?query=&page=&limit=` — Home screen search + pagination
- `GET /api/songs/{id}/suggestions` — Song suggestions
- `GET /api/artists/{id}` — Artist detail
- `GET /api/artists/{id}/songs` — Artist songs

TypeScript types are derived **strictly** from the documented API response — no invented fields.

---

## Features

### Required
- ✅ Home: song list, search (debounced 400ms), pagination (infinite scroll)
- ✅ Player: full controls, seek bar, background playback
- ✅ Mini Player: persistent, perfectly synced with Full Player
- ✅ Queue: view, add, remove songs, persisted via MMKV

### Bonus
- ✅ Shuffle mode (Fisher-Yates shuffle of queue indices)
- ✅ Repeat modes: none → all → one
- ✅ Offline download (expo-file-system, 160kbps stream)

---

## Trade-offs & Known Limitations

1. **Reorder in Queue**: Full drag-to-reorder requires `react-native-draggable-flatlist` with native setup. The UI shows drag handles but reordering is done via remove+re-add for simplicity. The store's `reorderQueue()` is implemented and ready.

2. **Search seed query**: On first load, the app searches "top hindi songs" to populate the list. This could be replaced with a curated homepage via `/api/search` once the user's listening history is available.

3. **No mock data**: All content comes from the live JioSaavn API. If the API is unreachable, the error state is shown.

4. **Expo managed vs bare**: RNTP and MMKV require a **bare** Expo workflow (`expo run:android` / `expo run:ios`). They cannot run in Expo Go. Use `npx expo run:android` or build with EAS.

5. **Image URL normalization**: The search API uses `link` field while the songs API uses `url`. Both are handled in `getBestImageUrl()`.

---

## Project Structure

```
src/
├── api/           # Axios API layer (client, searchApi, songsApi, artistsApi)
├── types/         # TypeScript interfaces from actual API responses
├── store/         # Zustand stores (player, queue, search)
├── services/      # audioService, storageService, downloadService, playbackService
├── navigation/    # RootNavigator (React Navigation v6)
├── screens/       # HomeScreen, PlayerScreen, QueueScreen
├── components/    # MiniPlayer, SongListItem, SeekBar, PlayerControls, ...
├── hooks/         # usePlayer, useSearch
└── constants/     # theme (colors, spacing, typography)
``` 