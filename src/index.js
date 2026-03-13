import { createRequire } from 'module';
import getTwitterMedia from 'get-twitter-media';

const require = createRequire(import.meta.url);
const ytdlCore = require('@distube/ytdl-core');
const scraper = require('@bochilteam/scraper');
const axios = require('axios');
const cheerio = require('cheerio');

const { tiktokdl, facebookdl, instagramdl, pinterest, youtubedlv2 } = scraper;

export async function downloadYoutube(url) {
  const info = await youtubedlv2(url);
  return info;
}

export async function downloadYoutubeMP3(url) {
  const info = await youtubedlv2(url);
  const audioFormats = (info.formats || []).filter(f => f.hasAudio && !f.hasVideo);
  return {
    title: info.title,
    thumbnail: info.thumbnail,
    duration: info.duration,
    audioFormats: audioFormats.slice(0, 5),
  };
}

export async function downloadTikTok(url) {
  return await tiktokdl(url);
}

export async function downloadFacebook(url) {
  return await facebookdl(url);
}

export async function downloadInstagram(url) {
  return await instagramdl(url);
}

export async function downloadPinterest(url) {
  return await pinterest(url);
}

export async function downloadCapCut(url) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Referer': 'https://www.capcut.com/',
  };
  const response = await axios.get(url, { headers, timeout: 15000 });
  const $ = cheerio.load(response.data);

  const title = $('meta[property="og:title"]').attr('content') ||
    $('title').text() || 'CapCut Template';
  const videoUrl = $('meta[property="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content') || null;
  const thumbnail = $('meta[property="og:image"]').attr('content') || null;
  const description = $('meta[property="og:description"]').attr('content') || '';

  if (!videoUrl) {
    throw new Error('Could not extract CapCut video. The template may be private or unavailable.');
  }

  return { title, videoUrl, thumbnail, description, source: url };
}

export async function downloadMedia(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return await downloadYoutube(url);
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return await getTwitterMedia(url);
  } else if (url.includes('tiktok.com')) {
    return await downloadTikTok(url);
  } else if (url.includes('facebook.com')) {
    return await downloadFacebook(url);
  } else if (url.includes('instagram.com')) {
    return await downloadInstagram(url);
  } else if (url.includes('pinterest.com') || url.includes('pin.it')) {
    return await downloadPinterest(url);
  } else if (url.includes('capcut.com')) {
    return await downloadCapCut(url);
  } else {
    throw new Error('Unsupported platform');
  }
}
