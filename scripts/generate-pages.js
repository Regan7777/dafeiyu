const fs = require('fs');

// 1. Generate tools.astro
const toolsHtml = fs.readFileSync('tools.html', 'utf8');
const toolsMainIdx = toolsHtml.indexOf('<main');
const toolsMainEnd = toolsHtml.indexOf('</main>') + 7;
let toolsMain = toolsHtml.slice(toolsMainIdx, toolsMainEnd);

toolsMain = toolsMain.replace(/article\.html\?id=([a-zA-Z0-9_-]+)/g, '/article/$1');
toolsMain = toolsMain.replace(/href="index\.html"/g, 'href="/"');

const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu;
toolsMain = toolsMain.replace(emojiRegex, '');

const toolsAstro = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="实用工具箱与常用导航"
  description="精心筛选并整理的优质科学上网客户端、AI生产力助手、网络诊断测速与实用订阅工具，开箱即用，提升日常数字生活效率。"
  keywords={['科学上网客户端', 'Clash Verge Rev', 'Sing-box', 'v2rayN', 'ChatGPT', 'Claude', 'Speedtest', 'Subconverter']}
  type="website"
  canonicalPath="/tools"
>
  ${toolsMain}

  <script is:inline>
    // Tab filtering for tools
    const toolTabs = document.querySelectorAll('.tool-tab-btn');
    const toolCards = document.querySelectorAll('.tool-card');

    toolTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        toolTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.getAttribute('data-tab');
        toolCards.forEach(card => {
          if (cat === 'all' || card.getAttribute('data-category') === cat) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  </script>
</BaseLayout>
`;

fs.writeFileSync('src/pages/tools.astro', toolsAstro, 'utf8');
console.log('src/pages/tools.astro written successfully!');

// 2. Generate tags.astro
const tagsHtml = fs.readFileSync('tags.html', 'utf8');
const tagsMainIdx = tagsHtml.indexOf('<main');
const tagsMainEnd = tagsHtml.indexOf('</main>') + 7;
let tagsMain = tagsHtml.slice(tagsMainIdx, tagsMainEnd);

tagsMain = tagsMain.replace(/article\.html\?id=([a-zA-Z0-9_-]+)/g, '/article/$1');
tagsMain = tagsMain.replace(/href="index\.html"/g, 'href="/"');
tagsMain = tagsMain.replace(emojiRegex, '');

const tagsAstro = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="标签聚合与全站索引"
  description="按标签快速检索全站关于 Clash、Sing-box、机场推荐、流媒体解锁、DeepSeek 与效率神器的核心技术干货。"
  keywords={['文章标签', 'Clash', 'Sing-box', '机场推荐', '流媒体解锁', 'DeepSeek', 'Chrome扩展']}
  type="website"
  canonicalPath="/tags"
>
  ${tagsMain}

  <script is:inline>
    // Client-side tag filtering
    const tagPills = document.querySelectorAll('.tag-pill-interactive');
    const tagCards = document.querySelectorAll('.article-card-tag');
    const tagCount = document.getElementById('tagMatchCount');
    const curTag = document.getElementById('currentSelectedTag');

    function filterByTag(tag) {
      if (curTag) curTag.textContent = tag === 'all' ? '全部' : tag;
      let count = 0;
      tagCards.forEach(card => {
        const cardTags = card.getAttribute('data-tags') || '';
        if (tag === 'all' || cardTags.includes(tag)) {
          card.style.display = 'flex';
          count++;
        } else {
          card.style.display = 'none';
        }
      });
      if (tagCount) tagCount.textContent = count;
    }

    tagPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tagPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const tag = pill.getAttribute('data-tag');
        filterByTag(tag);
      });
    });

    // Check query param
    const urlParams = new URLSearchParams(window.location.search);
    const selectedTag = urlParams.get('tag');
    if (selectedTag) {
      tagPills.forEach(p => {
        if (p.getAttribute('data-tag') === selectedTag) {
          p.classList.add('active');
        } else {
          p.classList.remove('active');
        }
      });
      filterByTag(selectedTag);
    }
  </script>
</BaseLayout>
`;

fs.writeFileSync('src/pages/tags.astro', tagsAstro, 'utf8');
console.log('src/pages/tags.astro written successfully!');

// 3. Generate about.astro
const aboutHtml = fs.readFileSync('about.html', 'utf8');
const aboutMainIdx = aboutHtml.indexOf('<main');
const aboutMainEnd = aboutHtml.indexOf('</main>') + 7;
let aboutMain = aboutHtml.slice(aboutMainIdx, aboutMainEnd);

aboutMain = aboutMain.replace(/article\.html\?id=([a-zA-Z0-9_-]+)/g, '/article/$1');
aboutMain = aboutMain.replace(/href="index\.html"/g, 'href="/"');
aboutMain = aboutMain.replace(emojiRegex, '');

const aboutAstro = `---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="关于大肥鱼与本站"
  description="大肥鱼博客介绍、原创价值观、技术测评流程与联系方式。专注高品质网络工具与前沿AI探索。"
  keywords={['关于大肥鱼', '博客介绍', '独立博主', '技术评测团队', 'E-E-A-T实体']}
  type="website"
  canonicalPath="/about"
>
  ${aboutMain}
</BaseLayout>
`;

fs.writeFileSync('src/pages/about.astro', aboutAstro, 'utf8');
console.log('src/pages/about.astro written successfully!');

