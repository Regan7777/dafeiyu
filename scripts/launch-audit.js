const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('🚀 DAFEIYU BLOG - LAUNCH READINESS AUDIT & VERIFICATION');
console.log('====================================================\n');

let pass = true;
function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
    pass = false;
  }
}

// 1. Post Content & Frontmatter Audit
const postsDir = path.join('src', 'content', 'posts');
const postFiles = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
assert(postFiles.length === 24, `Found exactly 24 posts (actual: ${postFiles.length})`);

const posts = [];
const categoryCounts = {};
const validCategories = new Set(['科学上网', '机场推荐', '海外流媒体', 'AI工具与实战', '实用工具']);

postFiles.forEach(f => {
  const content = fs.readFileSync(path.join(postsDir, f), 'utf8');
  const slug = f.replace(/\.md$/, '');
  const mTitle = content.match(/^title:\s*"([^"]+)"/m);
  const mCat = content.match(/^category:\s*"([^"]+)"/m);
  const mDate = content.match(/^date:\s*"([^"]+)"/m);
  const mFaqs = content.match(/- q:\s*"([^"]+)"/g);
  
  const title = mTitle ? mTitle[1] : '';
  const cat = mCat ? mCat[1] : '';
  const date = mDate ? mDate[1] : '';
  const faqs = mFaqs ? mFaqs.length : 0;

  assert(title.length > 0, `Post ${f} has non-empty title`);
  assert(validCategories.has(cat), `Post ${f} has valid category (${cat})`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(date), `Post ${f} has valid YYYY-MM-DD date (${date})`);
  assert(faqs >= 3, `Post ${f} has >= 3 FAQs (${faqs})`);

  categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  posts.push({ slug, title, cat, date, content });
});

assert(categoryCounts['科学上网'] === 7, `科学上网 count === 7 (actual: ${categoryCounts['科学上网']})`);
assert(categoryCounts['机场推荐'] === 7, `机场推荐 count === 7 (actual: ${categoryCounts['机场推荐']})`);
assert(categoryCounts['海外流媒体'] === 3, `海外流媒体 count === 3 (actual: ${categoryCounts['海外流媒体']})`);
assert(categoryCounts['AI工具与实战'] === 4, `AI工具与实战 count === 4 (actual: ${categoryCounts['AI工具与实战']})`);
assert(categoryCounts['实用工具'] === 3, `实用工具 count === 3 (actual: ${categoryCounts['实用工具']})`);

// 2. Dist Directory Verification
const distDir = path.join(process.cwd(), 'dist');
assert(fs.existsSync(distDir), 'dist directory exists');

const requiredDistFiles = [
  'index.html',
  '404.html',
  'about/index.html',
  'tags/index.html',
  'tools/index.html',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'llms-full.txt',
  'favicon.ico'
];

requiredDistFiles.forEach(rf => {
  const p = path.join(distDir, rf);
  assert(fs.existsSync(p), `dist/${rf} exists`);
});

// Check all 24 article HTML files in dist
posts.forEach(p => {
  const artPath = path.join(distDir, 'article', p.slug, 'index.html');
  assert(fs.existsSync(artPath), `dist/article/${p.slug}/index.html exists`);
});

// 3. Inspect Article HTML structure: Pure TOC in right sidebar, NO other widgets
posts.forEach(p => {
  const artPath = path.join(distDir, 'article', p.slug, 'index.html');
  if (fs.existsSync(artPath)) {
    const html = fs.readFileSync(artPath, 'utf8');
    
    // Check right sidebar
    const hasToc = html.includes('toc-card') || html.includes('class="toc-container"');
    assert(hasToc, `Article ${p.slug} has TOC container`);

    // Ensure NO "推荐阅读" or "相关标签" in sidebar
    const hasUnwantedRecommend = html.includes('推荐阅读');
    assert(!hasUnwantedRecommend, `Article ${p.slug} right sidebar strictly excludes "推荐阅读"`);

    // Ensure back to top button
    const hasBackToTop = html.includes('back-to-top-btn') || html.includes('backToTopBtn');
    assert(hasBackToTop, `Article ${p.slug} contains Back to Top button`);

    // Ensure reading progress bar
    const hasProgress = html.includes('reading-progress') || html.includes('readingProgress');
    assert(hasProgress, `Article ${p.slug} contains Reading Progress Bar`);

    // Ensure schema JSON-LD
    const hasSchema = html.includes('application/ld+json');
    assert(hasSchema, `Article ${p.slug} contains Schema.org JSON-LD`);
  }
});

// 4. Check Sitemap for stale dates
const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
assert(!sitemapContent.includes('2026-02-18'), 'Sitemap does NOT contain stale 2026-02-18 date');
assert(sitemapContent.includes('2026-11-06'), 'Sitemap contains current 2026-11-06 date');

// 5. Check llms.txt contents
const llmsContent = fs.readFileSync(path.join(distDir, 'llms.txt'), 'utf8');
validCategories.forEach(cat => {
  assert(llmsContent.includes(`### ${cat}`), `llms.txt includes category heading: ${cat}`);
});
posts.forEach(p => {
  assert(llmsContent.includes(p.slug), `llms.txt includes post slug: ${p.slug}`);
});

// 6. Check go redirect endpoints
const goTargets = ['shenxing', 'dalao', 'liulian', 'shandianshu', 'yunjiexian', 'huanqiuti', 'pinghaolian'];
goTargets.forEach(tgt => {
  const p = path.join(distDir, 'go', tgt, 'index.html');
  assert(fs.existsSync(p), `dist/go/${tgt}/index.html exists`);
  if (fs.existsSync(p)) {
    const c = fs.readFileSync(p, 'utf8');
    assert(c.includes('http-equiv="refresh"') && c.includes('window.location.replace'), `go/${tgt} has valid redirect script and meta refresh`);
  }
});

console.log('\n====================================================');
if (pass) {
  console.log('🎉 ALL 100+ PRODUCTION CHECKS PASSED WITH ZERO ERRORS!');
  console.log('====================================================\n');
  process.exit(0);
} else {
  console.error('❌ PRODUCTION CHECKS FAILED! PLEASE REVIEW OUTPUT.');
  console.log('====================================================\n');
  process.exit(1);
}
