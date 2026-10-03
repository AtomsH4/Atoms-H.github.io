import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { satteri } from '@astrojs/markdown-satteri';
import { blogTables } from './src/lib/blog-tables';

const base = '/Atoms-H.github.io';

export default defineConfig({
  site: 'https://atomsh4.github.io',
  base,
  markdown: {
    processor: satteri({ hastPlugins: [blogTables] }),
  },
  redirects: {
    '/blog/acwing-book-sorting/': `${base}/notes/acwing-book-sorting/`,
    '/blog/acwing-circuit-repair/': `${base}/notes/acwing-circuit-repair/`,
    '/blog/acwing-grid-collection/': `${base}/notes/acwing-grid-collection/`,
    '/blog/acwing-maze-path/': `${base}/notes/acwing-maze-path/`,
    '/blog/acwing-mondrian/': `${base}/notes/acwing-mondrian/`,
    '/blog/leetcode-sql50-solutions/': `${base}/notes/leetcode-sql50-solutions/`,
    '/blog/luogu-p1107-cats/': `${base}/notes/luogu-p1107-cats/`,
  },
  integrations: [mdx(), react()],
});
