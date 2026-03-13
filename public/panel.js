/* SHOUROV ALL DOWNLOADER — Panel Client JS */

/* ─── Universal Downloader ─── */
async function fetchDownload() {
  const url = document.getElementById('dl-url').value.trim();
  if (!url) { showToast('Paste a URL first'); return; }
  const btn = document.getElementById('dl-fetch-btn');
  const box = document.getElementById('dl-result');
  btn.disabled = true;
  box.className = 'dl-result show';
  box.innerHTML = '<div class="dl-loading"><div class="spinner"></div>Fetching download options…</div>';
  try {
    const res = await fetch('/api/resolve?url=' + encodeURIComponent(url));
    const json = await res.json();
    if (!res.ok || !json.success) {
      box.innerHTML = '<div class="dl-err">Error: ' + escH(json.error || 'Failed to resolve URL') + '</div>';
      return;
    }
    const d = json.data;
    let thumbHtml = '';
    if (d.thumbnail || d.avatar) {
  const img = document.createElement('img');
  img.className = 'dl-thumb';
  img.src = d.thumbnail || d.avatar || "https://i.postimg.cc/W1T39jYH/Shourov.jpg";
  img.alt = '';
  img.onerror = function () { this.hidden = true; };
  thumbHtml = img.outerHTML;
}else {
      thumbHtml = '<div class="dl-thumb-placeholder">🎬</div>';
    }
    const meta = [d.duration, d.channel].filter(Boolean).join(' · ');
    const fmtIcons = { video: '🎬', audio: '🎵', image: '🖼️' };
    const fmtsHtml = (d.formats || []).map(function (f) {
      const icon = fmtIcons[f.type] || '⬇️';
      let dlData = '';
      if (f.url) {
        dlData = 'data-dl-url="' + escH(f.url) + '" data-dl-type="' + escH(f.type) + '"';
      } else if (f.itag) {
        dlData = 'data-dl-src="' + escH(url) + '" data-dl-itag="' + f.itag + '" data-dl-type="' + escH(f.type) + '"';
      }
      return '<button class="fmt-btn fmt-dl-btn" ' + dlData + '>' +
        '<span class="fmt-icon">' + icon + '</span>' +
        '<div class="fmt-info"><div class="fmt-label">' + escH(f.label) + '</div>' +
        '<div class="fmt-meta">' + escH([f.quality, f.size].filter(Boolean).join(' · ')) + '</div></div>' +
        '<span class="fmt-dl-icon">⬇</span></button>';
    }).join('');
    box.innerHTML =
      '<div class="dl-media-info">' + thumbHtml +
      '<div class="dl-meta"><div class="dl-meta-title">' + escH(d.title) + '</div>' +
      '<div class="dl-meta-sub"><span>' + escH(meta) + '</span></div></div></div>' +
      '<div class="dl-formats">' + fmtsHtml + '</div>';
  } catch (e) {
    box.innerHTML = '<div class="dl-err">Error: ' + escH(e.message) + '</div>';
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('click', function (e) {
  const btn = e.target.closest('.fmt-dl-btn');
  if (!btn) return;
  if (btn.dataset.dlUrl) {
    const a = document.createElement('a');
    a.href = btn.dataset.dlUrl;
    a.download = btn.dataset.dlType === 'audio' ? 'audio.mp3' : btn.dataset.dlType === 'image' ? 'image.jpg' : 'video.mp4';
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Download started!');
  } else if (btn.dataset.dlItag) {
    window.open('/api/dl?url=' + encodeURIComponent(btn.dataset.dlSrc) + '&itag=' + btn.dataset.dlItag, '_blank');
    showToast('Download started!');
  }
});

document.getElementById('dl-url').addEventListener('keydown', function (e) { if (e.key === 'Enter') fetchDownload(); });

/* ─── Search ─── */
async function doSearch() {
  const q = document.getElementById('search-q').value.trim();
  if (!q) { showToast('Type something to search'); return; }
  const btn = document.getElementById('search-btn');
  const box = document.getElementById('search-results');
  btn.disabled = true;
  box.className = 'search-results';
  box.innerHTML = '';

  const loader = document.createElement('div');
  loader.className = 'search-loading';
  loader.id = 's-load';
  loader.innerHTML = '<div class="spinner"></div>Searching for "' + escH(q) + '"…';
  box.before(loader);

  try {
    const res = await fetch('/api/search?q=' + encodeURIComponent(q));
    const json = await res.json();
    const sLoad = document.getElementById('s-load');
    if (sLoad) sLoad.remove();

    if (!json.success || !json.data || json.data.length === 0) {
      box.className = 'search-results show';
      box.innerHTML = '<div style="color:var(--m);padding:20px 0;grid-column:1/-1;">No results found for "' + escH(q) + '"</div>';
      return;
    }
    box.className = 'search-results show';
    box.innerHTML = json.data.map(function (v) {
      const thumb = v.thumbnail || v.image || '';
      const title = v.title || 'Unknown';
      const channel = v.channel || v.author || '';
      const duration = v.duration || '';
      const videoUrl = v.url || ('https://www.youtube.com/watch?v=' + (v.videoId || v.id || ''));

      const img = document.createElement('img');
      img.className = 'sr-thumb';
      img.src = escH(thumb);
      img.loading = 'lazy';
      img.alt = '';
      img.onerror = function () { this.remove(); };
      const imgHtml = img.outerHTML;

      return '<div class="sr-card">' + imgHtml +
        '<div class="sr-body"><div class="sr-title">' + escH(title) + '</div>' +
        '<div class="sr-meta"><span>' + escH(channel) + '</span>' +
        (duration ? '<span>' + escH(duration) + '</span>' : '') + '</div>' +
        '<button class="btn-sr-dl" data-vurl="' + escH(videoUrl) + '">⬇ Download</button>' +
        '</div></div>';
    }).join('');
  } catch (e) {
    const sLoad = document.getElementById('s-load');
    if (sLoad) sLoad.remove();
    box.className = 'search-results show';
    box.innerHTML = '<div style="color:#ef4444;grid-column:1/-1;">Error: ' + escH(e.message) + '</div>';
  } finally {
    btn.disabled = false;
  }
}

document.addEventListener('click', function (e) {
  const btn = e.target.closest('.btn-sr-dl');
  if (!btn) return;
  const videoUrl = btn.dataset.vurl;
  if (!videoUrl) return;
  document.getElementById('dl-url').value = videoUrl;
  document.getElementById('dl-url').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(fetchDownload, 300);
});

document.getElementById('search-q').addEventListener('keydown', function (e) { if (e.key === 'Enter') doSearch(); });

/* ─── YouTube Player ─── */
function playYT() {
  const raw = document.getElementById('yt-url').value.trim();
  if (!raw) return;
  let vid = '';
  try {
    const u = new URL(raw);
    if (u.hostname === 'youtu.be') {
      vid = u.pathname.slice(1).split('/')[0];
    } else {
      vid = u.searchParams.get('v') || u.pathname.split('/').pop();
    }
  } catch (_) {
    vid = raw.split('/').pop().split('?')[0].split('&')[0];
  }
  vid = vid.split('?')[0].split('&')[0];
  if (!vid) { showToast('Invalid YouTube URL'); return; }
  const fw = document.getElementById('yt-frame');
  document.getElementById('yt-iframe').src = 'https://www.youtube.com/embed/' + vid + '?autoplay=1&rel=0';
  fw.className = 'yt-frame on';
}
document.getElementById('yt-url').addEventListener('keydown', function (e) { if (e.key === 'Enter') playYT(); });

/* ─── Filter ─── */
function filterCat(cat, btn) {
  document.querySelectorAll('.cat-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.ep-card').forEach(function (card) {
    card.classList.toggle('hidden', cat !== 'all' && card.dataset.cat !== cat);
  });
}

/* ─── Copy endpoint ─── */
function copyUrl(path, example) {
  navigator.clipboard.writeText(window.location.origin + path + '?url=' + encodeURIComponent(example))
    .then(function () { showToast('Endpoint URL copied!'); });
}

/* ─── Test API Modal ─── */
function closeModal() { document.getElementById('overlay').classList.remove('open'); }
document.getElementById('overlay').addEventListener('click', function (e) { if (e.target === this) closeModal(); });

async function testApi(id, path, special) {
  const inp = document.getElementById('inp-' + id);
  const url = (inp.value || inp.placeholder).trim();
  if (!url) { showToast('Enter a URL first'); return; }
  if (special === 'ytplayer') {
    document.getElementById('yt-url').value = url;
    playYT();
    document.querySelector('.yt-section').scrollIntoView({ behavior: 'smooth' });
    showToast('Playing in YouTube Player!');
    return;
  }
  const ov = document.getElementById('overlay');
  const body = document.getElementById('m-body');
  const st = document.getElementById('m-st');
  document.getElementById('m-title').textContent = path;
  st.className = 'modal-st st-load'; st.textContent = 'Loading…';
  body.innerHTML = '<div class="modal-spin"><div class="spinner"></div>Fetching response…</div>';
  ov.classList.add('open');
  try {
    const res = await fetch(path + '?url=' + encodeURIComponent(url));
    const data = await res.json();
    if (res.ok) {
      st.className = 'modal-st st-ok'; st.textContent = '200 OK';
      let extra = '';
      if (data.data && data.data.embedUrl && path.includes('spotify')) {
        extra = '<div class="yt-modal-player"><iframe src="' + data.data.embedUrl + '" allow="autoplay; clipboard-write; encrypted-media; fullscreen"></iframe></div>';
      }
      body.innerHTML = extra + '<pre>' + syntaxHL(JSON.stringify(data, null, 2)) + '</pre>';
    } else {
      st.className = 'modal-st st-err'; st.textContent = res.status + ' Error';
      body.innerHTML = '<pre style="color:#ef4444">' + escH(JSON.stringify(data, null, 2)) + '</pre>';
    }
  } catch (e) {
    st.className = 'modal-st st-err'; st.textContent = 'Error';
    body.innerHTML = '<pre style="color:#ef4444">' + escH(e.message) + '</pre>';
  }
}

/* ─── Helpers ─── */
function escH(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function syntaxHL(json) {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span style="color:#7dd3fc">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span style="color:#86efac">"$1"</span>')
    .replace(/: (-?[0-9][0-9.]*)/g, ': <span style="color:#fb923c">$1</span>')
    .replace(/: (true|false)/g, ': <span style="color:#fbbf24">$1</span>')
    .replace(/: (null)/g, ': <span style="color:#f87171">$1</span>');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function () { t.classList.remove('show'); }, 2200);
}
