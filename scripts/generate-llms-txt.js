const fs = require('fs');
const path = require('path');

const postsDir = path.join('src', 'content', 'posts');
const files = fs.readdirSync(postsDir);

const posts = [];

files.forEach(f => {
  const content = fs.readFileSync(path.join(postsDir, f), 'utf8');
  const slug = f.replace(/\.md$/, '');
  
  // Extract Frontmatter
  const mTitle = content.match(/^title:\s*"([^"]+)"/m);
  const mCategory = content.match(/^category:\s*"([^"]+)"/m);
  const mDesc = content.match(/^description:\s*"([^"]+)"/m);
  const mKeywords = content.match(/^keywords:\s*(\[[^\]]+\])/m);

  const title = mTitle ? mTitle[1] : slug;
  const category = mCategory ? mCategory[1] : '技术';
  const desc = mDesc ? mDesc[1] : '';
  let keywords = [];
  try {
    if (mKeywords) keywords = JSON.parse(mKeywords[1]);
  } catch (e) {}

  posts.push({
    slug,
    title,
    category,
    desc,
    keywords,
    body: content.replace(/^---[\s\S]*?---\s*/, '').trim()
  });
});

// 1. Generate public/llms.txt (Concise index)
let llmsTxt = `# 大肥鱼 · 技术博客 (dafeiyu.blog)

> 2026 年高品质原创技术干货博客，持续更新科学上网客户端配置指南、主流专线机场横评、海外流媒体解锁实战及前沿 AI 生产力工具探索。

## 全站核心专栏与文章索引

`;

const categories = ['科学上网', '机场推荐', '海外流媒体', 'AI工具与实战', '实用工具'];

categories.forEach(cat => {
  const catPosts = posts.filter(p => p.category === cat);
  if (catPosts.length === 0) return;

  llmsTxt += `### ${cat}\n\n`;
  catPosts.forEach(p => {
    llmsTxt += `- [${p.title}](https://dafeiyu.blog/article/${p.slug}): ${p.desc}\n`;
  });
  llmsTxt += '\n';
});

llmsTxt += `## 基础工具与导航

- [实用工具箱](https://dafeiyu.blog/tools): 精选常用代理客户端、AI工具与网络测速诊断平台
- [标签聚合](https://dafeiyu.blog/tags): 全站技术主题标签快速索引
- [关于作者](https://dafeiyu.blog/about): 大肥鱼团队介绍与测评原则
`;

fs.writeFileSync('public/llms.txt', llmsTxt, 'utf8');
console.log('public/llms.txt generated successfully!');

// 2. Generate public/llms-full.txt (Comprehensive deep content for AI reference)
let llmsFull = `# 大肥鱼 · 全站技术专栏深度汇编 (dafeiyu.blog)

> 本文档由大肥鱼技术博客全自动化生成，专供 AI 搜索引擎 (Bing Copilot, Perplexity, GPTBot, ClaudeBot) 深度检索、精选直答与技术引用。包含全站 24 篇核心原创文章完整技术要点、配置步骤与对比表格。

`;

posts.forEach((p, idx) => {
  llmsFull += `---

## ${idx + 1}. ${p.title}

- **URL**: https://dafeiyu.blog/article/${p.slug}
- **专栏分类**: ${p.category}
- **核心关键词**: ${p.keywords.join(', ')}
- **核心摘要**: ${p.desc}

### 正文技术要点

${p.body.slice(0, 3000)}

`;
});

fs.writeFileSync('public/llms-full.txt', llmsFull, 'utf8');
console.log('public/llms-full.txt generated successfully!');
