import express from 'express';
import {
  downloadYoutube,
  downloadYoutubeMP3,
  downloadTikTok,
  downloadFacebook,
  downloadInstagram,
  downloadPinterest,
  downloadCapCut,
} from './src/index.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const BASE_URL = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : `http://localhost:${PORT}`;

const ENDPOINTS = [
  {
    id: 'youtube',
    icon: '▶️',
    name: 'YouTube Downloader',
    desc: 'Download YouTube videos with quality options',
    path: '/api/youtube',
    param: 'url',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#FF0000',
    glow: 'rgba(255,0,0,0.25)',
  },
  {
    id: 'ytmp3',
    icon: '🎵',
    name: 'YouTube MP3',
    desc: 'Extract audio/MP3 from YouTube videos',
    path: '/api/ytmp3',
    param: 'url',
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    color: '#FF6B00',
    glow: 'rgba(255,107,0,0.25)',
  },
  {
    id: 'tiktok',
    icon: '🎬',
    name: 'TikTok Downloader',
    desc: 'Download TikTok videos without watermark',
    path: '/api/tiktok',
    param: 'url',
    example: 'https://www.tiktok.com/@username/video/1234567890',
    color: '#69C9D0',
    glow: 'rgba(105,201,208,0.25)',
  },
  {
    id: 'facebook',
    icon: '📘',
    name: 'Facebook Downloader',
    desc: 'Download Facebook videos and reels',
    path: '/api/facebook',
    param: 'url',
    example: 'https://www.facebook.com/watch/?v=1234567890',
    color: '#1877F2',
    glow: 'rgba(24,119,242,0.25)',
  },
  {
    id: 'instagram',
    icon: '📸',
    name: 'Instagram Downloader',
    desc: 'Download Instagram reels, posts & stories',
    path: '/api/instagram',
    param: 'url',
    example: 'https://www.instagram.com/p/XXXXXXXXX/',
    color: '#E1306C',
    glow: 'rgba(225,48,108,0.25)',
  },
  {
    id: 'pinterest',
    icon: '📌',
    name: 'Pinterest Downloader',
    desc: 'Download Pinterest videos and images',
    path: '/api/pinterest',
    param: 'url',
    example: 'https://www.pinterest.com/pin/1234567890/',
    color: '#E60023',
    glow: 'rgba(230,0,35,0.25)',
  },
  {
    id: 'capcut',
    icon: '🎞',
    name: 'CapCut Downloader',
    desc: 'Download CapCut template videos',
    path: '/api/capcut',
    param: 'url',
    example: 'https://www.capcut.com/template/1234567890',
    color: '#9B59B6',
    glow: 'rgba(155,89,182,0.25)',
  },
];

