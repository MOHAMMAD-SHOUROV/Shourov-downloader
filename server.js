import express from 'express';
import {
  downloadYoutube, downloadYoutubeMP3, downloadTikTok, downloadFacebook,
  downloadInstagram, downloadPinterest, downloadSoundCloud, downloadThreads,
  downloadSpotify, downloadTeraBox, downloadGoogleDrive, downloadCapCut,
  resolveUrl, searchVideos, streamYoutube,
} from './src/index.js';

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const ENDPOINTS = [
  { id:'youtube',  icon:'▶️',  name:'YouTube',        desc:'Videos, Shorts & all quality formats',  path:'/api/youtube',   color:'#FF0000', glow:'rgba(255,0,0,0.2)',      example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'video' },
  { id:'ytplayer', icon:'🎬',  name:'YouTube Player', desc:'Built-in video player — watch inline',  path:'/api/youtube',   color:'#FF4444', glow:'rgba(255,68,68,0.2)',    example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'video', special:'ytplayer' },
  { id:'ytmp3',    icon:'🎵',  name:'YouTube MP3',    desc:'Extract audio & MP3 from any video',    path:'/api/ytmp3',     color:'#FF6B00', glow:'rgba(255,107,0,0.2)',    example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'audio' },
  { id:'tiktok',   icon:'🎞',  name:'TikTok',         desc:'Download without watermark',            path:'/api/tiktok',    color:'#69C9D0', glow:'rgba(105,201,208,0.2)', example:'https://www.tiktok.com/@username/video/123',   category:'video' },
  { id:'facebook', icon:'📘',  name:'Facebook',       desc:'Videos, Reels & Watch content',         path:'/api/facebook',  color:'#1877F2', glow:'rgba(24,119,242,0.2)',  example:'https://www.facebook.com/watch/?v=123',        category:'video' },
  { id:'instagram',icon:'📸',  name:'Instagram',      desc:'Reels, Posts & Stories',                path:'/api/instagram', color:'#E1306C', glow:'rgba(225,48,108,0.2)', example:'https://www.instagram.com/p/XXXXXXXXX/',       category:'video' },
  { id:'pinterest',icon:'📌',  name:'Pinterest',      desc:'Videos & images from pins',             path:'/api/pinterest', color:'#E60023', glow:'rgba(230,0,35,0.2)',    example:'https://www.pinterest.com/pin/123/',           category:'image' },
  { id:'soundcloud',icon:'☁️', name:'SoundCloud',     desc:'Download tracks & playlists',           path:'/api/soundcloud',color:'#FF5500', glow:'rgba(255,85,0,0.2)',    example:'https://soundcloud.com/artist/track-name',     category:'audio' },
  { id:'threads',  icon:'🧵',  name:'Threads',        desc:'Videos & media from Threads posts',     path:'/api/threads',   color:'#555555', glow:'rgba(255,255,255,0.1)', example:'https://www.threads.net/@user/post/XXXXXXXXX', category:'video' },
  { id:'spotify',  icon:'🎧',  name:'Spotify',        desc:'Track info & 30s preview embed',        path:'/api/spotify',   color:'#1DB954', glow:'rgba(29,185,84,0.2)',   example:'https://open.spotify.com/track/4uLU6hMCjMI75M1A7p8fSa', category:'audio' },
  { id:'terabox',  icon:'☁️',  name:'TeraBox',        desc:'Direct file download links',            path:'/api/terabox',   color:'#0099FF', glow:'rgba(0,153,255,0.2)',   example:'https://www.terabox.com/s/XXXXXXXXX',          category:'file' },
  { id:'gdrive',   icon:'📁',  name:'Google Drive',   desc:'Generate direct download links',        path:'/api/gdrive',    color:'#4285F4', glow:'rgba(66,133,244,0.2)',  example:'https://drive.google.com/file/d/FILE_ID/view',  category:'file' },
  { id:'capcut',   icon:'✂️',  name:'CapCut',         desc:'Template video downloader',             path:'/api/capcut',    color:'#9B59B6', glow:'rgba(155,89,182,0.2)', example:'https://www.capcut.com/template/123',          category:'video' },
];

const CATEGORIES = [
  { id:'all',   label:'All Platforms' },
  { id:'video', label:'Video' },
  { id:'audio', label:'Audio' },
  { id:'image', label:'Image' },
  { id:'file',  label:'File' },
];

