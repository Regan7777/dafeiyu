import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
  const rawPosts = await getCollection('posts');
  const posts = rawPosts.sort((a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime());
  const siteUrl = 'https://dafeiyu.blog';
  const latestDate = posts.length > 0 ? posts[0].data.date : '2026-11-06';

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/tools', priority: '0.8', changefreq: 'weekly' },
    { url: '/tags', priority: '0.7', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${siteUrl}${p.url}</loc>
    <lastmod>${latestDate}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${posts.map(p => `  <url>
    <loc>${siteUrl}/article/${p.id}</loc>
    <lastmod>${p.data.date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`.trim();

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