app.get('/', (req, res) => {
  const endpointCards = ENDPOINTS.map(ep => `
    <div class="ep-card" data-id="${ep.id}" style="--ep-color:${ep.color};--ep-glow:${ep.glow}">
      <div class="ep-header">
        <span class="ep-icon">${ep.icon}</span>
        <div>
          <div class="ep-name">${ep.name}</div>
          <div class="ep-desc">${ep.desc}</div>
        </div>
        <span class="ep-badge">GET</span>
      </div>
      <div class="ep-path">
        <code>${BASE_URL}${ep.path}?${ep.param}=<span class="ep-param">{${ep.param}}</span></code>
        <button class="copy-btn" onclick="copyEndpoint('${ep.path}', '${ep.param}', '${ep.example}')">Copy</button>
      </div>
      <div class="ep-actions">
        <input class="ep-input" id="inp-${ep.id}" type="text" placeholder="${ep.example}" />
        <button class="test-btn" onclick="testEndpoint('${ep.id}', '${ep.path}', '${ep.param}')">
          <span>Test API</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
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
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg: #080b12;
      --surface: #0d1117;
      --surface2: #161b24;
      --surface3: #1e2636;
      --border: rgba(255,255,255,0.07);
      --text: #e6edf3;
      --muted: #7d8590;
      --accent: #7c3aed;
      --accent2: #06b6d4;
      --gold: #f59e0b;
      --green: #10b981;
      --radius: 14px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Background mesh ── */
    body::before {
      content: '';
      position: fixed;
      inset: 0;
      background:
        radial-gradient(ellipse 80% 50% at 20% 10%, rgba(124,58,237,0.08) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 80% 80%, rgba(6,182,212,0.06) 0%, transparent 60%);
      pointer-events: none;
      z-index: 0;
    }

    /* ── Layout ── */
    .wrapper { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; padding: 0 20px 80px; }

    /* ── Hero header ── */
    .hero {
      text-align: center;
      padding: 60px 20px 48px;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(124,58,237,0.15);
      border: 1px solid rgba(124,58,237,0.35);
      border-radius: 100px;
      padding: 6px 16px;
      font-size: 12px;
      font-weight: 600;
      color: #a78bfa;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 24px;
    }
    .hero-badge::before { content: ''; width: 7px; height: 7px; background: #10b981; border-radius: 50%; box-shadow: 0 0 8px #10b981; }
    .hero h1 {
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      line-height: 1.1;
      background: linear-gradient(135deg, #ffffff 0%, #a78bfa 50%, #06b6d4 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
    }
    .hero-sub {
      font-size: 1rem;
      color: var(--muted);
      max-width: 520px;
      margin: 0 auto 32px;
      line-height: 1.6;
    }
    .hero-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 40px;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 100px;
      padding: 7px 14px;
      font-size: 13px;
      color: var(--text);
      font-weight: 500;
    }

    /* ── Stats bar ── */
    .stats {
      display: flex;
      justify-content: center;
      gap: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      overflow: hidden;
      margin-bottom: 48px;
    }
    .stat {
      flex: 1;
      text-align: center;
      padding: 20px 10px;
      border-right: 1px solid var(--border);
    }
    .stat:last-child { border-right: none; }
    .stat-val {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, #a78bfa, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .stat-label { font-size: 11px; color: var(--muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }

    /* ── Section title ── */
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

    /* ── Endpoint grid ── */
    .ep-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(480px, 1fr));
      gap: 16px;
      margin-bottom: 48px;
    }
    @media (max-width: 540px) { .ep-grid { grid-template-columns: 1fr; } }

    .ep-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 20px;
      transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
      position: relative;
      overflow: hidden;
    }
    .ep-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--ep-color), transparent);
    }
    .ep-card:hover {
      border-color: rgba(255,255,255,0.14);
      box-shadow: 0 0 30px var(--ep-glow);
      transform: translateY(-2px);
    }

    .ep-header {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }
    .ep-icon {
      font-size: 1.5rem;
      line-height: 1;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .ep-name {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 3px;
    }
    .ep-desc {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.5;
    }
    .ep-badge {
      margin-left: auto;
      flex-shrink: 0;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.3);
      color: #10b981;
      font-size: 10px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 6px;
      letter-spacing: 0.06em;
    }

    .ep-path {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      color: var(--muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .ep-path code { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .ep-param { color: #f59e0b; }

    .copy-btn {
      flex-shrink: 0;
      background: var(--surface3);
      border: 1px solid var(--border);
      color: var(--muted);
      font-size: 11px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all 0.15s;
    }
    .copy-btn:hover { border-color: rgba(255,255,255,0.2); color: var(--text); }

    .ep-actions {
      display: flex;
      gap: 8px;
    }
    .ep-input {
      flex: 1;
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 9px 12px;
      color: var(--text);
      font-size: 12.5px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: border-color 0.2s;
      min-width: 0;
    }
    .ep-input:focus { border-color: var(--ep-color); }
    .ep-input::placeholder { color: var(--muted); }

    .test-btn {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, var(--accent), #5b21b6);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 9px 16px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: opacity 0.15s, transform 0.1s;
      white-space: nowrap;
    }
    .test-btn:hover { opacity: 0.85; }
    .test-btn:active { transform: scale(0.97); }
    .test-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    /* ── Response modal ── */
    .modal-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-overlay.open { display: flex; }
    .modal {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      width: 100%;
      max-width: 720px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
    }
    .modal-title {
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .modal-status {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 100px;
    }
    .status-ok { background: rgba(16,185,129,0.15); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
    .status-err { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
    .status-loading { background: rgba(124,58,237,0.15); color: #a78bfa; border: 1px solid rgba(124,58,237,0.3); }
    .modal-close {
      background: var(--surface2);
      border: 1px solid var(--border);
      color: var(--muted);
      width: 32px; height: 32px;
      border-radius: 8px;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .modal-close:hover { color: var(--text); }
    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
    }
    .modal-body pre {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      line-height: 1.65;
      color: #a78bfa;
      white-space: pre-wrap;
      word-break: break-all;
    }
    .modal-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      gap: 12px;
      color: var(--muted);
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .spinner {
      width: 24px; height: 24px;
      border: 2px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    /* ── Footer ── */
    .footer {
      text-align: center;
      padding: 32px 20px;
      border-top: 1px solid var(--border);
      color: var(--muted);
      font-size: 13px;
    }
    .footer strong { color: var(--text); }
    .footer a { color: #a78bfa; text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    /* ── Toast ── */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--surface2);
      border: 1px solid rgba(16,185,129,0.4);
      color: #10b981;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      z-index: 200;
      transform: translateY(80px);
      opacity: 0;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .toast.show { transform: translateY(0); opacity: 1; }
  </style>
</head>
<body>
<div class="wrapper">
  <!-- Hero -->
  <div class="hero">
    <div class="hero-badge">🟢 Live API • All Systems Operational</div>
    <h1>SHOUROV ALL DOWNLOADER<br/>API Panel</h1>
    <p class="hero-sub">One panel, all platforms. Fast JSON API for YouTube, TikTok, Instagram, Facebook, Pinterest & CapCut. Built for bots & automation.</p>
    <div class="hero-chips">
      <span class="chip">⚡ Ultra Fast</span>
      <span class="chip">📡 Clean JSON</span>
      <span class="chip">🤖 Bot Ready</span>
      <span class="chip">🔄 Stable Server</span>
      <span class="chip">🌐 7 Platforms</span>
    </div>
  </div>

  <!-- Stats -->
  <div class="stats">
    <div class="stat">
      <div class="stat-val">7</div>
      <div class="stat-label">Platforms</div>
    </div>
    <div class="stat">
      <div class="stat-val">7</div>
      <div class="stat-label">Endpoints</div>
    </div>
    <div class="stat">
      <div class="stat-val">JSON</div>
      <div class="stat-label">Output Format</div>
    </div>
    <div class="stat">
      <div class="stat-val">FREE</div>
      <div class="stat-label">API Access</div>
    </div>
  </div>

  <!-- Endpoints -->
  <div class="section-title">API Endpoints</div>
  <div class="ep-grid">
    ${endpointCards}
  </div>

  <!-- Usage example -->
  <div class="section-title">Quick Usage</div>
  <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:22px 24px;margin-bottom:48px;">
    <div style="font-size:12px;color:var(--muted);margin-bottom:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Example Request</div>
    <pre style="font-family:'JetBrains Mono',monospace;font-size:13px;line-height:1.7;color:#e2e8f0;white-space:pre-wrap;word-break:break-all;">GET ${BASE_URL}/api/youtube?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ

<span style="color:#10b981;">// Response</span>
{
  "title": "Rick Astley - Never Gonna Give You Up",
  "thumbnail": "https://...",
  "formats": [ ... ],
  ...
}</pre>
  </div>

</div>

<!-- Footer -->
<footer class="footer">
  Built with 💜 by <strong>Alihsan Shourov</strong> &nbsp;·&nbsp; SHOUROV ALL DOWNLOADER API Panel
</footer>

<!-- Response modal -->
<div class="modal-overlay" id="modal">
  <div class="modal">
    <div class="modal-header">
      <div class="modal-title" id="modal-title">API Response</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="modal-status" id="modal-status"></span>
        <button class="modal-close" onclick="closeModal()">×</button>
      </div>
    </div>
    <div class="modal-body" id="modal-body">
      <div class="modal-spinner"><div class="spinner"></div> Fetching...</div>
    </div>
  </div>
</div>

<div class="toast" id="toast">✅ Copied to clipboard!</div>

<script>
  function closeModal() {
    document.getElementById('modal').classList.remove('open');
  }
  document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
  });

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
  }

  function copyEndpoint(path, param, example) {
    const url = window.location.origin + path + '?' + param + '=' + encodeURIComponent(example);
    navigator.clipboard.writeText(url).then(() => showToast('✅ Endpoint URL copied!'));
  }

  async function testEndpoint(id, path, param) {
    const input = document.getElementById('inp-' + id);
    const url = (input.value || input.placeholder).trim();
    if (!url) { showToast('⚠️ Please enter a URL'); return; }

    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    const statusEl = document.getElementById('modal-status');
    const titleEl = document.getElementById('modal-title');

    titleEl.textContent = path;
    statusEl.className = 'modal-status status-loading';
    statusEl.textContent = 'Loading...';
    body.innerHTML = '<div class="modal-spinner"><div class="spinner"></div> Fetching response...</div>';
    modal.classList.add('open');

    try {
      const res = await fetch(path + '?' + param + '=' + encodeURIComponent(url));
      const data = await res.json();
      if (res.ok) {
        statusEl.className = 'modal-status status-ok';
        statusEl.textContent = '200 OK';
        body.innerHTML = '<pre>' + syntaxHighlight(JSON.stringify(data, null, 2)) + '</pre>';
      } else {
        statusEl.className = 'modal-status status-err';
        statusEl.textContent = res.status + ' Error';
        body.innerHTML = '<pre style="color:#ef4444;">' + JSON.stringify(data, null, 2) + '</pre>';
      }
    } catch(e) {
      statusEl.className = 'modal-status status-err';
      statusEl.textContent = 'Error';
      body.innerHTML = '<pre style="color:#ef4444;">Network error: ' + e.message + '</pre>';
    }
  }

  function syntaxHighlight(json) {
    return json
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(m) {
        let cls = 'color:#a78bfa';
        if (/^"/.test(m)) {
          cls = /:$/.test(m) ? 'color:#7dd3fc' : 'color:#86efac';
        } else if (/true|false/.test(m)) {
          cls = 'color:#fbbf24';
        } else if (/null/.test(m)) {
          cls = 'color:#f87171';
        } else {
          cls = 'color:#fb923c';
        }
        return '<span style="' + cls + '">' + m + '</span>';
      });
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
    res.status(500).json({ success: false, error: err.message || 'Failed to process request' });
  }
}

app.get('/api/youtube',   (req, res) => handle(downloadYoutube, req, res));
app.get('/api/ytmp3',     (req, res) => handle(downloadYoutubeMP3, req, res));
app.get('/api/tiktok',    (req, res) => handle(downloadTikTok, req, res));
app.get('/api/facebook',  (req, res) => handle(downloadFacebook, req, res));
app.get('/api/instagram', (req, res) => handle(downloadInstagram, req, res));
app.get('/api/pinterest', (req, res) => handle(downloadPinterest, req, res));
app.get('/api/capcut',    (req, res) => handle(downloadCapCut, req, res));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SHOUROV ALL DOWNLOADER API Panel running on http://0.0.0.0:${PORT}`);
});