app.get('/favicon.ico', (req, res) => res.status(204).end());

app.get('/', (req, res) => {
  const catBtns = CATEGORIES.map(c =>
    `<button class="cat-btn${c.id==='all'?' active':''}" data-cat="${c.id}" onclick="filterCat('${c.id}',this)">${c.label}</button>`
  ).join('');

  const cards = ENDPOINTS.map(ep => `
    <div class="ep-card" data-cat="${ep.category}" data-id="${ep.id}" style="--c:${ep.color};--g:${ep.glow}">
      <div class="ep-top">
        <span class="ep-icon">${ep.icon}</span>
        <div class="ep-info">
          <div class="ep-name">${ep.name}</div>
          <div class="ep-desc">${ep.desc}</div>
        </div>
        <span class="ep-badge">${ep.category.toUpperCase()}</span>
      </div>
      <div class="ep-url">
        <code>${ep.path}?url=<span class="hl">{url}</span></code>
        <button class="btn-copy" onclick="copyUrl('${ep.path}','${ep.example}')">Copy</button>
      </div>
      <div class="ep-row">
        <input class="ep-input" id="inp-${ep.id}" type="text" placeholder="${ep.example}"/>
        <button class="btn-test" onclick="testApi('${ep.id}','${ep.path}','${ep.special||''}')">Test ▶</button>
      </div>
    </div>
  `).join('');

  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>SHOUROV ALL DOWNLOADER — API Panel</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
:root{
  --bg:#07090f;--s1:#0d1117;--s2:#161b24;--s3:#1e2636;
  --b:rgba(255,255,255,0.07);--t:#e6edf3;--m:#7d8590;
  --a:#7c3aed;--a2:#06b6d4;--gn:#10b981;--r:14px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html{scroll-behavior:smooth;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--t);min-height:100vh;overflow-x:hidden;}
body::before{content:'';position:fixed;inset:0;background:
  radial-gradient(ellipse 90% 50% at 15% 5%,rgba(124,58,237,.09) 0%,transparent 55%),
  radial-gradient(ellipse 70% 45% at 85% 85%,rgba(6,182,212,.07) 0%,transparent 55%),
  radial-gradient(ellipse 50% 30% at 50% 50%,rgba(16,185,129,.04) 0%,transparent 55%);
pointer-events:none;z-index:0;}
.wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 16px 80px;}

/* ── Profile ── */
.profile-bar{display:flex;align-items:center;justify-content:space-between;padding:20px 0 0;}
.profile-left{display:flex;align-items:center;gap:14px;}
.avatar{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:800;color:#fff;flex-shrink:0;border:2px solid rgba(124,58,237,.4);box-shadow:0 0 20px rgba(124,58,237,.35);}
.profile-name{font-size:1rem;font-weight:700;color:var(--t);}
.profile-role{font-size:11px;color:var(--m);margin-top:2px;}
.live-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:100px;padding:6px 14px;font-size:11px;font-weight:700;color:#10b981;letter-spacing:.09em;text-transform:uppercase;}
.live-dot{width:7px;height:7px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}

/* ── Hero ── */
.hero{text-align:center;padding:40px 16px 32px;}
.hero h1{font-size:clamp(1.8rem,5vw,3.2rem);font-weight:900;letter-spacing:-.03em;line-height:1.08;background:linear-gradient(135deg,#fff 0%,#c4b5fd 45%,#67e8f9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:12px;}
.hero-sub{font-size:.95rem;color:var(--m);max-width:480px;margin:0 auto 24px;line-height:1.65;}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:0;}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--b);border-radius:100px;padding:6px 14px;font-size:12px;color:var(--t);font-weight:500;}

/* ── UNIVERSAL DOWNLOADER BOX ── */
.dl-box{background:linear-gradient(135deg,rgba(124,58,237,.12),rgba(6,182,212,.08));border:1px solid rgba(124,58,237,.3);border-radius:20px;padding:28px;margin:28px 0;}
.dl-box-title{font-size:1.05rem;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:10px;}
.dl-box-title span{font-size:1.3rem;}
.dl-box-sub{font-size:12.5px;color:var(--m);margin-bottom:20px;}
.dl-input-row{display:flex;gap:10px;margin-bottom:0;}
.dl-input-row input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:12px;padding:14px 18px;color:var(--t);font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s,box-shadow .2s;}
.dl-input-row input:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.15);}
.dl-input-row input::placeholder{color:var(--m);}
.btn-dl-fetch{flex-shrink:0;background:linear-gradient(135deg,#7c3aed,#4c1d95);color:#fff;border:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s,transform .1s;white-space:nowrap;}
.btn-dl-fetch:hover{opacity:.85;}
.btn-dl-fetch:disabled{opacity:.4;cursor:not-allowed;}

/* Download result */
.dl-result{margin-top:20px;display:none;}
.dl-result.show{display:block;}
.dl-media-info{display:flex;gap:16px;align-items:flex-start;margin-bottom:18px;flex-wrap:wrap;}
.dl-thumb{width:120px;height:75px;object-fit:cover;border-radius:10px;background:var(--s2);flex-shrink:0;}
.dl-thumb-placeholder{width:120px;height:75px;border-radius:10px;background:linear-gradient(135deg,var(--s2),var(--s3));flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:2rem;}
.dl-meta{flex:1;min-width:0;}
.dl-meta-title{font-size:.97rem;font-weight:700;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dl-meta-sub{font-size:12px;color:var(--m);display:flex;gap:12px;flex-wrap:wrap;}
.dl-formats{display:flex;flex-wrap:wrap;gap:10px;}
.fmt-btn{display:flex;align-items:center;gap:10px;background:var(--s1);border:1px solid var(--b);border-radius:12px;padding:12px 16px;cursor:pointer;transition:all .2s;text-align:left;font-family:'Inter',sans-serif;min-width:160px;flex:1;}
.fmt-btn:hover{border-color:rgba(124,58,237,.5);background:rgba(124,58,237,.08);transform:translateY(-1px);}
.fmt-icon{font-size:1.4rem;flex-shrink:0;}
.fmt-info{flex:1;min-width:0;}
.fmt-label{font-size:13px;font-weight:700;color:var(--t);}
.fmt-meta{font-size:11px;color:var(--m);margin-top:1px;}
.fmt-dl-icon{color:var(--a);font-size:1rem;flex-shrink:0;}
.dl-loading{display:flex;align-items:center;gap:12px;padding:20px 0;color:var(--m);font-size:14px;}
.dl-err{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:10px;padding:14px 18px;color:#ef4444;font-size:13px;}

/* ── SEARCH BOX ── */
.search-box{background:var(--s1);border:1px solid var(--b);border-radius:20px;padding:28px;margin-bottom:36px;}
.search-box-title{font-size:1.05rem;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:10px;}
.search-box-sub{font-size:12.5px;color:var(--m);margin-bottom:20px;}
.search-input-row{display:flex;gap:10px;}
.search-input-row input{flex:1;background:var(--s2);border:1px solid var(--b);border-radius:12px;padding:14px 18px;color:var(--t);font-size:14px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;}
.search-input-row input:focus{border-color:var(--a2);}
.search-input-row input::placeholder{color:var(--m);}
.btn-search{flex-shrink:0;background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;border:none;border-radius:12px;padding:14px 24px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s;white-space:nowrap;}
.btn-search:hover{opacity:.85;}
.btn-search:disabled{opacity:.4;cursor:not-allowed;}
.search-results{margin-top:20px;display:none;}
.search-results.show{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;}
.sr-card{background:var(--s2);border:1px solid var(--b);border-radius:12px;overflow:hidden;transition:transform .15s,border-color .2s;}
.sr-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.14);}
.sr-thumb{width:100%;aspect-ratio:16/9;object-fit:cover;background:var(--s3);}
.sr-body{padding:12px;}
.sr-title{font-size:12.5px;font-weight:600;line-height:1.4;margin-bottom:6px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.sr-meta{font-size:11px;color:var(--m);margin-bottom:10px;display:flex;gap:8px;flex-wrap:wrap;}
.btn-sr-dl{width:100%;background:linear-gradient(135deg,var(--a),#4c1d95);color:#fff;border:none;border-radius:8px;padding:9px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s;}
.btn-sr-dl:hover{opacity:.85;}
.search-loading{display:flex;align-items:center;gap:12px;padding:20px 0;color:var(--m);font-size:14px;}

/* ── Stats ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:var(--s1);border:1px solid var(--b);border-radius:var(--r);overflow:hidden;margin-bottom:36px;}
.stat{text-align:center;padding:16px 8px;border-right:1px solid var(--b);}
.stat:last-child{border-right:none;}
.stat-v{font-size:1.5rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.stat-l{font-size:10px;color:var(--m);margin-top:3px;text-transform:uppercase;letter-spacing:.08em;}

/* ── YouTube Player ── */
.yt-section{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:22px;margin-bottom:36px;}
.yt-section h2{font-size:.8rem;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;}
.yt-row{display:flex;gap:10px;flex-wrap:wrap;}
.yt-row input{flex:1;min-width:200px;background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:10px 14px;color:var(--t);font-size:13px;outline:none;font-family:'Inter',sans-serif;}
.yt-row input:focus{border-color:#FF0000;}
.yt-play-btn{background:#FF0000;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;white-space:nowrap;}
.yt-play-btn:hover{opacity:.85;}
.yt-frame{margin-top:14px;aspect-ratio:16/9;width:100%;border-radius:10px;overflow:hidden;display:none;}
.yt-frame.on{display:block;}
.yt-frame iframe{width:100%;height:100%;border:none;}

/* ── Filter & Grid ── */
.sh{font-size:.78rem;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.sh::after{content:'';flex:1;height:1px;background:var(--b);}
.filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;align-items:center;}
.filter-label{font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.09em;}
.cat-btn{background:var(--s2);border:1px solid var(--b);color:var(--m);border-radius:100px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;}
.cat-btn:hover{border-color:rgba(255,255,255,.18);color:var(--t);}
.cat-btn.active{background:rgba(124,58,237,.2);border-color:rgba(124,58,237,.5);color:#c4b5fd;}
.ep-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:14px;margin-bottom:40px;}
@media(max-width:520px){.ep-grid{grid-template-columns:1fr;}}

/* ── Endpoint Card ── */
.ep-card{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:18px;position:relative;overflow:hidden;transition:border-color .2s,box-shadow .2s,transform .15s;}
.ep-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--c),transparent);}
.ep-card:hover{border-color:rgba(255,255,255,.12);box-shadow:0 0 28px var(--g);transform:translateY(-2px);}
.ep-card.hidden{display:none;}
.ep-top{display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;}
.ep-icon{font-size:1.4rem;flex-shrink:0;margin-top:1px;}
.ep-info{flex:1;min-width:0;}
.ep-name{font-size:.97rem;font-weight:700;margin-bottom:2px;}
.ep-desc{font-size:11.5px;color:var(--m);line-height:1.5;}
.ep-badge{flex-shrink:0;font-size:9.5px;font-weight:800;padding:3px 8px;border-radius:6px;letter-spacing:.07em;border:1px solid rgba(255,255,255,.12);color:var(--m);background:var(--s2);margin-top:2px;}
.ep-url{background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:9px 12px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--m);display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;overflow:hidden;}
.ep-url code{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.hl{color:#f59e0b;}
.btn-copy{flex-shrink:0;background:var(--s3);border:1px solid var(--b);color:var(--m);font-size:10.5px;font-weight:600;padding:4px 10px;border-radius:6px;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;white-space:nowrap;}
.btn-copy:hover{color:var(--t);border-color:rgba(255,255,255,.2);}
.ep-row{display:flex;gap:8px;}
.ep-input{flex:1;min-width:0;background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:9px 12px;color:var(--t);font-size:12px;font-family:'Inter',sans-serif;outline:none;transition:border-color .2s;}
.ep-input:focus{border-color:var(--c);}
.ep-input::placeholder{color:var(--m);}
.btn-test{flex-shrink:0;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,var(--a),#4c1d95);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:12.5px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s,transform .1s;white-space:nowrap;}
.btn-test:hover{opacity:.85;}
.btn-test:active{transform:scale(.97);}

/* ── Modal ── */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.78);backdrop-filter:blur(6px);z-index:100;align-items:center;justify-content:center;padding:16px;}
.overlay.open{display:flex;}
.modal{background:var(--s1);border:1px solid var(--b);border-radius:20px;width:100%;max-width:740px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.7);}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--b);}
.modal-title{font-size:14px;font-weight:700;font-family:'JetBrains Mono',monospace;}
.modal-st{font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:100px;}
.st-ok{background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);}
.st-err{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);}
.st-load{background:rgba(124,58,237,.15);color:#a78bfa;border:1px solid rgba(124,58,237,.3);}
.modal-x{background:var(--s2);border:1px solid var(--b);color:var(--m);width:30px;height:30px;border-radius:8px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.modal-x:hover{color:var(--t);}
.modal-bd{flex:1;overflow-y:auto;padding:18px 20px;}
.modal-bd pre{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.65;color:#a78bfa;white-space:pre-wrap;word-break:break-all;}
.modal-spin{display:flex;align-items:center;justify-content:center;gap:12px;padding:48px;color:var(--m);}
@keyframes spin{to{transform:rotate(360deg);}}
.spinner{width:22px;height:22px;border:2px solid var(--b);border-top-color:var(--a);border-radius:50%;animation:spin .7s linear infinite;}
.yt-modal-player{margin-top:16px;}
.yt-modal-player iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:10px;}

/* ── Usage ── */
.usage-box{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:22px 24px;margin-bottom:48px;}
.usage-box pre{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.7;color:#e2e8f0;white-space:pre-wrap;word-break:break-all;}

/* ── Footer / Toast ── */
footer{text-align:center;padding:28px 16px;border-top:1px solid var(--b);color:var(--m);font-size:12.5px;}
footer strong{color:var(--t);}
.toast{position:fixed;bottom:20px;right:20px;background:var(--s2);border:1px solid rgba(16,185,129,.4);color:#10b981;padding:11px 18px;border-radius:10px;font-size:12.5px;font-weight:600;z-index:200;transform:translateY(80px);opacity:0;transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.toast.show{transform:translateY(0);opacity:1;}

/* ── Mobile ── */
@media(max-width:600px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .stats .stat:nth-child(2){border-right:none;}
  .stats .stat:nth-child(3){border-top:1px solid var(--b);}
  .stats .stat:nth-child(4){border-top:1px solid var(--b);border-right:none;}
  .profile-bar{flex-direction:column;align-items:flex-start;gap:14px;}
  .dl-input-row,.search-input-row{flex-direction:column;}
  .btn-dl-fetch,.btn-search{width:100%;}
  .fmt-btn{min-width:100%;}
}
</style>
</head>
<body>
<div class="wrap">

<!-- Profile Bar -->
<div class="profile-bar">
  <div class="profile-left">
    <div class="avatar">AS</div>
    <div>
      <div class="profile-name">Alihsan Shourov</div>
      <div class="profile-role">Developer · All Downloader API</div>
    </div>
  </div>
  <div class="live-badge"><span class="live-dot"></span>Live API • All Systems Operational</div>
</div>

<!-- Hero -->
<div class="hero">
  <h1>SHOUROV ALL DOWNLOADER<br/>API Panel</h1>
  <p class="hero-sub">One panel, every platform. Built for Messenger, WhatsApp & Telegram bots, automation, and developers.</p>
  <div class="chips">
    <span class="chip">⚡ Ultra Fast</span>
    <span class="chip">📡 Clean JSON</span>
    <span class="chip">📱 Mobile Friendly</span>
    <span class="chip">🤖 Bot Ready</span>
    <span class="chip">13 Endpoints</span>
  </div>
</div>

<!-- ═══ UNIVERSAL DOWNLOADER BOX ═══ -->
<div class="dl-box">
  <div class="dl-box-title"><span>⬇️</span> Universal Downloader</div>
  <div class="dl-box-sub">Paste any link — YouTube, TikTok, Facebook, Instagram, Pinterest, Twitter — get MP4, HD Video, Audio & size options instantly.</div>
  <div class="dl-input-row">
    <input id="dl-url" type="text" placeholder="Paste a video/media URL here (YouTube, TikTok, Facebook, Instagram…)"/>
    <button class="btn-dl-fetch" id="dl-fetch-btn" onclick="fetchDownload()">⬇ Get Download Options</button>
  </div>
  <div class="dl-result" id="dl-result"></div>
</div>

<!-- ═══ SEARCH BOX ═══ -->
<div class="search-box">
  <div class="search-box-title"><span>🔍</span> Search & Download</div>
  <div class="search-box-sub">Type any song name, drama title, or video — results with download buttons will appear instantly.</div>
  <div class="search-input-row">
    <input id="search-q" type="text" placeholder="Search: Bangla song, natok, movie, music video…"/>
    <button class="btn-search" id="search-btn" onclick="doSearch()">🔍 Search</button>
  </div>
  <div id="search-results" class="search-results"></div>
</div>

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-v">13</div><div class="stat-l">Endpoints</div></div>
  <div class="stat"><div class="stat-v">JSON</div><div class="stat-l">Output</div></div>
  <div class="stat"><div class="stat-v">FREE</div><div class="stat-l">API Access</div></div>
  <div class="stat"><div class="stat-v">24/7</div><div class="stat-l">Uptime</div></div>
</div>

<!-- YouTube Player -->
<div class="yt-section">
  <h2>▶ Built-in YouTube Player</h2>
  <div class="yt-row">
    <input id="yt-url" type="text" placeholder="Paste a YouTube URL or video ID to watch inline…"/>
    <button class="yt-play-btn" onclick="playYT()">▶ Play</button>
  </div>
  <div class="yt-frame" id="yt-frame">
    <iframe id="yt-iframe" allowfullscreen allow="autoplay; encrypted-media"></iframe>
  </div>
</div>

<!-- API Endpoints -->
<div class="sh">API Endpoints</div>
<div class="filter-row">
  <span class="filter-label">Filter:</span>
  ${catBtns}
</div>
<div class="ep-grid" id="grid">${cards}</div>

<!-- Usage -->
<div class="sh">Quick Usage</div>
<div class="usage-box">
  <div style="font-size:11px;color:var(--m);margin-bottom:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Example Request</div>
  <pre>GET /api/youtube?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ

<span style="color:#10b981">// Response</span>
{
  "success": true,
  "data": { "title": "...", "formats": [...] }
}</pre>
</div>

</div><!-- /wrap -->

<footer>Built with 💜 by <strong>Alihsan Shourov</strong> &nbsp;·&nbsp; SHOUROV ALL DOWNLOADER API Panel</footer>

<!-- Modal -->
<div class="overlay" id="overlay">
  <div class="modal">
    <div class="modal-hd">
      <div class="modal-title" id="m-title">Response</div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="modal-st" id="m-st"></span>
        <button class="modal-x" onclick="closeModal()">×</button>
      </div>
    </div>
    <div class="modal-bd" id="m-body"></div>
  </div>
</div>

<div class="toast" id="toast">✅ Copied!</div>

<script src="/panel.js"></script>
</body>
</html>`);
});

async function handle(fn, req, res) {
  const url = req.query.url;
  if (!url) return res.status(400).json({ success: false, error: 'Missing ?url= parameter' });
  try {
    const data = await fn(url);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message || 'Request failed' });
  }
}

app.get('/api/resolve',   (req, res) => handle(resolveUrl, req, res));
app.get('/api/search',    async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ success: false, error: 'Missing ?q= parameter' });
  try {
    const data = await searchVideos(q);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/dl', async (req, res) => {
  const { url, itag } = req.query;
  if (!url || !itag) return res.status(400).json({ error: 'Missing url or itag' });
  try {
    await streamYoutube(url, parseInt(itag), res);
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

app.get('/api/youtube',    (req, res) => handle(downloadYoutube, req, res));
app.get('/api/ytmp3',      (req, res) => handle(downloadYoutubeMP3, req, res));
app.get('/api/tiktok',     (req, res) => handle(downloadTikTok, req, res));
app.get('/api/facebook',   (req, res) => handle(downloadFacebook, req, res));
app.get('/api/instagram',  (req, res) => handle(downloadInstagram, req, res));
app.get('/api/pinterest',  (req, res) => handle(downloadPinterest, req, res));
app.get('/api/soundcloud', (req, res) => handle(downloadSoundCloud, req, res));
app.get('/api/threads',    (req, res) => handle(downloadThreads, req, res));
app.get('/api/spotify',    (req, res) => handle(downloadSpotify, req, res));
app.get('/api/terabox',    (req, res) => handle(downloadTeraBox, req, res));
app.get('/api/gdrive',     (req, res) => handle(downloadGoogleDrive, req, res));
app.get('/api/capcut',     (req, res) => handle(downloadCapCut, req, res));

app.listen(PORT, '0.0.0.0', () => {
  console.log('SHOUROV ALL DOWNLOADER API Panel running on port ' + PORT);
});
