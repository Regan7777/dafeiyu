const fs = require('fs');
const path = require('path');

const dir = path.join('src', 'content', 'posts');

// Define full bidirectional, high-relevance cross-link graph for all 24 posts
// Every post MUST have >= 4 related articles
// Every post MUST receive >= 3 incoming links
const linkGraph = {
  // --- 科学上网 (7篇) ---
  'clash-verge': ['sing-box-guide', 'dns-leak-fix', 'clash-mi', 'karing-guide', 'spotify-hbo'],
  'sing-box-guide': ['clash-verge', 'karing-guide', 'dns-leak-fix', 'clash-mi', 'shadowrocket-ios'],
  'shadowrocket-ios': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'dns-leak-fix', 'clash-mi', 'youtube-family'],
  'dns-leak-fix': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'windows-optimize', 'spotify-hbo'],
  'clash-mi': ['clash-verge', 'karing-guide', 'nextin-guide', 'dns-leak-fix', 'youtube-family'],
  'nextin-guide': ['shadowrocket-ios', 'karing-guide', 'clash-verge', 'dns-leak-fix', 'clash-mi'],
  'karing-guide': ['sing-box-guide', 'clash-mi', 'clash-verge', 'nextin-guide', 'youtube-family'],

  // --- 机场推荐 (7篇) ---
  'shenxing': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks', 'shandianshu', 'dns-leak-fix'],
  'dalao': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks', 'shenxing', 'shandianshu', 'huanqiuti'],
  'liulian': ['clash-verge', 'sing-box-guide', 'karing-guide', 'streaming-unlock', 'yunjiexian', 'dalao', 'huanqiuti', 'shandianshu'],
  'shandianshu': ['clash-verge', 'shadowrocket-ios', 'karing-guide', 'streaming-unlock', 'free-vpn-risks', 'shenxing', 'liulian', 'huanqiuti'],
  'yunjiexian': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'liulian', 'shenxing', 'dalao', 'shandianshu'],
  'huanqiuti': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'streaming-unlock', 'dalao', 'liulian', 'yunjiexian', 'shandianshu'],
  'free-vpn-risks': ['shenxing', 'dalao', 'shandianshu', 'dns-leak-fix', 'clash-verge', 'liulian', 'huanqiuti', 'yunjiexian'],

  // --- 海外流媒体 (3篇) ---
  'streaming-unlock': ['clash-verge', 'sing-box-guide', 'youtube-family', 'spotify-hbo', 'dalao'],
  'youtube-family': ['streaming-unlock', 'spotify-hbo', 'clash-verge', 'dalao', 'shadowrocket-ios'],
  'spotify-hbo': ['streaming-unlock', 'youtube-family', 'sing-box-guide', 'liulian', 'chatgpt-claude-account'],

  // --- AI工具与实战 (4篇) ---
  'deepseek-harness': ['deepseek-tutorial', 'ai-workflow', 'windows-optimize', 'clash-verge', 'chatgpt-claude-account'],
  'deepseek-tutorial': ['deepseek-harness', 'ai-workflow', 'chatgpt-claude-account', 'clash-verge', 'macos-raycast'],
  'ai-workflow': ['deepseek-tutorial', 'deepseek-harness', 'chatgpt-claude-account', 'chrome-extensions', 'macos-raycast'],
  'chatgpt-claude-account': ['ai-workflow', 'deepseek-tutorial', 'deepseek-harness', 'dns-leak-fix', 'spotify-hbo'],

  // --- 实用工具 (3篇) ---
  'chrome-extensions': ['macos-raycast', 'windows-optimize', 'ai-workflow', 'clash-verge', 'deepseek-harness'],
  'macos-raycast': ['chrome-extensions', 'windows-optimize', 'ai-workflow', 'shadowrocket-ios', 'deepseek-tutorial'],
  'windows-optimize': ['chrome-extensions', 'macos-raycast', 'dns-leak-fix', 'clash-verge', 'deepseek-harness', 'chatgpt-claude-account']
};

// 1. Verify link graph incoming / outgoing statistics
const allSlugs = Object.keys(linkGraph);
console.log('Total articles configured:', allSlugs.length);

const incomingCounts = {};
allSlugs.forEach(s => incomingCounts[s] = 0);

allSlugs.forEach(s => {
  const outgoing = linkGraph[s];
  outgoing.forEach(target => {
    if (incomingCounts[target] !== undefined) {
      incomingCounts[target]++;
    } else {
      console.error(`Invalid target ${target} from ${s}`);
    }
  });
});

console.log('\n--- Link Matrix Verification ---');
let hasError = false;
allSlugs.forEach(s => {
  const outCount = linkGraph[s].length;
  const inCount = incomingCounts[s];
  console.log(`${s.padEnd(25)} Outgoing: ${outCount} | Incoming: ${inCount}`);
  if (outCount < 3) {
    console.error(`❌ Outgoing < 3 for ${s}`);
    hasError = true;
  }
  if (inCount < 3) {
    console.error(`❌ Incoming < 3 for ${s}`);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
}

// 2. Update all Markdown files in src/content/posts
allSlugs.forEach(slug => {
  const filePath = path.join(dir, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const targetRelated = linkGraph[slug];

  // Update frontmatter relatedArticles
  if (/^relatedArticles:\s*\[[^\]]*\]/m.test(content)) {
    content = content.replace(/^relatedArticles:\s*\[[^\]]*\]/m, `relatedArticles: ${JSON.stringify(targetRelated)}`);
  } else {
    // Add before the closing frontmatter
    content = content.replace(/---\s*$/, `relatedArticles: ${JSON.stringify(targetRelated)}\n---`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
});

console.log('\n✅ Successfully updated all 24 Markdown files with the enhanced link matrix!');
