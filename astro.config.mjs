import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://atomsh4.github.io',
  base: '/Atoms-H.github.io',
  integrations: [mdx(), react()],
});
