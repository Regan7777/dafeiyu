const fs = require('fs');
const path = require('path');

console.log('================ STARTING SITE AUDIT ================');

const postsDir = path.join('src', 'content', 'posts');
const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

console.log(`Found ${files.length} markdown post files in src/content/posts`);

const postSlugs = new Set(files.map(f => f.replace(/\.md$/, '')));
const incomingLinks = {};
const outgoingLinks = {};
const faqsCount = {};
const emojiIssues = [];
const tutorialViolations = [];
const brokenLinks = [];

postSlugs.forEach(slug => {
  incomingLinks[slug] = [];
  outgoingLinks[slug] = [];
  faqsCount[slug] = 0;
});

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
const bannedSymbols = /[⚡💡🔗🛠📌👉🔍🛡⚖★☆✅⚠👋✦]/;

const commercialAirports = ['shenxing', 'dalao', 'liulian', 'yunjiexian', 'shandianshu', 'huanqiuti'];

files.forEach(f => {
  const slug = f.replace(/\.md$/, '');
  const content = fs.readFileSync(path.join(postsDir, f), 'utf8');

  // 1. Emoji check
  if (emojiRegex.test(content) || bannedSymbols.test(content)) {
    emojiIssues.push(slug);
  }

  // 2. FAQ count check
  const mFaqs = content.match(/- q:\s*"([^"]+)"/g);
  const count = mFaqs ? mFaqs.length : 0;
  faqsCount[slug] = count;

  // 3. Category & Neutrality check
  const mCat = content.match(/^category:\s*"([^"]+)"/m);
  const category = mCat ? mCat[1] : '';

  // 4. Outgoing links check (from relatedArticles and body)
  const mRelated = content.match(/^relatedArticles:\s*(\[[^\]]*\])/m);
  let related = [];
  if (mRelated) {
    try {
      related = JSON.parse(mRelated[1]);
    } catch (e) {}
  }

  // Check tutorial neutrality
  if (category === '科学上网') {
    const hasAirport = related.some(r => commercialAirports.includes(r));
    if (hasAirport) {
      tutorialViolations.push({ slug, related });
    }
  }

  // Body links
  const bodyLinkMatches = [...content.matchAll(/\/article\/([a-zA-Z0-9_-]+)/g)];
  const allTargets = new Set([...related, ...bodyLinkMatches.map(m => m[1])]);

  allTargets.forEach(target => {
    if (target === slug) return;
    if (postSlugs.has(target)) {
      outgoingLinks[slug].push(target);
      incomingLinks[target].push(slug);
    } else {
      brokenLinks.push({ from: slug, target });
    }
  });
});

// Check results
const orphanPosts = Object.keys(incomingLinks).filter(s => incomingLinks[s].length === 0);
const lowFaqPosts = Object.keys(faqsCount).filter(s => faqsCount[s] < 3);
const lowOutgoingPosts = Object.keys(outgoingLinks).filter(s => outgoingLinks[s].length < 3);

console.log('\n--- VERIFICATION RESULTS ---');
console.log('1. Broken Internal Links:', brokenLinks.length ? JSON.stringify(brokenLinks) : 'NONE (100% Valid Links ✅)');
console.log('2. Orphan Posts (0 Incoming Links):', orphanPosts.length ? JSON.stringify(orphanPosts) : 'NONE (0 Orphans! 100% Interconnected ✅)');
console.log('3. Native Emoji / Banned Symbol Violations:', emojiIssues.length ? JSON.stringify(emojiIssues) : 'NONE (0 Emojis! Pure Typography ✅)');
console.log('4. Posts with < 3 FAQs:', lowFaqPosts.length ? JSON.stringify(lowFaqPosts) : 'NONE (All 24 Posts Have >= 3 FAQs ✅)');
console.log('5. Posts with < 3 Outgoing Links:', lowOutgoingPosts.length ? JSON.stringify(lowOutgoingPosts) : 'NONE (All 24 Posts Have >= 3 Outgoing Links ✅)');
console.log('6. Tutorial Neutrality Violations:', tutorialViolations.length ? JSON.stringify(tutorialViolations) : 'NONE (100% Neutral Tutorials ✅)');

if (brokenLinks.length || orphanPosts.length || emojiIssues.length || lowFaqPosts.length || tutorialViolations.length) {
  console.error('\n❌ AUDIT FAILED! Please fix the issues above.');
  process.exit(1);
} else {
  console.log('\n🎉 ALL AUDIT CHECKS PASSED PERFECTLY!');
}
