/**
 * 大肥鱼 (DaFeiYu) Blog - Main JavaScript (dafeiyu.blog)
 * Complete Interactive Features:
 * 1. Theme Management (Light / Dark mode with local storage persistence)
 * 2. Real-time Article Category Filtering (技术、效率、工具推荐、教程、资源)
 * 3. Tag Cloud & Tag Pill Real-time Filtering
 * 4. Active Filter Notice Bar with Clear Action
 * 5. URL Query Parameter Support (?category=... & ?tag=...)
 * 6. Tools Page (tools.html) Category Tabs & Search Filtering
 * 7. Mobile sidebar toggle & overlay handling
 * 8. Live search input filter
 * 9. Article reading progress bar update
 * 10. Automatic Table of Contents (TOC) & Section Observer
 * 11. Interactive Card hover effects & Comment submission
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化黑白/明暗主题切换
  initTheme();

  // 2. 页面加载动画（淡入）
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
  });

  // 3. 移动端侧边栏 toggle
  const sidebar = document.querySelector('.sidebar-left');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sidebar && sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  // 4. 搜索框实时过滤 (自适应文章列表与工具列表)
  const searchInput = document.getElementById('searchInput');
  const searchWrapper = document.querySelector('.search-inner');

  if (searchInput && searchWrapper) {
    searchInput.addEventListener('focus', () => {
      searchWrapper.style.transform = 'scale(1.02)';
    });

    searchInput.addEventListener('blur', () => {
      searchWrapper.style.transform = 'scale(1)';
    });

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim().toLowerCase();

      // 如果在工具页 (tools.html)
      const toolCards = document.querySelectorAll('.tools-grid .tool-card');
      if (toolCards.length > 0) {
        toolCards.forEach(card => {
          const name = card.querySelector('.tool-name')?.textContent.toLowerCase() || '';
          const desc = card.querySelector('.tool-desc')?.textContent.toLowerCase() || '';
          if (!query || name.includes(query) || desc.includes(query)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
        return;
      }

      // 首页文章过滤
      const articleCards = document.querySelectorAll('.articles-grid .article-card, .featured-grid .featured-card');
      if (articleCards.length > 0) {
        articleCards.forEach(card => {
          const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
          const excerpt = card.querySelector('.card-excerpt')?.textContent.toLowerCase() || '';
          const tag = card.querySelector('.tag-pill')?.textContent.toLowerCase() || '';
          const dataTags = card.getAttribute('data-tags')?.toLowerCase() || '';

          if (!query || title.includes(query) || excerpt.includes(query) || tag.includes(query) || dataTags.includes(query)) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });
  }

  // 5. 初始化文章分类与标签筛选功能
  initArticleFilters();

  // 6. 初始化工具页功能 (tools.html)
  initToolsPage();

  // 7. 初始化标签页功能 (tags.html)
  initTagsPage();

  // 8. 文章页：滚动进度条更新
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        progressBar.style.width = `${progress}%`;
      }
    }, { passive: true });
  }

  // 7. 文章页：动态渲染所点击的文章数据（标题、分类、正文、目录 100% 对照）
  renderArticleDetail();

  // 初始化右下角一键置顶
  initBackToTop();

  // 8. 文章页：自动生成 TOC & TOC 高亮当前章节
  initTableOfContents();

  // 9. 微交互卡片效果 (鼠标移动光影)
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 代码高亮初始化 (Highlight.js)
  if (typeof hljs !== 'undefined') {
    hljs.highlightAll();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});

/**
 * 分类与标签即时联动筛选系统
 */
