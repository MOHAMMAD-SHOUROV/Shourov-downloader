import express from 'express';
import {
  downloadYoutube, downloadYoutubeMP3, downloadTikTok, downloadFacebook,
  downloadInstagram, downloadPinterest, downloadSoundCloud, downloadThreads,
  downloadSpotify, downloadTeraBox, downloadGoogleDrive, downloadCapCut,
} from './src/index.js';

const app = express();
const PORT = 5000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ENDPOINTS = [
  { id:'youtube',  icon:'▶️',  name:'YouTube',       desc:'Videos, Shorts & all quality formats',   path:'/api/youtube',  color:'#FF0000', glow:'rgba(255,0,0,0.2)',      example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'video' },
  { id:'ytplayer', icon:'🎬',  name:'YouTube Player', desc:'Built-in video player — watch inline',   path:'/api/youtube',  color:'#FF4444', glow:'rgba(255,68,68,0.2)',    example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'video', special:'ytplayer' },
  { id:'ytmp3',    icon:'🎵',  name:'YouTube MP3',    desc:'Extract audio & MP3 from any video',     path:'/api/ytmp3',    color:'#FF6B00', glow:'rgba(255,107,0,0.2)',    example:'https://www.youtube.com/watch?v=dQw4w9WgXcQ', category:'audio' },
  { id:'tiktok',   icon:'🎞',  name:'TikTok',         desc:'Download without watermark',             path:'/api/tiktok',   color:'#69C9D0', glow:'rgba(105,201,208,0.2)', example:'https://www.tiktok.com/@username/video/123',   category:'video' },
  { id:'facebook', icon:'📘',  name:'Facebook',        desc:'Videos, Reels & Watch content',         path:'/api/facebook', color:'#1877F2', glow:'rgba(24,119,242,0.2)',  example:'https://www.facebook.com/watch/?v=123',        category:'video' },
  { id:'instagram',icon:'📸',  name:'Instagram',       desc:'Reels, Posts & Stories',                path:'/api/instagram',color:'#E1306C', glow:'rgba(225,48,108,0.2)', example:'https://www.instagram.com/p/XXXXXXXXX/',       category:'video' },
  { id:'pinterest',icon:'📌',  name:'Pinterest',       desc:'Videos & images from pins',             path:'/api/pinterest',color:'#E60023', glow:'rgba(230,0,35,0.2)',    example:'https://www.pinterest.com/pin/123/',           category:'image' },
  { id:'soundcloud',icon:'☁️', name:'SoundCloud',      desc:'Download tracks & playlists',           path:'/api/soundcloud',color:'#FF5500',glow:'rgba(255,85,0,0.2)',    example:'https://soundcloud.com/artist/track-name',     category:'audio' },
  { id:'threads',  icon:'🧵',  name:'Threads',         desc:'Videos & media from Threads posts',     path:'/api/threads',  color:'#000000', glow:'rgba(255,255,255,0.1)', example:'https://www.threads.net/@user/post/XXXXXXXXX', category:'video' },
  { id:'spotify',  icon:'🎧',  name:'Spotify',         desc:'Track info & 30s preview embed',        path:'/api/spotify',  color:'#1DB954', glow:'rgba(29,185,84,0.2)',   example:'https://open.spotify.com/track/4uLU6hMCjMI75M1A7p8fSa', category:'audio' },
  { id:'terabox',  icon:'☁️',  name:'TeraBox',         desc:'Direct file download links',            path:'/api/terabox',  color:'#0099FF', glow:'rgba(0,153,255,0.2)',   example:'https://www.terabox.com/s/XXXXXXXXX',          category:'file' },
  { id:'gdrive',   icon:'📁',  name:'Google Drive',    desc:'Generate direct download links',        path:'/api/gdrive',   color:'#4285F4', glow:'rgba(66,133,244,0.2)',  example:'https://drive.google.com/file/d/FILE_ID/view',  category:'file' },
  { id:'capcut',   icon:'✂️',  name:'CapCut',          desc:'Template video downloader',             path:'/api/capcut',   color:'#9B59B6', glow:'rgba(155,89,182,0.2)', example:'https://www.capcut.com/template/123',          category:'video' },
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
  const origin = req.headers.origin || `http://localhost:${PORT}`;

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
        <button class="btn-test" onclick="testApi('${ep.id}','${ep.path}','${ep.special||''}')">
          Test ▶
        </button>
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

/* ── wrap ── */
.wrap{position:relative;z-index:1;max-width:1160px;margin:0 auto;padding:0 16px 80px;}

/* ── hero ── */
.hero{text-align:center;padding:52px 16px 40px;}
.live-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:100px;padding:6px 16px;font-size:11px;font-weight:700;color:#10b981;letter-spacing:.09em;text-transform:uppercase;margin-bottom:22px;}
.live-dot{width:7px;height:7px;background:#10b981;border-radius:50%;box-shadow:0 0 8px #10b981;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}
.hero h1{font-size:clamp(1.9rem,5vw,3.4rem);font-weight:900;letter-spacing:-.03em;line-height:1.08;background:linear-gradient(135deg,#fff 0%,#c4b5fd 45%,#67e8f9 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:14px;}
.hero-sub{font-size:.97rem;color:var(--m);max-width:500px;margin:0 auto 28px;line-height:1.65;}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:36px;}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--s2);border:1px solid var(--b);border-radius:100px;padding:6px 14px;font-size:12px;color:var(--t);font-weight:500;}

/* ── stats ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);background:var(--s1);border:1px solid var(--b);border-radius:var(--r);overflow:hidden;margin-bottom:40px;}
.stat{text-align:center;padding:18px 8px;border-right:1px solid var(--b);}
.stat:last-child{border-right:none;}
.stat-v{font-size:1.6rem;font-weight:900;background:linear-gradient(135deg,#a78bfa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
.stat-l{font-size:10px;color:var(--m);margin-top:3px;text-transform:uppercase;letter-spacing:.08em;}

/* ── yt player ── */
.yt-section{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:22px 22px;margin-bottom:36px;display:none;}
.yt-section.active{display:block;}
.yt-section h2{font-size:.85rem;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.1em;margin-bottom:14px;}
.yt-player-wrap{display:flex;gap:12px;flex-wrap:wrap;}
.yt-player-wrap input{flex:1;min-width:200px;background:var(--s2);border:1px solid var(--b);border-radius:8px;padding:10px 14px;color:var(--t);font-size:13px;outline:none;font-family:'Inter',sans-serif;}
.yt-player-wrap input:focus{border-color:#FF0000;}
.yt-play-btn{background:#FF0000;color:#fff;border:none;border-radius:8px;padding:10px 20px;font-size:13px;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:opacity .15s;white-space:nowrap;}
.yt-play-btn:hover{opacity:.85;}
.yt-frame-wrap{margin-top:14px;aspect-ratio:16/9;width:100%;border-radius:10px;overflow:hidden;display:none;}
.yt-frame-wrap.visible{display:block;}
.yt-frame-wrap iframe{width:100%;height:100%;border:none;}

/* ── filter ── */
.filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;align-items:center;}
.filter-label{font-size:11px;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.09em;margin-right:4px;}
.cat-btn{background:var(--s2);border:1px solid var(--b);color:var(--m);border-radius:100px;padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .15s;}
.cat-btn:hover{border-color:rgba(255,255,255,.18);color:var(--t);}
.cat-btn.active{background:rgba(124,58,237,.2);border-color:rgba(124,58,237,.5);color:#c4b5fd;}

/* ── section heading ── */
.sh{font-size:.8rem;font-weight:700;color:var(--m);text-transform:uppercase;letter-spacing:.1em;margin-bottom:18px;display:flex;align-items:center;gap:10px;}
.sh::after{content:'';flex:1;height:1px;background:var(--b);}

/* ── grid ── */
.ep-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(460px,1fr));gap:14px;margin-bottom:40px;}
@media(max-width:520px){.ep-grid{grid-template-columns:1fr;}}

/* ── card ── */
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
.btn-test:disabled{opacity:.4;cursor:not-allowed;}

/* ── usage ── */
.usage-box{background:var(--s1);border:1px solid var(--b);border-radius:var(--r);padding:22px 24px;margin-bottom:48px;}
.usage-box pre{font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.7;color:#e2e8f0;white-space:pre-wrap;word-break:break-all;}

/* ── modal ── */
.overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.75);backdrop-filter:blur(5px);z-index:100;align-items:center;justify-content:center;padding:16px;}
.overlay.open{display:flex;}
.modal{background:var(--s1);border:1px solid var(--b);border-radius:20px;width:100%;max-width:740px;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,.7);}
.modal-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--b);}
.modal-title{font-size:14px;font-weight:700;display:flex;align-items:center;gap:10px;font-family:'JetBrains Mono',monospace;}
.modal-st{font-size:10.5px;font-weight:700;padding:3px 10px;border-radius:100px;}
.st-ok{background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);}
.st-err{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);}
.st-load{background:rgba(124,58,237,.15);color:#a78bfa;border:1px solid rgba(124,58,237,.3);}
.modal-x{background:var(--s2);border:1px solid var(--b);color:var(--m);width:30px;height:30px;border-radius:8px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:color .15s;flex-shrink:0;}
.modal-x:hover{color:var(--t);}
.modal-bd{flex:1;overflow-y:auto;padding:18px 20px;}
.modal-bd pre{font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.65;color:#a78bfa;white-space:pre-wrap;word-break:break-all;}
.modal-spin{display:flex;align-items:center;justify-content:center;gap:12px;padding:48px;color:var(--m);}
@keyframes spin{to{transform:rotate(360deg);}}
.spinner{width:22px;height:22px;border:2px solid var(--b);border-top-color:var(--a);border-radius:50%;animation:spin .7s linear infinite;}

/* ── yt player in modal ── */
.yt-modal-player{margin-top:16px;}
.yt-modal-player iframe{width:100%;aspect-ratio:16/9;border:none;border-radius:10px;}

/* ── footer ── */
footer{text-align:center;padding:28px 16px;border-top:1px solid var(--b);color:var(--m);font-size:12.5px;}
footer strong{color:var(--t);}

/* ── toast ── */
.toast{position:fixed;bottom:20px;right:20px;background:var(--s2);border:1px solid rgba(16,185,129,.4);color:#10b981;padding:11px 18px;border-radius:10px;font-size:12.5px;font-weight:600;z-index:200;transform:translateY(80px);opacity:0;transition:all .25s cubic-bezier(.34,1.56,.64,1);}
.toast.show{transform:translateY(0);opacity:1;}

/* ── mobile ── */
@media(max-width:600px){
  .stats{grid-template-columns:repeat(2,1fr);}
  .stats .stat:nth-child(2){border-right:none;}
  .stats .stat:nth-child(3){border-top:1px solid var(--b);}
  .stats .stat:nth-child(4){border-top:1px solid var(--b);border-right:none;}
  .hero h1{font-size:1.9rem;}
}
</style>
</head>
<body>
<div class="wrap">

<!-- Hero -->
<div class="hero">
  <div class="live-badge"><span class="live-dot"></span>Live API • All Systems Operational</div>
  <h1>SHOUROV ALL DOWNLOADER<br/>API Panel</h1>
  <p class="hero-sub">One panel, every platform. Clean JSON API built for Messenger, WhatsApp & Telegram bots, automation systems, and developers.</p>
  <div class="chips">
    <span class="chip">⚡ Ultra Fast</span>
    <span class="chip">📡 Clean JSON</span>
    <span class="chip">📱 Mobile Friendly</span>
    <span class="chip">🤖 Bot Ready</span>
    <span class="chip">🔄 Stable Server</span>
    <span class="chip">13 Endpoints</span>
  </div>
</div>

<!-- Stats -->
<div class="stats">
  <div class="stat"><div class="stat-v">13</div><div class="stat-l">Endpoints</div></div>
  <div class="stat"><div class="stat-v">JSON</div><div class="stat-l">Output</div></div>
  <div class="stat"><div class="stat-v">FREE</div><div class="stat-l">API Access</div></div>
  <div class="stat"><div class="stat-v">24/7</div><div class="stat-l">Uptime</div></div>
</div>

<!-- YouTube Player -->
<div class="yt-section active">
  <h2>▶ Built-in YouTube Player</h2>
  <div class="yt-player-wrap">
    <input id="yt-url" type="text" placeholder="Paste a YouTube URL or video ID to watch inline…"/>
    <button class="yt-play-btn" onclick="playYT()">▶ Play</button>
  </div>
  <div class="yt-frame-wrap" id="yt-frame-wrap">
    <iframe id="yt-iframe" allowfullscreen allow="autoplay; encrypted-media"></iframe>
  </div>
</div>

<!-- Filter -->
<div class="sh">API Endpoints</div>
<div class="filter-row">
  <span class="filter-label">Filter:</span>
  ${catBtns}
</div>

<!-- Cards -->
<div class="ep-grid" id="grid">
  ${cards}
</div>

<!-- Usage -->
<div class="sh">Quick Usage</div>
<div class="usage-box">
  <div style="font-size:11px;color:var(--m);margin-bottom:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Example Request</div>
  <pre>GET /api/youtube?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ

<span style="color:#10b981">// Response</span>
{
  "success": true,
  "data": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "thumbnail": "https://...",
    "formats": [ ... ]
  }
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
    <div class="modal-bd" id="m-body">
      <div class="modal-spin"><div class="spinner"></div>Fetching...</div>
    </div>
  </div>
</div>

<div class="toast" id="toast">✅ Copied!</div>

<script>
// ── YouTube Player ──
function playYT(){
  const raw = document.getElementById('yt-url').value.trim();
  if(!raw) return;
  let vid = '';
  try{
    const u = new URL(raw);
    if(u.hostname === 'youtu.be'){
      vid = u.pathname.slice(1).split('/')[0];
    } else {
      vid = u.searchParams.get('v') || u.pathname.split('/').pop();
    }
  } catch {
    vid = raw.split('/').pop().split('?')[0].split('&')[0];
  }
  vid = vid.split('?')[0].split('&')[0];
  if(!vid){ showToast('Invalid YouTube URL'); return; }
  const fw = document.getElementById('yt-frame-wrap');
  const fi = document.getElementById('yt-iframe');
  fi.src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0';
  fw.classList.add('visible');
}
document.getElementById('yt-url').addEventListener('keydown', e => { if(e.key==='Enter') playYT(); });

// ── Filter ──
function filterCat(cat, btn){
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ep-card').forEach(card => {
    card.classList.toggle('hidden', cat!=='all' && card.dataset.cat!==cat);
  });
}

// ── Copy ──
function copyUrl(path, example){
  const url = window.location.origin + path + '?url=' + encodeURIComponent(example);
  navigator.clipboard.writeText(url).then(()=>showToast('✅ Endpoint copied!'));
}

// ── Modal ──
function closeModal(){document.getElementById('overlay').classList.remove('open');}
document.getElementById('overlay').addEventListener('click', function(e){ if(e.target===this) closeModal(); });

// ── Test API ──
async function testApi(id, path, special){
  const inp = document.getElementById('inp-'+id);
  const url = (inp.value||inp.placeholder).trim();
  if(!url){ showToast('⚠️ Enter a URL first'); return; }

  const ov = document.getElementById('overlay');
  const body = document.getElementById('m-body');
  const st = document.getElementById('m-st');
  const title = document.getElementById('m-title');

  // YouTube player special mode
  if(special === 'ytplayer'){
    document.getElementById('yt-url').value = url;
    playYT();
    document.querySelector('.yt-section').scrollIntoView({behavior:'smooth'});
    showToast('▶ Playing in YouTube Player!');
    return;
  }

  title.textContent = path;
  st.className = 'modal-st st-load'; st.textContent = 'Loading…';
  body.innerHTML = '<div class="modal-spin"><div class="spinner"></div>Fetching response…</div>';
  ov.classList.add('open');

  try {
    const res = await fetch(path + '?url=' + encodeURIComponent(url));
    const data = await res.json();
    if(res.ok){
      st.className='modal-st st-ok'; st.textContent='200 OK';
      let extra = '';
      if(data.data?.embedUrl && path.includes('spotify')){
        extra = '<div class="yt-modal-player"><iframe src="'+data.data.embedUrl+'" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>';
      }
      body.innerHTML = extra + '<pre>' + syntaxHL(JSON.stringify(data,null,2)) + '</pre>';
    } else {
      st.className='modal-st st-err'; st.textContent=res.status+' Error';
      body.innerHTML='<pre style="color:#ef4444">'+JSON.stringify(data,null,2)+'</pre>';
    }
  } catch(e){
    st.className='modal-st st-err'; st.textContent='Network Error';
    body.innerHTML='<pre style="color:#ef4444">'+e.message+'</pre>';
  }
}

function syntaxHL(json){
  return json
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"([^"]+)":/g,'<span style="color:#7dd3fc">"$1"</span>:')
    .replace(/: "([^"]*)"/g,': <span style="color:#86efac">"$1"</span>')
    .replace(/: (-?[0-9][0-9.]*)/g,': <span style="color:#fb923c">$1</span>')
    .replace(/: (true|false)/g,': <span style="color:#fbbf24">$1</span>')
    .replace(/: (null)/g,': <span style="color:#f87171">$1</span>');
}

function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2200);
}
</script>
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
  console.log(`🚀 SHOUROV ALL DOWNLOADER API Panel → http://0.0.0.0:${PORT}`);
});
