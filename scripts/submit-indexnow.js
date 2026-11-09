const fs = require('fs');
const path = require('path');
const https = require('https');

const host = 'dafeiyu.blog';
const key = '7ec54bed5e684bee9e50ea059b0e5538';
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

const endpoints = [
  { name: 'Bing IndexNow', host: 'www.bing.com' },
  { name: 'IndexNow API', host: 'api.indexnow.org' },
  { name: 'Yandex IndexNow', host: 'yandex.com' }
];

endpoints.forEach(ep => {
  const req = https.request({
    hostname: ep.host,
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`[IndexNow -> ${ep.name}] 状态码: ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode === 200 || res.statusCode === 202) {
        console.log(`[IndexNow -> ${ep.name}] 提交成功！`);
      } else {
        console.log(`[IndexNow -> ${ep.name}] 响应内容: ${data || '(无)'}`);
      }
    });
  });

  req.on('error', (err) => {
    console.error(`[IndexNow -> ${ep.name}] 提交错误:`, err.message);
  });

  req.write(payload);
  req.end();
});