function initArticleFilters() {
  const articlesGrid = document.getElementById('articlesGrid');
  const filterBar = document.getElementById('activeFilterBar');
  const filterNameEl = document.getElementById('filterName');
  const filterCountEl = document.getElementById('filterCount');
  const filterClearBtn = document.getElementById('filterClearBtn');
  const categoryItems = document.querySelectorAll('.sidebar-categories .category-item');
  const navArticles = document.getElementById('navArticles');
  const navHome = document.getElementById('navHome');

  if (!articlesGrid) {
    // 如果不在首页，为侧栏分类添加跳转链接支持并同步真实文章数
    try {
      const saved = JSON.parse(localStorage.getItem('dafeiyu_category_counts') || '{"科学上网":7,"机场推荐":7,"海外流媒体":3,"AI工具与实战":4,"实用工具":3}');
      categoryItems.forEach(item => {
        const cat = (item.getAttribute('data-category') || '').trim().replace(/\s+/g, '');
        const badge = item.querySelector('.category-badge-count');
        if (badge && saved[cat] !== undefined) {
          badge.textContent = saved[cat];
        }
        const a = item.querySelector('a');
        if (cat && a && (!a.href || a.href.includes('javascript:'))) {
          a.href = `index.html?category=${encodeURIComponent(cat)}`;
        }
      });
    } catch (e) {}
    return;
  }

  const allArticles = articlesGrid.querySelectorAll('.article-card');
  const featuredSection = document.querySelector('.featured-section');

  // 动态同步各分类真实文章数至侧边栏徽标
  function syncRealCategoryCounts() {
    const counts = {
      '科学上网': 0,
      '机场推荐': 0,
      '海外流媒体': 0,
      'AI工具与实战': 0,
      '实用工具': 0
    };

    allArticles.forEach(card => {
      const cat = (card.getAttribute('data-category') || '').trim().replace(/\s+/g, '');
      if (counts.hasOwnProperty(cat)) {
        counts[cat]++;
      } else {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    try {
      localStorage.setItem('dafeiyu_category_counts', JSON.stringify(counts));
    } catch (e) {}

    categoryItems.forEach(item => {
      const cat = (item.getAttribute('data-category') || '').trim().replace(/\s+/g, '');
      const badge = item.querySelector('.category-badge-count');
      if (badge && counts[cat] !== undefined) {
        badge.textContent = counts[cat];
      }
    });
  }

  // 立即计算并渲染真实数量
  syncRealCategoryCounts();

  // 绑定侧栏分类点击事件
  categoryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const category = item.getAttribute('data-category');
      if (category) {
        applyCategoryFilter(category);
      }
    });
  });

  // 绑定标签云点击事件
  const tagItems = document.querySelectorAll('.tag-cloud-item');
  tagItems.forEach(tagEl => {
    tagEl.addEventListener('click', (e) => {
      e.preventDefault();
      const tagName = tagEl.textContent.trim();
      applyTagFilter(tagName);
    });
  });

  // 绑定文章卡片内部的标签胶囊 (tag-pill)
  document.querySelectorAll('.articles-grid .tag-pill, .featured-grid .tag-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const catOrTag = pill.textContent.trim();
      applyCategoryFilter(catOrTag);
    });
  });

  // 清除筛选按钮
  if (filterClearBtn) {
    filterClearBtn.addEventListener('click', resetAllFilters);
  }

  // 导航栏点击“首页”时重置筛选
  if (navHome) {
    navHome.addEventListener('click', (e) => {
      if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
        e.preventDefault();
        resetAllFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // 导航栏点击“文章”时平滑滚动到最新文章
  if (navArticles) {
    navArticles.addEventListener('click', (e) => {
      e.preventDefault();
      const section = document.getElementById('latestArticles');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // 执行分类筛选
  function applyCategoryFilter(category) {
    let matchCount = 0;
    const cleanCategory = category.trim().replace(/\s+/g, '');

    // 精选文章区筛选时暂时隐藏，突出分类列表
    if (featuredSection) {
      featuredSection.style.display = 'none';
    }

    allArticles.forEach(card => {
      const cardCat = (card.getAttribute('data-category') || '').trim().replace(/\s+/g, '');
      const cardTags = (card.getAttribute('data-tags') || '').toLowerCase();
      const pillText = (card.querySelector('.tag-pill')?.textContent.trim() || '').replace(/\s+/g, '');

      const isMatch = cardCat === cleanCategory ||
                      cardCat.includes(cleanCategory) ||
                      pillText === cleanCategory ||
                      cardTags.includes(category.toLowerCase());

      if (isMatch) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // 更新侧边栏高亮
    categoryItems.forEach(item => {
      const itemCat = (item.getAttribute('data-category') || '').trim().replace(/\s+/g, '');
      if (itemCat === cleanCategory) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // 显示筛选提示条
    if (filterBar) {
      filterBar.style.display = 'flex';
      if (filterNameEl) filterNameEl.textContent = `分类：${category}`;
      if (filterCountEl) filterCountEl.textContent = `（共 ${matchCount} 篇文章）`;
    }

    // 更新 URL Query
    const newUrl = `${window.location.pathname}?category=${encodeURIComponent(category)}#latestArticles`;
    history.pushState({ category }, '', newUrl);

    // 平滑滚动至文章区
    const section = document.getElementById('latestArticles');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // 执行标签筛选
  function applyTagFilter(tagName) {
    let matchCount = 0;
    if (featuredSection) featuredSection.style.display = 'none';

    allArticles.forEach(card => {
      const title = card.querySelector('.card-title')?.textContent || '';
      const excerpt = card.querySelector('.card-excerpt')?.textContent || '';
      const cardTags = card.getAttribute('data-tags') || '';

      const isMatch = cardTags.toLowerCase().includes(tagName.toLowerCase()) || 
                      title.toLowerCase().includes(tagName.toLowerCase()) || 
                      excerpt.toLowerCase().includes(tagName.toLowerCase());

      if (isMatch) {
        card.style.display = '';
        matchCount++;
      } else {
        card.style.display = 'none';
      }
    });

    categoryItems.forEach(item => item.classList.remove('active'));

    if (filterBar) {
      filterBar.style.display = 'flex';
      if (filterNameEl) filterNameEl.textContent = `标签：#${tagName}`;
      if (filterCountEl) filterCountEl.textContent = `（共 ${matchCount} 篇文章）`;
    }

    const newUrl = `${window.location.pathname}?tag=${encodeURIComponent(tagName)}#latestArticles`;
    history.pushState({ tag: tagName }, '', newUrl);

    const section = document.getElementById('latestArticles');
    if (section) section.scrollIntoView({ behavior: 'smooth' });
  }

  // 重置全部筛选
  function resetAllFilters() {
    allArticles.forEach(card => card.style.display = '');
    if (featuredSection) featuredSection.style.display = '';
    if (filterBar) filterBar.style.display = 'none';
    categoryItems.forEach(item => item.classList.remove('active'));

    const cleanUrl = window.location.pathname;
    history.pushState(null, '', cleanUrl);
  }

  // 读取 URL 参数自动筛选 (例如从其他页面跳转过来)
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  const tagParam = urlParams.get('tag');

  if (catParam) {
    applyCategoryFilter(catParam);
  } else if (tagParam) {
    applyTagFilter(tagParam);
  }
}

/**
 * 工具页面交互功能 (tools.html)
 */
function initToolsPage() {
  const toolTabs = document.getElementById('toolTabs');
  const toolsGrid = document.getElementById('toolsGrid');

  if (!toolTabs || !toolsGrid) return;

  const tabBtns = toolTabs.querySelectorAll('.tool-tab-btn');
  const toolCards = toolsGrid.querySelectorAll('.tool-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetCategory = btn.getAttribute('data-tab');

      toolCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (targetCategory === 'all' || cardCategory === targetCategory) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/**
 * 标签页面交互功能 (tags.html)
 */
function initTagsPage() {
  const container = document.getElementById('tagsCloudContainer');
  const sectionsList = document.getElementById('tagSectionsList');
  const searchInput = document.getElementById('tagSearchInput');

  if (!container || !sectionsList) return;

  const pills = container.querySelectorAll('.tag-wall-pill');
  const sections = sectionsList.querySelectorAll('.tag-section-card');

  function filterByTag(selectedTag) {
    pills.forEach(p => {
      const tagAttr = p.getAttribute('data-tag') || '';
      if (tagAttr.toLowerCase() === selectedTag.toLowerCase()) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    if (selectedTag === 'all') {
      sections.forEach(s => s.style.display = '');
    } else {
      let firstMatched = null;
      sections.forEach(s => {
        const secTag = (s.getAttribute('data-section-tag') || '').toLowerCase();
        if (secTag === selectedTag.toLowerCase()) {
          s.style.display = '';
          if (!firstMatched) firstMatched = s;
        } else {
          s.style.display = 'none';
        }
      });

      if (firstMatched) {
        firstMatched.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // 绑定标签胶囊点击
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const tag = pill.getAttribute('data-tag');
      filterByTag(tag);
      if (tag !== 'all') {
        history.pushState(null, '', `tags.html?tag=${encodeURIComponent(tag)}`);
      } else {
        history.pushState(null, '', 'tags.html');
      }
    });
  });

  // 标签搜索实时过滤
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();

      pills.forEach(p => {
        const t = (p.getAttribute('data-tag') || '').toLowerCase();
        const text = p.textContent.toLowerCase();
        if (!q || t === 'all' || t.includes(q) || text.includes(q)) {
          p.style.display = '';
        } else {
          p.style.display = 'none';
        }
      });

      sections.forEach(s => {
        const title = (s.querySelector('.tag-section-title')?.textContent || '').toLowerCase();
        const items = s.querySelectorAll('.tag-article-item');
        let hasItem = false;
        items.forEach(item => {
          const itemText = item.textContent.toLowerCase();
          if (!q || itemText.includes(q)) {
            item.style.display = '';
            hasItem = true;
          } else {
            item.style.display = 'none';
          }
        });

        if (!q || title.includes(q) || hasItem) {
          s.style.display = '';
        } else {
          s.style.display = 'none';
        }
      });
    });
  }

  // URL 参数支持 (如 tags.html?tag=Clash)
  const params = new URLSearchParams(window.location.search);
  const tagParam = params.get('tag');
  if (tagParam) {
    filterByTag(tagParam);
  }
}

/**
 * 文章详情页动态渲染器：根据 URL 参数加载对应文章真实数据
 */
function renderArticleDetail() {
  if (typeof ARTICLES_DATA === 'undefined') return;

  const articleMain = document.querySelector('.article-card-main');
  if (!articleMain) return;

  const urlParams = new URLSearchParams(window.location.search);
  let articleId = urlParams.get('id') || 'clash-verge';

  if (!ARTICLES_DATA[articleId]) {
    articleId = 'clash-verge';
  }

  const art = ARTICLES_DATA[articleId];
  if (!art) return;

  // 1. 网页标题
  document.title = `${art.title} - 大肥鱼 · 博客 (dafeiyu.blog)`;

  // 2. 面包屑导航
  const breadcrumbCat = document.querySelector('.breadcrumbs a:nth-child(3)');
  const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
  if (breadcrumbCat) {
    breadcrumbCat.textContent = art.category;
    breadcrumbCat.href = `index.html?category=${encodeURIComponent(art.category)}`;
  }
  if (breadcrumbCurrent) {
    breadcrumbCurrent.textContent = art.title;
  }

  // 3. 文章头部胶囊标签
  const categoryContainer = document.querySelector('.article-header .article-category');
  if (categoryContainer) {
    categoryContainer.innerHTML = `
      <span class="tag-pill ${art.categoryClass}">
        <i class="${art.categoryIcon}"></i> ${art.category}
      </span>
    `;
  }

  // 4. 文章主标题
  const titleEl = document.querySelector('.article-header .article-title');
  if (titleEl) {
    titleEl.textContent = art.title;
  }

  // 5. 文章元数据
  const metaContainer = document.querySelector('.article-header .article-meta');
  if (metaContainer) {
    metaContainer.innerHTML = `
      <span class="article-meta-item">
        <i class="fa-regular fa-user"></i> 大肥鱼
      </span>
      <span class="article-meta-item">
        <i class="fa-regular fa-calendar"></i> ${art.date}
      </span>
      <span class="article-meta-item">
        <i class="fa-regular fa-clock"></i> ${art.readingTime}
      </span>
      <span class="article-meta-item">
        <i class="fa-regular fa-eye"></i> ${art.views}
      </span>
    `;
  }

  // 6. 文章正文
  const contentEl = document.querySelector('.article-content');
  if (contentEl) {
    contentEl.innerHTML = `
      <p class="article-lead">${art.lead}</p>
      ${art.contentHtml}
    `;
  }

  // 7. 上一篇 / 下一篇卡片
  const prevCard = document.querySelector('.post-navigation .nav-card.prev');
  const nextCard = document.querySelector('.post-navigation .nav-card.next');

  if (art.prevId && ARTICLES_DATA[art.prevId] && prevCard) {
    prevCard.href = `article.html?id=${art.prevId}`;
    prevCard.querySelector('.nav-title').textContent = ARTICLES_DATA[art.prevId].title;
    prevCard.style.display = 'flex';
  } else if (prevCard) {
    prevCard.style.display = 'none';
  }

  if (art.nextId && ARTICLES_DATA[art.nextId] && nextCard) {
    nextCard.href = `article.html?id=${art.nextId}`;
    nextCard.querySelector('.nav-title').textContent = ARTICLES_DATA[art.nextId].title;
    nextCard.style.display = 'flex';
  } else if (nextCard) {
    nextCard.style.display = 'none';
  }

  // 8. 重新执行代码高亮 (Highlight.js)
  if (typeof hljs !== 'undefined') {
    document.querySelectorAll('.article-content pre code').forEach(block => {
      hljs.highlightElement(block);
    });
  }
}

/**
 * 目录树（TOC）生成与高亮联动
 */
function initTableOfContents() {
  const articleContent = document.querySelector('.article-content');
  const tocNav = document.getElementById('tocNav');

  if (!articleContent || !tocNav) return;

  const headings = articleContent.querySelectorAll('h2, h3');
  tocNav.innerHTML = '';

  if (headings.length > 0) {
    headings.forEach((heading, index) => {
      let id = heading.id;
      if (!id) {
        id = `heading-${index}`;
        heading.id = id;
      }

      const link = document.createElement('a');
      link.href = `#${id}`;
      link.className = `toc-link ${heading.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2'}`;
      link.textContent = heading.textContent.replace(/^#\s*/, '').trim();

      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetEl = document.getElementById(id);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          history.pushState(null, null, `#${id}`);
        }
      });

      tocNav.appendChild(link);
    });

    const tocLinks = tocNav.querySelectorAll('.toc-link');
    const observerOptions = {
      root: null,
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0
    };

    let activeId = '';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          activeId = entry.target.id;
        }
      });

      if (activeId) {
        tocLinks.forEach(link => {
          if (link.getAttribute('href') === `#${activeId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    }, observerOptions);

    headings.forEach(heading => observer.observe(heading));
  } else {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.fontSize = '12px';
    emptyMsg.style.color = 'var(--text-muted)';
    emptyMsg.textContent = '暂无目录';
    tocNav.appendChild(emptyMsg);
  }
}

/**
 * 主题管理功能 (明暗/黑白模式切换)
 */
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  const toggleBtns = document.querySelectorAll('#themeToggleBtn, #mobileThemeToggle');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(targetTheme);
      localStorage.setItem('theme', targetTheme);
    });
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);

  const textEls = document.querySelectorAll('.theme-mode-text');
  textEls.forEach(el => {
    el.textContent = theme === 'dark' ? '深色模式' : '浅色模式';
  });

  const hljsThemeLink = document.getElementById('hljsTheme');
  if (hljsThemeLink) {
    if (theme === 'dark') {
      hljsThemeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css';
    } else {
      hljsThemeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css';
    }
  }
}


/**
 * 右下角一键置顶浮动按钮
 */
function initBackToTop() {
  let btn = document.getElementById('backToTopBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'backToTopBtn';
    btn.className = 'back-to-top-btn';
    btn.setAttribute('aria-label', '回到顶部');
    btn.setAttribute('title', '回到顶部');
    btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    document.body.appendChild(btn);
  }

  let isScrolling = false;
  function checkScroll() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 280) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
    isScrolling = false;
  }

  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      window.requestAnimationFrame(checkScroll);
      isScrolling = true;
    }
  }, { passive: true });

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 初始检查
  checkScroll();
}
