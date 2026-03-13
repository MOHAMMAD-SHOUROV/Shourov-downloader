# SHOUROV ALL DOWNLOADER — API Panel

A premium multi-platform media downloader API panel built with Node.js and Express.

## Architecture

- **Runtime**: Node.js 20 (ESM modules)
- **Web Server**: Express.js (`server.js`) on port 5000
- **Core Library**: `src/index.js` — per-platform download functions

## API Endpoints (13 total)

| Endpoint | Platform | Description |
|---|---|---|
| `GET /api/youtube?url=` | YouTube | Video info + all quality formats |
| `GET /api/ytmp3?url=` | YouTube MP3 | Audio/MP3 extraction info |
| `GET /api/tiktok?url=` | TikTok | Video without watermark |
| `GET /api/facebook?url=` | Facebook | Video & reels |
| `GET /api/instagram?url=` | Instagram | Reels, posts & stories |
| `GET /api/pinterest?url=` | Pinterest | Video & images |
| `GET /api/soundcloud?url=` | SoundCloud | Track download via savefrom |
| `GET /api/threads?url=` | Threads | Video & media |
| `GET /api/spotify?url=` | Spotify | Track info + 30s preview embed |
| `GET /api/terabox?url=` | TeraBox | Direct file download link |
| `GET /api/gdrive?url=` | Google Drive | Direct download link |
| `GET /api/capcut?url=` | CapCut | Template video |

All endpoints return `{ success: true, data: {...} }` or `{ success: false, error: "..." }`.

## Panel Features

- Built-in YouTube iframe player
- Category filter (All / Video / Audio / Image / File)
- Live API test modal with syntax-highlighted JSON
- Copy endpoint URL button
- Fully mobile responsive
- Animated live badge + stats bar

## Key Files

- `server.js` — Express server + full premium panel HTML + all API routes
- `src/index.js` — Core download functions per platform

## Dependencies

- `express` — Web server
- `@distube/ytdl-core` — YouTube (CJS via `createRequire`)
- `@bochilteam/scraper` — TikTok, Facebook, Instagram, Pinterest, SoundCloud, Threads, YouTube v2 (CJS via `createRequire`)
- `get-twitter-media` — Twitter/X (ESM default)
- `axios` + `cheerio` — CapCut, TeraBox, Google Drive scraping
- Spotify oEmbed API — public, no key needed

## Import Notes

Project is ESM (`"type": "module"`). CJS packages use `createRequire` from the `module` package.

## Workflow

- **Start application**: `node server.js` → port 5000 (webview)

## Deployment

- Target: autoscale
- Run: `node server.js`
