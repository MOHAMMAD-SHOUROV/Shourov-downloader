import { createRequire } from 'module';
import getTwitterMedia from 'get-twitter-media';

const require = createRequire(import.meta.url);
const ytdlCore = require('@distube/ytdl-core');
const scraper = require('@bochilteam/scraper');
const axios = require('axios');
const cheerio = require('cheerio');

const { tiktokdl, facebookdl, instagramdl, instagramStory, pinterest, youtubedlv2, savefrom, snapsave, youtubeSearch } = scraper;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

function fmtSize(bytes) {
  if (!bytes) return '';
  const mb = Math.round(bytes / 1024 / 1024);
  return mb > 0 ? mb + ' MB' : Math.round(bytes / 1024) + ' KB';
}

function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

export async function resolveUrl(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return await resolveYoutube(url);
  } else if (url.includes('tiktok.com')) {
    return await resolveTikTok(url);
  } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
    return await resolveFacebook(url);
  } else if (url.includes('instagram.com')) {
    return await resolveInstagram(url);
  } else if (url.includes('pinterest.com') || url.includes('pin.it')) {
    return await resolvePinterest(url);
  } else if (url.includes('twitter.com') || url.includes('x.com')) {
    return await resolveTwitter(url);
  } else {
    throw new Error('Unsupported platform. Paste a YouTube, TikTok, Facebook, Instagram, Pinterest, or Twitter link.');
  }
}

async function resolveYoutube(url) {
  const info = await ytdlCore.getInfo(url);
  const title = info.videoDetails.title;
  const thumbnail = info.videoDetails.thumbnails.slice(-1)[0]?.url || '';
  const duration = fmtDuration(parseInt(info.videoDetails.lengthSeconds));
  const channel = info.videoDetails.author?.name || '';

  const allFormats = info.formats;

  // Combined video+audio (best for direct download)
  const combined = allFormats
    .filter(f => f.hasVideo && f.hasAudio && f.container === 'mp4')
    .sort((a, b) => (parseInt(b.qualityLabel) || 0) - (parseInt(a.qualityLabel) || 0));

  // Video only (higher quality, needs merging — skip for simplicity, just show combined)
  // Audio only
  const audioFormats = allFormats
    .filter(f => f.hasAudio && !f.hasVideo && f.audioCodec && f.audioCodec.includes('mp4a'))
    .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

  const formats = [];
  const seen = new Set();

  for (const f of combined) {
    const label = f.qualityLabel || 'Video';
    if (!seen.has(label)) {
      seen.add(label);
      formats.push({
        label: 'MP4 ' + label,
        quality: label,
        type: 'video',
        size: fmtSize(parseInt(f.contentLength)),
        itag: f.itag,
        mimeType: f.mimeType,
      });
    }
  }

  // Add best audio
  if (audioFormats.length > 0) {
    const af = audioFormats[0];
    formats.push({
      label: 'MP3 Audio',
      quality: (af.audioBitrate || 128) + 'kbps',
      type: 'audio',
      size: fmtSize(parseInt(af.contentLength)),
      itag: af.itag,
      mimeType: af.mimeType,
    });
  }

  return { platform: 'youtube', title, thumbnail, duration, channel, formats, sourceUrl: url };
}

async function resolveTikTok(url) {
  const data = await tiktokdl(url);
  const formats = [];
  if (data.video) {
    const videos = Array.isArray(data.video) ? data.video : [data.video];
    videos.forEach((v, i) => {
      if (v) formats.push({ label: i === 0 ? 'MP4 HD (No Watermark)' : 'MP4 SD', quality: i === 0 ? 'HD' : 'SD', type: 'video', url: v });
    });
  }
  if (data.music) formats.push({ label: 'Audio Track', quality: 'Audio', type: 'audio', url: data.music });
  return {
    platform: 'tiktok',
    title: data.title || data.description || 'TikTok Video',
    thumbnail: data.cover || data.thumbnail || '',
    channel: data.author?.nickname || data.nickname || '',
    formats,
    sourceUrl: url,
  };
}

async function resolveFacebook(url) {
  const data = await facebookdl(url);
  const formats = [];
  if (data.hd) formats.push({ label: 'MP4 HD', quality: 'HD', type: 'video', url: data.hd });
  if (data.sd) formats.push({ label: 'MP4 SD', quality: 'SD', type: 'video', url: data.sd });
  return {
    platform: 'facebook',
    title: data.title || 'Facebook Video',
    thumbnail: data.thumbnail || data.image || '',
    channel: data.author || '',
    formats,
    sourceUrl: url,
  };
}

async function resolveInstagram(url) {
  let data;
  if (url.includes('/stories/')) {
    data = await instagramStory(url);
  } else {
    data = await instagramdl(url);
  }
  const formats = [];
  const items = Array.isArray(data) ? data : (data.result || data.data || [data]);
  items.forEach((item, i) => {
    if (item.url || item.video_url) {
      formats.push({ label: 'MP4 Video ' + (i + 1), quality: 'HD', type: 'video', url: item.url || item.video_url });
    } else if (item.image || item.display_url) {
      formats.push({ label: 'Image ' + (i + 1), quality: 'Original', type: 'image', url: item.image || item.display_url });
    }
  });
  if (formats.length === 0 && (data.url || data.video_url)) {
    formats.push({ label: 'MP4 Video', quality: 'HD', type: 'video', url: data.url || data.video_url });
  }
  return {
    platform: 'instagram',
    title: data.title || data.caption || 'Instagram Media',
    thumbnail: data.thumbnail || data.image || (items[0] && (items[0].image || items[0].display_url)) || '',
    channel: data.author || data.username || '',
    formats,
    sourceUrl: url,
  };
}

