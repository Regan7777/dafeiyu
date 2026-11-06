const fs = require('fs');
const path = require('path');

const linkGraph = {
  'clash-verge': ['sing-box-guide', 'dns-leak-fix', 'clash-mi', 'karing-guide', 'spotify-hbo'],
  'sing-box-guide': ['clash-verge', 'karing-guide', 'dns-leak-fix', 'clash-mi', 'shadowrocket-ios'],
  'shadowrocket-ios': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'dns-leak-fix', 'clash-mi', 'youtube-family'],
  'dns-leak-fix': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'windows-optimize', 'spotify-hbo'],
  'clash-mi': ['clash-verge', 'karing-guide', 'nextin-guide', 'dns-leak-fix', 'youtube-family'],
  'nextin-guide': ['shadowrocket-ios', 'karing-guide', 'clash-verge', 'dns-leak-fix', 'clash-mi'],
  'karing-guide': ['sing-box-guide', 'clash-mi', 'clash-verge', 'nextin-guide', 'youtube-family'],
  'shenxing': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks', 'shandianshu', 'dns-leak-fix'],
  'dalao': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks', 'shenxing', 'shandianshu', 'huanqiuti'],
  'liulian': ['clash-verge', 'sing-box-guide', 'karing-guide', 'streaming-unlock', 'yunjiexian', 'dalao', 'huanqiuti', 'shandianshu'],
  'shandianshu': ['clash-verge', 'shadowrocket-ios', 'karing-guide', 'streaming-unlock', 'free-vpn-risks', 'shenxing', 'liulian', 'huanqiuti'],
  'yunjiexian': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'liulian', 'shenxing', 'dalao', 'shandianshu'],
  'huanqiuti': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'streaming-unlock', 'dalao', 'liulian', 'yunjiexian', 'shandianshu'],
  'free-vpn-risks': ['shenxing', 'dalao', 'shandianshu', 'dns-leak-fix', 'clash-verge', 'liulian', 'huanqiuti', 'yunjiexian'],
  'streaming-unlock': ['clash-verge', 'sing-box-guide', 'youtube-family', 'spotify-hbo', 'dalao'],
  'youtube-family': ['streaming-unlock', 'spotify-hbo', 'clash-verge', 'dalao', 'shadowrocket-ios'],
  'spotify-hbo': ['streaming-unlock', 'youtube-family', 'sing-box-guide', 'liulian', 'chatgpt-claude-account'],
  'deepseek-harness': ['deepseek-tutorial', 'ai-workflow', 'windows-optimize', 'clash-verge', 'chatgpt-claude-account'],
  'deepseek-tutorial': ['deepseek-harness', 'ai-workflow', 'chatgpt-claude-account', 'clash-verge', 'macos-raycast'],
  'ai-workflow': ['deepseek-tutorial', 'deepseek-harness', 'chatgpt-claude-account', 'chrome-extensions', 'macos-raycast'],
  'chatgpt-claude-account': ['ai-workflow', 'deepseek-tutorial', 'deepseek-harness', 'dns-leak-fix', 'spotify-hbo'],
  'chrome-extensions': ['macos-raycast', 'windows-optimize', 'ai-workflow', 'clash-verge', 'deepseek-harness'],
  'macos-raycast': ['chrome-extensions', 'windows-optimize', 'ai-workflow', 'shadowrocket-ios', 'deepseek-tutorial'],
  'windows-optimize': ['chrome-extensions', 'macos-raycast', 'dns-leak-fix', 'clash-verge', 'deepseek-harness', 'chatgpt-claude-account']
};

let jsContent = fs.readFileSync('js/articles-data.js', 'utf8');

// Load post titles from Markdown files
const postsDir = path.join('src', 'content', 'posts');
const postTitles = {};
const postCats = {};
const postClasses = {};
const postIcons = {};
const postTimes = {};
const postDates = {};
const postLeads = {};

