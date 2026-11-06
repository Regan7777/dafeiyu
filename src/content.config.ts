import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    categoryClass: z.string().default('tag-proxy'),
    categoryIcon: z.string().default('fa-solid fa-paper-plane'),
    date: z.string(),
    readingTime: z.string(),
    views: z.string().default('2.5k'),
    lead: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).default([]),
    faqs: z.array(z.object({
      q: z.string(),
      a: z.string()
    })).default([]),
    relatedArticles: z.array(z.string()).default([]),
    prevId: z.string().optional().nullable(),
    nextId: z.string().optional().nullable(),
  })
});

export const collections = { posts };
