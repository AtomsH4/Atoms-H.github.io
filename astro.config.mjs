import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';

import { noteRedirects } from './config/note-redirects.mjs';

export default defineConfig({
  site: 'https://atomsh4.github.io',
  base: '/',
  redirects: noteRedirects,
  integrations: [mdx(), react()],
});
