const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Load articlesData
const articlesCode = fs.readFileSync('js/articles-data.js', 'utf8');
const sandbox = {};
vm.runInNewContext(articlesCode + '; this.ARTICLES_DATA = ARTICLES_DATA;', sandbox);
const articles = sandbox.ARTICLES_DATA;

// 2. Load inject script for original faqs
const injectCode = fs.readFileSync('C:/Users/78432/.gemini/antigravity/brain/9579f4e4-bb5f-4e94-91c8-575419929e83/scratch/inject_faqs_and_links.js', 'utf8');
const injectSandbox = { require, console: { log: () => {} }, process };
vm.runInNewContext(injectCode.replace('fs.writeFileSync', '// fs.writeFileSync') + '; this.enh = articleEnhancements;', injectSandbox);
const enhancements = injectSandbox.enh;

// Emoji cleaner
const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2B50}\u{2B55}\u{2705}\u{274C}\u{26A0}\u{2728}]/gu;
function cleanEmojis(str) {
  if (!str) return '';
  return str
    .replace(emojiRegex, '')
    .replace(/[⚡💡🔗🛠📌👉🔍🛡⚖★☆✅⚠👋✦]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Keywords mapping (3-8 high-intent exact-match keywords)
const keywordsMap = {
  'clash-verge': ['Clash Verge Rev', 'Clash配置教程', 'TUN模式', '规则分流', '2026科学上网', 'Mihomo内核'],
  'sing-box-guide': ['Sing-box教程', 'Rule-set规则集', '通用代理核心', 'VLESS配置', 'Hysteria2', 'Sing-box出海'],
  'shadowrocket-ios': ['Shadowrocket', '小火箭配置', 'iOS科学上网', '小火箭节点导入', '分流规则', '美区AppleID'],
  'dns-leak-fix': ['DNS泄漏', '科学上网DNS防范', 'WebRTC泄漏', 'TUN虚拟网卡', 'DoH加密', '防投毒'],
  'clash-mi': ['Clash Mi', 'Flutter代理客户端', 'Mihomo轻量端', '低内存代理', '跨平台翻墙工具'],
  'nextin-guide': ['Nextin教程', '极简代理客户端', '多协议支持', '开箱即用翻墙', '节点订阅测速'],
  'karing-guide': ['Karing客户端', '全平台代理利器', '免配置翻墙', '自适应智能路由', 'Clash替代方案'],
  'free-vpn-risks': ['拼好连', '拼好连免费版', '免费VPN弊端', '永久免费梯子', '翻墙避坑指南', '科学上网安全'],
  'shenxing': ['神行加速', '神行加速评测', 'IPLC专线', '2026机场推荐', '4K流媒体节点', '低延迟出海'],
  'dalao': ['大佬云', '大佬云评测', 'BGP中转专线', '不限速机场', 'ChatGPT解锁节点', '高可用翻墙梯子'],
  'liulian': ['榴莲云', '榴莲云评测', 'IEPL专线机场', '晚高峰不卡顿', '流媒体解锁', '性价比梯子'],
  'yunjiexian': ['云界线', '云界线评测', '企业级高速节点', '跨境办公专线', '大带宽机场', '双程专线'],
  'shandianshu': ['闪电鼠', '闪电鼠评测', '性价比机场推荐', '按量付费节点', '备用翻墙梯子', '平价IPLC'],
  'huanqiuti': ['环球梯', '环球梯评测', '全球多节点机场', '冷门小众地区IP', 'TikTok原生节点', '高速专线'],
  'streaming-unlock': ['流媒体解锁', 'Netflix看区', 'Disney+原生IP', '住宅IP', '4K奈飞节点', '流媒体检测'],
  'youtube-family': ['YouTube Premium', '油管家庭组', '跨区合租避坑', 'YouTube会员充值', '土耳其阿根廷跨区'],
  'spotify-hbo': ['Spotify跨区', 'Max流媒体', 'HBO锁区解决', '无损音质解锁', '海外会员绑定'],
  'deepseek-harness': ['DeepSeek', 'DeepSeek本地部署', 'Ollama部署DeepSeek', '私有化大模型', '开源AI实战'],
  'deepseek-tutorial': ['DeepSeek教程', 'Prompt工程', 'DeepSeek R1提问技巧', '深度推理实操', 'AI生产力指南'],
  'ai-workflow': ['AI工作流', 'AI生产力闭环', '自动化工作流', '知识库构建', 'AI写代码', '多模型协同'],
  'chatgpt-claude-account': ['ChatGPT Plus注册', 'Claude Pro账号', '海外虚拟卡', 'Stripe支付避风控', '账号防封'],
  'chrome-extensions': ['Chrome扩展', '沉浸式翻译', 'uBlock Origin', '浏览器效率神器', '网页双语阅读'],
  'macos-raycast': ['Raycast教程', 'macOS效率神器', 'Spotlight替代', '快捷脚本', 'Raycast扩展推荐'],
  'windows-optimize': ['Windows 11优化', '系统后台减负', '禁用遥测', '内存释放', '极客系统调优']
};

// Neutral internal links mapping
// Rule: Tutorials NEVER link to specific commercial airports; Reviews MUST link back to tutorials!
const relatedMap = {
  // Tutorials
  'clash-verge': ['sing-box-guide', 'dns-leak-fix', 'clash-mi', 'karing-guide'],
  'sing-box-guide': ['clash-verge', 'karing-guide', 'dns-leak-fix', 'shadowrocket-ios'],
  'shadowrocket-ios': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'dns-leak-fix'],
  'dns-leak-fix': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'windows-optimize'],
  'clash-mi': ['clash-verge', 'karing-guide', 'nextin-guide', 'dns-leak-fix'],
  'nextin-guide': ['shadowrocket-ios', 'karing-guide', 'clash-verge', 'dns-leak-fix'],
  'karing-guide': ['sing-box-guide', 'clash-mi', 'clash-verge', 'nextin-guide'],

  // Free VPN Risk
  'free-vpn-risks': ['shenxing', 'dalao', 'shandianshu', 'dns-leak-fix', 'clash-verge'],

  // Airport Reviews (Interlocking: must link to client tutorials + peer reviews)
  'shenxing': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks'],
  'dalao': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'free-vpn-risks'],
  'liulian': ['clash-verge', 'sing-box-guide', 'karing-guide', 'streaming-unlock', 'yunjiexian'],
  'yunjiexian': ['clash-verge', 'sing-box-guide', 'shadowrocket-ios', 'streaming-unlock', 'liulian'],
  'shandianshu': ['clash-verge', 'shadowrocket-ios', 'karing-guide', 'streaming-unlock', 'free-vpn-risks'],
  'huanqiuti': ['clash-verge', 'sing-box-guide', 'nextin-guide', 'streaming-unlock', 'dalao'],

  // Streaming
  'streaming-unlock': ['clash-verge', 'sing-box-guide', 'youtube-family', 'spotify-hbo', 'dalao'],
  'youtube-family': ['streaming-unlock', 'spotify-hbo', 'clash-verge', 'dalao'],
  'spotify-hbo': ['streaming-unlock', 'youtube-family', 'sing-box-guide', 'liulian'],

  // AI & Productivity
  'deepseek-harness': ['deepseek-tutorial', 'ai-workflow', 'windows-optimize', 'clash-verge'],
  'deepseek-tutorial': ['deepseek-harness', 'ai-workflow', 'chatgpt-claude-account', 'clash-verge'],
  'ai-workflow': ['deepseek-tutorial', 'deepseek-harness', 'chatgpt-claude-account', 'chrome-extensions'],
  'chatgpt-claude-account': ['ai-workflow', 'deepseek-tutorial', 'dns-leak-fix', 'dalao'],
  'chrome-extensions': ['macos-raycast', 'windows-optimize', 'ai-workflow', 'clash-verge'],
  'macos-raycast': ['chrome-extensions', 'windows-optimize', 'ai-workflow', 'shadowrocket-ios'],
  'windows-optimize': ['chrome-extensions', 'macos-raycast', 'dns-leak-fix', 'clash-verge']
};