async function resolvePinterest(url) {
  const data = await pinterest(url);
  const formats = [];
  if (data.videoUrl || data.video) formats.push({ label: 'MP4 Video', quality: 'HD', type: 'video', url: data.videoUrl || data.video });
  if (data.imageUrl || data.image) formats.push({ label: 'Image', quality: 'Original', type: 'image', url: data.imageUrl || data.image });
  return {
    platform: 'pinterest',
    title: data.title || data.description || 'Pinterest Media',
    thumbnail: data.imageUrl || data.image || '',
    formats,
    sourceUrl: url,
  };
}

async function resolveTwitter(url) {
  const data = await getTwitterMedia(url);
  const formats = [];
  if (data.media_url_https) formats.push({ label: 'Image', quality: 'Original', type: 'image', url: data.media_url_https });
  (data.variants || []).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0)).slice(0, 3).forEach((v, i) => {
    formats.push({ label: 'MP4 ' + (i === 0 ? 'HD' : i === 1 ? '720p' : 'SD'), quality: v.bitrate ? Math.round(v.bitrate / 1000) + 'kbps' : 'Video', type: 'video', url: v.url });
  });
  return {
    platform: 'twitter',
    title: data.text || 'Twitter Media',
    thumbnail: '',
    formats,
    sourceUrl: url,
  };
}

export async function searchVideos(query) {
  const results = await youtubeSearch(query);
  return Array.isArray(results) ? results.slice(0, 12) : [];
}

export async function downloadYoutube(url) {
  return await youtubedlv2(url);
}

export async function downloadYoutubeMP3(url) {
  const info = await youtubedlv2(url);
  const formats = (info.formats || []).filter(f => f.hasAudio && !f.hasVideo);
  return { title: info.title, thumbnail: info.thumbnail, duration: info.duration, audioFormats: formats.slice(0, 5) };
}

export async function downloadTikTok(url) { return await tiktokdl(url); }
export async function downloadFacebook(url) { return await facebookdl(url); }
export async function downloadInstagram(url) {
  if (url.includes('/stories/')) return await instagramStory(url);
  return await instagramdl(url);
}
export async function downloadPinterest(url) { return await pinterest(url); }

export async function downloadSoundCloud(url) { return await savefrom(url); }
export async function downloadThreads(url) {
  try { return await snapsave(url); } catch { return await savefrom(url); }
}

export async function downloadSpotify(url) {
  const trackId = url.match(/track[/]([a-zA-Z0-9]+)/)?.[1];
  if (!trackId) throw new Error('Invalid Spotify track URL.');
  const oEmbed = await axios.get('https://open.spotify.com/oembed?url=' + encodeURIComponent(url), { headers: { 'User-Agent': UA }, timeout: 12000 });
  return {
    title: oEmbed.data.title,
    artist: oEmbed.data.author_name,
    thumbnail: oEmbed.data.thumbnail_url,
    embedUrl: 'https://open.spotify.com/embed/track/' + trackId,
    trackId,
    note: 'Spotify does not allow public audio download. Use the embed URL to play a 30s preview.',
  };
}

export async function downloadTeraBox(url) {
  const headers = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' };
  const res = await axios.get(url, { headers, timeout: 15000, maxRedirects: 10 });
  const $ = cheerio.load(res.data);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'TeraBox File';
  const fileUrl = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content') || null;
  const thumbnail = $('meta[property="og:image"]').attr('content') || null;
  if (!fileUrl) throw new Error('Could not extract TeraBox file. It may be private or expired.');
  return { title, fileUrl, thumbnail, source: url };
}

export async function downloadGoogleDrive(url) {
  const idMatch = url.match(/[-\w]{25,}/);
  if (!idMatch) throw new Error('Invalid Google Drive URL.');
  const fileId = idMatch[0];
  return {
    title: 'Google Drive File',
    fileId,
    directDownloadUrl: 'https://drive.google.com/uc?export=download&id=' + fileId,
    viewUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
    previewUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
  };
}

export async function downloadCapCut(url) {
  const headers = { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', 'Referer': 'https://www.capcut.com/' };
  const response = await axios.get(url, { headers, timeout: 15000 });
  const $ = cheerio.load(response.data);
  const title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'CapCut Template';
  const videoUrl = $('meta[property="og:video"]').attr('content') || $('meta[property="og:video:url"]').attr('content') || null;
  const thumbnail = $('meta[property="og:image"]').attr('content') || null;
  if (!videoUrl) throw new Error('Could not extract CapCut video. The template may be private.');
  return { title, videoUrl, thumbnail, source: url };
}

export async function streamYoutube(url, itag, res) {
  const info = await ytdlCore.getInfo(url);
  const format = ytdlCore.chooseFormat(info.formats, { quality: itag });
  const title = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, '').slice(0, 60);
  const isAudio = !format.hasVideo;
  res.setHeader('Content-Disposition', 'attachment; filename="' + title + (isAudio ? '.mp3' : '.mp4') + '"');
  res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');
  if (format.contentLength) res.setHeader('Content-Length', format.contentLength);
  ytdlCore.downloadFromInfo(info, { format }).pipe(res);
}
