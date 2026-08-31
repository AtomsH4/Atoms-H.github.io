import { describe, expect, it } from 'vitest';

import { joinBasePath } from './site-path';

describe('joinBasePath', () => {
  it('joins an Astro base path with a pathname and preserves the base root', () => {
    expect(joinBasePath('/Atoms-H.github.io/', '/blog/')).toBe(
      '/Atoms-H.github.io/blog/',
    );
    expect(joinBasePath('/Atoms-H.github.io/', '/')).toBe(
      '/Atoms-H.github.io/',
    );
  });
});
