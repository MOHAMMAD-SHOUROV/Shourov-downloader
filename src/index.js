import { createRequire } from 'module';
import getTwitterMedia from 'get-twitter-media';

const require = createRequire(import.meta.url);
const ytdlCore = require('@distube/ytdl-core');
const scraper = require('@bochilteam/scraper');

const { tiktokdl, facebookdl, instagramdl } = scraper;

export async function downloadMedia(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return await ytdlCore.youtubedl(url);
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return await getTwitterMedia(url);
  } else if (url.includes('tiktok.com')) {
    return await tiktokdl(url);
  } else if (url.includes('facebook.com')) {
    return await facebookdl(url);
  } else if (url.includes('instagram.com')) {
    return await instagramdl(url);
  } else {
    throw new Error('Unsupported platform');
  }
}
