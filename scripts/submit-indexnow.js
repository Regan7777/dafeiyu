const fs = require('fs');
const path = require('path');
const https = require('https');

const host = 'dafeiyu.blog';
const key = 'c3aed0afcfec450fa712ff25bf7353ff';
const keyLocation = `https://${host}/${key}.txt`;

// Read URLs from sitemap.xml
const sitemapPath = path.join('dist', 'sitemap.xml');
let urlList = [
  `https://${host}/`,
  `https://${host}/tools`,
  `https://${host}/tags`,
  `https://${host}/about`
];

if (fs.existsSync(sitemapPath)) {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
  const matches = [...sitemapXml.matchAll(/<loc>(https:\/\/[^<]+)<\/loc>/g)].map(m => m[1]);
  if (matches.length > 0) {
    urlList = Array.from(new Set(matches));
  }
}

console.log(`Submitting ${urlList.length} URLs to IndexNow (Bing / Yandex)...`);

const payload = JSON.stringify({
  host,
  key,
  keyLocation,
  urlList
});

const req = https.request('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  console.log(`IndexNow API Response Status: ${res.statusCode} ${res.statusMessage}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200 || res.statusCode === 202) {
      console.log('🎉 Successfully submitted all URLs to IndexNow!');
    } else {
      console.log('Response body:', data || '(empty)');
      if (res.statusCode === 422) {
        console.log('Note: 422 usually indicates the key location is not yet reachable on the live domain.');
      }
    }
  });
});

req.on('error', (err) => {
  console.error('IndexNow submission error:', err.message);
});

req.write(payload);
req.end();