fs.readdirSync(postsDir).filter(f => f.endsWith('.md')).forEach(f => {
  const c = fs.readFileSync(path.join(postsDir, f), 'utf8');
  const slug = f.replace(/\.md$/, '');
  const mT = c.match(/^title:\s*"([^"]+)"/m);
  const mC = c.match(/^category:\s*"([^"]+)"/m);
  const mCls = c.match(/^categoryClass:\s*"([^"]+)"/m);
  const mIco = c.match(/^categoryIcon:\s*"([^"]+)"/m);
  const mTime = c.match(/^readingTime:\s*"([^"]+)"/m);
  const mD = c.match(/^date:\s*"([^"]+)"/m);
  const mL = c.match(/^lead:\s*"([^"]+)"/m);

  postTitles[slug] = mT ? mT[1] : slug;
  postCats[slug] = mC ? mC[1] : '技术';
  postClasses[slug] = mCls ? mCls[1] : 'tag-proxy';
  postIcons[slug] = mIco ? mIco[1] : 'fa-solid fa-file';
  postTimes[slug] = mTime ? mTime[1] : '10分钟阅读';
  postDates[slug] = mD ? mD[1] : '2026-11-01';
  postLeads[slug] = mL ? mL[1] : '';
});

// Update each article's related articles block inside js/articles-data.js
Object.keys(linkGraph).forEach(slug => {
  const relatedSlugs = linkGraph[slug];
  
  // Build clean related articles HTML
  const relatedHtml = `<div class=\\"related-articles-section\\">\\n        <h2 id=\\"related-articles\\"><i class=\\"fa-solid fa-link\\" style=\\"color: var(--accent-primary); margin-right: 8px;\\"></i>延伸阅读与精选内链推荐</h2>\\n        <p style=\\"color: var(--text-secondary); font-size: 14px; margin-bottom: 12px;\\">欢迎继续探索本站关联精选专栏，体系化掌握网络加速、流媒体解锁与 AI 生产力核心技术：</p>\\n        <div class=\\"related-articles-grid\\">\\n` +
    relatedSlugs.map(rel => {
      const title = postTitles[rel] || rel;
      const cat = postCats[rel] || '专栏';
      const catCls = postClasses[rel] || 'tag-proxy';
      const catIco = postIcons[rel] || 'fa-solid fa-book';
      const rTime = postTimes[rel] || '10分钟';
      const rDate = postDates[rel] || '2026-11-01';
      const rLead = (postLeads[rel] || '').slice(0, 70);

      return `          <a href=\\"article.html?id=${rel}\\" class=\\"related-article-card\\">\\n            <div class=\\"related-card-top\\">\\n              <span class=\\"tag-pill-sm ${catCls}\\"><i class=\\"${catIco}\\"></i> ${cat}</span>\\n              <span style=\\"font-size: 12px; color: var(--text-muted);\\"><i class=\\"fa-regular fa-clock\\"></i> ${rTime}</span>\\n            </div>\\n            <div class=\\"related-card-title\\">${title}</div>\\n            <p class=\\"related-card-excerpt\\">${rLead}...</p>\\n            <div class=\\"related-card-footer\\">\\n              <span><i class=\\"fa-regular fa-calendar\\"></i> ${rDate}</span>\\n              <span class=\\"related-read-more\\">阅读全文 <i class=\\"fa-solid fa-arrow-right\\"></i></span>\\n            </div>\\n          </a>`;
    }).join('\\n') + `\\n        </div>\\n      </div>`;

  // Replace existing related articles in jsContent for this article
  // Match either <h2 id=\\"related-articles\\">...</div> or <div class=\\"related-articles-section\\">...</div>
  const articleRegex = new RegExp(`("${slug}"\\s*:\\s*\\{[\\s\\S]*?"contentHtml"\\s*:\\s*")([\\s\\S]*?)("(?=,\\s*"prevId"))`);
  const match = jsContent.match(articleRegex);
  if (match) {
    let contentHtml = match[2];
    // Remove old related articles
    contentHtml = contentHtml.replace(/<div class=\\"related-articles-section\\">[\\s\\S]*?<\/div>\\s*<\/div>/g, '');
    contentHtml = contentHtml.replace(/<h2 id=\\"related-articles\\">[\\s\\S]*?<\/div>\\s*<\/div>/g, '');
    contentHtml = contentHtml.replace(/<h2 id=\\"related-articles\\">[\\s\\S]*?<\/ul>\\s*<\/div>/g, '');
    contentHtml = contentHtml.trim() + `\\n\\n      ${relatedHtml}`;
    jsContent = jsContent.replace(articleRegex, `$1${contentHtml}$3`);
  }
});

fs.writeFileSync('js/articles-data.js', jsContent, 'utf8');
console.log('✅ js/articles-data.js successfully synchronized with linkGraph cards!');