const outputDir = path.join('src', 'content', 'posts');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

let convertedCount = 0;

for (const [id, art] of Object.entries(articles)) {
  const enh = (enhancements && enhancements[id]) ? enhancements[id] : { faqs: [] };

  // Clean FAQs
  const cleanFaqs = enh.faqs.map(f => ({
    q: cleanEmojis(f.q),
    a: cleanEmojis(f.a)
  }));

  // Clean title & lead
  const cleanTitle = cleanEmojis(art.title);
  const cleanLead = cleanEmojis(art.lead);
  const cleanDesc = cleanLead.slice(0, 150);

  // Clean body HTML: remove old appended FAQ and links sections
  let body = art.contentHtml || '';
  body = body.replace(/<h2 id="faq">[\s\S]*?(?=<h2|$)/i, '');
  body = body.replace(/<h2 id="related-articles">[\s\S]*?(?=<h2|$)/i, '');
  body = body.replace(/article\.html\?id=([a-zA-Z0-9_-]+)/g, '/article/$1');
  body = cleanEmojis(body);

  // Related articles
  const rel = relatedMap[id] || [];

  // Frontmatter object
  const category = (id === 'free-vpn-risks') ? '机场推荐' : art.category;
  const categoryClass = (id === 'free-vpn-risks') ? 'tag-airport' : (art.categoryClass || 'tag-proxy');
  const categoryIcon = (id === 'free-vpn-risks') ? 'fa-solid fa-plane-departure' : (art.categoryIcon || 'fa-solid fa-paper-plane');

  const frontmatter = {
    title: cleanTitle,
    category: category,
    categoryClass: categoryClass,
    categoryIcon: categoryIcon,
    date: art.date,
    readingTime: art.readingTime,
    views: art.views || '2.5k',
    lead: cleanLead,
    description: cleanDesc,
    keywords: keywordsMap[id] || [cleanTitle],
    faqs: cleanFaqs,
    relatedArticles: rel,
    prevId: art.prevId || null,
    nextId: art.nextId || null
  };

  const yaml = `---
title: "${frontmatter.title.replace(/"/g, '\\"')}"
category: "${frontmatter.category}"
categoryClass: "${frontmatter.categoryClass}"
categoryIcon: "${frontmatter.categoryIcon}"
date: "${frontmatter.date}"
readingTime: "${frontmatter.readingTime}"
views: "${frontmatter.views}"
lead: "${frontmatter.lead.replace(/"/g, '\\"')}"
description: "${frontmatter.description.replace(/"/g, '\\"')}"
keywords: ${JSON.stringify(frontmatter.keywords, null, 2)}
faqs:
${frontmatter.faqs.map(f => `  - q: "${f.q.replace(/"/g, '\\"')}"\n    a: "${f.a.replace(/"/g, '\\"')}"`).join('\n')}
relatedArticles: ${JSON.stringify(frontmatter.relatedArticles)}
prevId: ${frontmatter.prevId ? `"${frontmatter.prevId}"` : 'null'}
nextId: ${frontmatter.nextId ? `"${frontmatter.nextId}"` : 'null'}
---

${body.trim()}
`;

  fs.writeFileSync(path.join(outputDir, `${id}.md`), yaml, 'utf8');
  convertedCount++;
}

console.log(`Successfully converted ${convertedCount} articles into src/content/posts/*.md!`);
