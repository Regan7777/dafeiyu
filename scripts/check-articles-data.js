const fs = require('fs');
const content = fs.readFileSync('js/articles-data.js', 'utf8');

// evaluate ARTICLES_DATA safely
let data = null;
try {
  const sandbox = {};
  const vm = require('vm');
  vm.runInNewContext(content + '; data = ARTICLES_DATA;', sandbox);
  data = sandbox.data;
} catch (e) {
  console.error('Eval error:', e.message);
}

if (data) {
  const keys = Object.keys(data);
  console.log('Total articles in ARTICLES_DATA:', keys.length);
  keys.forEach(k => {
    const art = data[k];
    const html = art.contentHtml || '';
    const hasFaq = html.includes('常见问题') || html.includes('FAQ');
    const hasRelated = html.includes('延伸阅读') || html.includes('精选内链');
    const internalLinks = [...html.matchAll(/href=["'](\/article\/[^"']+|article\.html\?id=[^"']+)["']/g)];
    console.log(`- ${k}: FAQ=${hasFaq}, Related=${hasRelated}, internalLinks=${internalLinks.length}`);
  });
}
