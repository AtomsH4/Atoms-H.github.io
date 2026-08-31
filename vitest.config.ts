import { getViteConfig } from 'astro/config';
import { configDefaults } from 'vitest/config';
import type {} from 'vitest/config';

export default getViteConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    exclude: [...configDefaults.exclude, 'tests/e2e/**'],
  },
});
