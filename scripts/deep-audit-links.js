const fs = require('fs');
const path = require('path');

const dir = path.join('src', 'content', 'posts');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

const posts = [];
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const slug = f.replace(/\.md$/, '');
  const mTitle = content.match(/^title:\s*"([^"]+)"/m);
  const mCat = content.match(/^category:\s*"([^"]+)"/m);
  const mFaqs = content.match(/- q:\s*"([^"]+)"/g);
  const mRelated = content.match(/^relatedArticles:\s*(\[[^\]]*\])/m);
  
  let related = [];
  if (mRelated) {
    try {
      related = JSON.parse(mRelated[1]);
    } catch (e) {}
  }

  // in-text body links to /article/
  const bodyLinks = [...content.matchAll(/\/article\/([a-zA-Z0-9_-]+)/g)].map(m => m[1]);

  posts.push({
    file: f,
    slug,
    title: mTitle ? mTitle[1] : '',
    category: mCat ? mCat[1] : '',
    faqCount: mFaqs ? mFaqs.length : 0,
    related,
    bodyLinks
  });
});

console.log('=== POSTS ANALYSIS (Total: ' + posts.length + ') ===');
const incomingMap = {};
const outgoingMap = {};

posts.forEach(p => {
  incomingMap[p.slug] = new Set();
  outgoingMap[p.slug] = new Set([...p.related, ...p.bodyLinks].filter(s => s !== p.slug));
});

posts.forEach(p => {
  outgoingMap[p.slug].forEach(target => {
    if (incomingMap[target]) {
      incomingMap[target].add(p.slug);
    }
  });
});

let issues = [];

posts.forEach(p => {
  const outgoing = Array.from(outgoingMap[p.slug]);
  const incoming = Array.from(incomingMap[p.slug]);

  console.log(`[${p.category}] ${p.slug} (${p.title.slice(0, 20)}...):`);
  console.log(`   - FAQs: ${p.faqCount}`);
  console.log(`   - Outgoing Links: ${outgoing.length} -> [${outgoing.join(', ')}]`);
  console.log(`   - Incoming Links: ${incoming.length} <- [${incoming.join(', ')}]`);

  if (p.faqCount < 3) {
    issues.push(`FAQ < 3 in ${p.slug} (${p.faqCount})`);
  }
  if (outgoing.length < 3) {
    issues.push(`Outgoing < 3 in ${p.slug} (${outgoing.length})`);
  }
  if (incoming.length === 0) {
    issues.push(`ORPHAN PAGE (0 incoming): ${p.slug}`);
  } else if (incoming.length < 3) {
    console.log(`   ⚠️ WARNING: Incoming < 3 (${incoming.length})`);
  }
});

console.log('\n=== SUMMARY OF ISSUES ===');
if (issues.length) {
  issues.forEach(i => console.error('❌ ' + i));
} else {
  console.log('✅ All 24 posts have >= 3 FAQs, >= 3 Outgoing Links, and 0 Orphans!');
}
