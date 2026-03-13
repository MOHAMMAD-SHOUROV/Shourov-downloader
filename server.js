import express from 'express';
import { downloadMedia } from './src/index.js';

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Media Downloader</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #0f0f1a;
      color: #e0e0e0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: #1a1a2e;
      border-radius: 16px;
      padding: 40px;
      max-width: 640px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    }
    h1 {
      font-size: 2rem;
      margin-bottom: 8px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #888;
      margin-bottom: 32px;
      font-size: 0.95rem;
    }
    .platforms {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 28px;
    }
    .platform-tag {
      background: #16213e;
      border: 1px solid #333;
      border-radius: 20px;
      padding: 4px 14px;
      font-size: 0.8rem;
      color: #aaa;
    }
    .form-group {
      display: flex;
      gap: 10px;
    }
    input[type="text"] {
      flex: 1;
      background: #16213e;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 14px 18px;
      color: #e0e0e0;
      font-size: 1rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus {
      border-color: #667eea;
    }
    button {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 14px 24px;
      font-size: 1rem;
      cursor: pointer;
      transition: opacity 0.2s;
      white-space: nowrap;
    }
    button:hover { opacity: 0.85; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }
    #result {
      margin-top: 24px;
    }
    .loading {
      color: #667eea;
      font-style: italic;
    }
    .error {
      background: #2a1a1a;
      border: 1px solid #c0392b;
      border-radius: 10px;
      padding: 16px;
      color: #e74c3c;
    }
    .success {
      background: #1a2a1a;
      border: 1px solid #27ae60;
      border-radius: 10px;
      padding: 16px;
      color: #2ecc71;
    }
    pre {
      white-space: pre-wrap;
      word-break: break-all;
      font-size: 0.82rem;
      margin-top: 8px;
      color: #bbb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Media Downloader</h1>
    <p class="subtitle">Download media from popular platforms</p>
    <div class="platforms">
      <span class="platform-tag">YouTube</span>
      <span class="platform-tag">Twitter / X</span>
      <span class="platform-tag">TikTok</span>
      <span class="platform-tag">Facebook</span>
      <span class="platform-tag">Instagram</span>
    </div>
    <div class="form-group">
      <input type="text" id="urlInput" placeholder="Paste a media URL here..." />
      <button id="fetchBtn" onclick="fetchMedia()">Fetch</button>
    </div>
    <div id="result"></div>
  </div>

  <script>
    async function fetchMedia() {
      const url = document.getElementById('urlInput').value.trim();
      if (!url) return;
      const resultDiv = document.getElementById('result');
      const btn = document.getElementById('fetchBtn');
      btn.disabled = true;
      resultDiv.innerHTML = '<p class="loading">Fetching media info...</p>';
      try {
        const res = await fetch('/api/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const data = await res.json();
        if (!res.ok) {
          resultDiv.innerHTML = '<div class="error"><strong>Error:</strong> ' + (data.error || 'Unknown error') + '</div>';
        } else {
          resultDiv.innerHTML = '<div class="success"><strong>Success!</strong><pre>' + JSON.stringify(data, null, 2) + '</pre></div>';
        }
      } catch (e) {
        resultDiv.innerHTML = '<div class="error"><strong>Error:</strong> ' + e.message + '</div>';
      } finally {
        btn.disabled = false;
      }
    }

    document.getElementById('urlInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') fetchMedia();
    });
  </script>
</body>
</html>`);
});

app.post('/api/download', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  try {
    const result = await downloadMedia(url);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to download media' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Media Downloader server running on http://0.0.0.0:${PORT}`);
});
