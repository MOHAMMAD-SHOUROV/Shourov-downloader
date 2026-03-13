import { createRequire } from 'module';
import getTwitterMedia from 'get-twitter-media';

const require = createRequire(import.meta.url);
const ytdlCore = require('@distube/ytdl-core');
const scraper = require('@bochilteam/scraper');
const axios = require('axios');
const cheerio = require('cheerio');

const { tiktokdl, facebookdl, instagramdl, instagramStory, pinterest, youtubedlv2, savefrom, snapsave } = scraper;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export async function downloadYoutube(url) {
  return await youtubedlv2(url);
}

export async function downloadYoutubeMP3(url) {
  const info = await youtubedlv2(url);
  const formats = (info.formats || []).filter(f => f.hasAudio && !f.hasVideo);
  return {
    title: info.title,
    thumbnail: info.thumbnail,
    duration: info.duration,
    audioFormats: formats.slice(0, 5),
  };
}

export async function downloadTikTok(url) {
  return await tiktokdl(url);
}

export async function downloadFacebook(url) {
  return await facebookdl(url);
}

export async function downloadInstagram(url) {
  if (url.includes('/stories/')) {
    return await instagramStory(url);
  }
  return await instagramdl(url);
}

export async function downloadPinterest(url) {
  return await pinterest(url);
}

export async function downloadSoundCloud(url) {
  return await savefrom(url);
}

export async function downloadThreads(url) {
  try {
    return await snapsave(url);
  } catch {
    return await savefrom(url);
  }
}

export async function downloadSpotify(url) {
  const trackId = url.match(/track\/([a-zA-Z0-9]+)/)?.[1];
  if (!trackId) throw new Error('Invalid Spotify track URL. Use a direct track link.');
  const oEmbed = await axios.get(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, {
    headers: { 'User-Agent': UA }, timeout: 12000,
  });
  const preview = `https://open.spotify.com/embed/track/${trackId}`;
  return {
    title: oEmbed.data.title,
    artist: oEmbed.data.author_name,
    thumbnail: oEmbed.data.thumbnail_url,
    embedUrl: preview,
    trackId,
    note: 'Spotify does not allow public audio download. Use the embed URL to play a 30s preview.',
  };
}

export async function downloadTeraBox(url) {
  const headers = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' };
  const res = await axios.get(url, { headers, timeout: 15000, maxRedirects: 10 });
  const $ = cheerio.load(res.data);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'TeraBox File';
  const fileUrl = $('meta[property="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content') || null;
  const thumbnail = $('meta[property="og:image"]').attr('content') || null;
  const size = $('meta[name="file-size"]').attr('content') || null;
  if (!fileUrl) throw new Error('Could not extract TeraBox file. It may be private or expired.');
  return { title, fileUrl, thumbnail, size, source: url };
}

export async function downloadGoogleDrive(url) {
  const idMatch = url.match(/[-\w]{25,}/);
  if (!idMatch) throw new Error('Invalid Google Drive URL. Cannot extract file ID.');
  const fileId = idMatch[0];
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  let title = 'Google Drive File';
  try {
    const res = await axios.get(viewUrl, { headers: { 'User-Agent': UA }, timeout: 10000 });
    const $ = cheerio.load(res.data);
    title = $('title').text().replace(' - Google Drive', '').trim() || title;
  } catch {}
  return { title, fileId, directDownloadUrl: directUrl, viewUrl, previewUrl };
}

export async function downloadCapCut(url) {
  const headers = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Referer': 'https://www.capcut.com/' };
  const response = await axios.get(url, { headers, timeout: 15000 });
  const $ = cheerio.load(response.data);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'CapCut Template';
  const videoUrl = $('meta[property="og:video"]').attr('content') ||
    $('meta[property="og:video:url"]').attr('content') || null;
  const thumbnail = $('meta[property="og:image"]').attr('content') || null;
  const description = $('meta[property="og:description"]').attr('content') || '';
  if (!videoUrl) throw new Error('Could not extract CapCut video. The template may be private.');
  return { title, videoUrl, thumbnail, description, source: url };
}

export async function downloadMedia(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return await downloadYoutube(url);
  if (url.includes('twitter.com') || url.includes('x.com')) return await getTwitterMedia(url);
  if (url.includes('tiktok.com')) return await downloadTikTok(url);
  if (url.includes('facebook.com') || url.includes('fb.watch')) return await downloadFacebook(url);
  if (url.includes('instagram.com')) return await downloadInstagram(url);
  if (url.includes('pinterest.com') || url.includes('pin.it')) return await downloadPinterest(url);
  if (url.includes('soundcloud.com')) return await downloadSoundCloud(url);
  if (url.includes('threads.net')) return await downloadThreads(url);
  if (url.includes('spotify.com')) return await downloadSpotify(url);
  if (url.includes('terabox.com') || url.includes('1024terabox.com') || url.includes('terasharelink.com')) return await downloadTeraBox(url);
  if (url.includes('drive.google.com')) return await downloadGoogleDrive(url);
  if (url.includes('capcut.com')) return await downloadCapCut(url);
  throw new Error('Unsupported platform');
}
