# Media Downloader

A Node.js media downloader library with a web UI that supports downloading media info from YouTube, Twitter/X, TikTok, Facebook, and Instagram.

## Architecture

- **Runtime**: Node.js 20 (ESM modules)
- **Web Server**: Express.js (`server.js`) — serves the UI and REST API on port 5000
- **Core Library**: `src/index.js` — `downloadMedia(url)` function that routes URLs to platform-specific scrapers

## Key Files

- `server.js` — Express web server with UI at `/` and API at `POST /api/download`
- `src/index.js` — Core `downloadMedia(url)` function (ESM module)
- `dist/index.js` — Babel-compiled CJS output (legacy, not used by server)
- `.babelrc` — Babel config for `@babel/preset-env`

## Dependencies

- `express` — Web server
- `@distube/ytdl-core` — YouTube downloader (CJS, loaded via `createRequire`)
- `@bochilteam/scraper` — TikTok, Facebook, Instagram scrapers (CJS, loaded via `createRequire`)
- `get-twitter-media` — Twitter/X media fetcher (ESM default export)
- `zod` — Schema validation
- `cheerio` — HTML parsing

## Import Notes

The project uses ESM (`"type": "module"`). Some dependencies are CommonJS and require `createRequire` from the `module` package:
- `@distube/ytdl-core` — use `createRequire`
- `@bochilteam/scraper` — use `createRequire`

## Workflows

- **Start application**: `node server.js` on port 5000 (webview)

## Deployment

- Target: autoscale
- Run: `node server.js`
