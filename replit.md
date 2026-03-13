# SHOUROV ALL DOWNLOADER — API Panel

A premium multi-platform media downloader API panel built with Node.js and Express.

## Architecture

- **Runtime**: Node.js 20 (ESM modules)
- **Web Server**: Express.js (`server.js`) on port 5000
- **Core Library**: `src/index.js` — per-platform download functions

## API Endpoints

| Endpoint | Platform | Description |
|---|---|---|
| `GET /api/youtube?url=` | YouTube | Video info + formats |
| `GET /api/ytmp3?url=` | YouTube | Audio/MP3 extraction info |
| `GET /api/tiktok?url=` | TikTok | Video without watermark |
| `GET /api/facebook?url=` | Facebook | Video download |
| `GET /api/instagram?url=` | Instagram | Reels / posts / stories |
| `GET /api/pinterest?url=` | Pinterest | Video & image |
| `GET /api/capcut?url=` | CapCut | Template video |

All endpoints return `{ success: true, data: {...} }` on success or `{ success: false, error: "..." }` on failure.

## Key Files

- `server.js` — Express server + premium panel UI + all API routes
- `src/index.js` — Core download functions per platform
- `dist/index.js` — Legacy Babel CJS build (unused)
- `.babelrc` — Babel config

## Dependencies

- `express` — Web server
- `@distube/ytdl-core` — YouTube (CJS via `createRequire`)
- `@bochilteam/scraper` — TikTok, Facebook, Instagram, Pinterest, YouTube v2 (CJS via `createRequire`)
- `get-twitter-media` — Twitter/X (ESM default)
- `axios` + `cheerio` — CapCut scraping

## Import Notes

Project is ESM (`"type": "module"`). CommonJS packages use `createRequire` from the `module` package.

## Workflow

- **Start application**: `node server.js` → port 5000 (webview)

## Deployment

- Target: autoscale
- Run: `node server.js`
