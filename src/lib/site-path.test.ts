import { describe, expect, it } from 'vitest';

import { joinBasePath } from './site-path';

describe('joinBasePath', () => {
  it('builds root-site links without duplicate slashes', () => {
    expect(joinBasePath('/', '/blog/')).toBe('/blog/');
    expect(joinBasePath('/', '/media/blog/diagram.svg')).toBe('/media/blog/diagram.svg');
    expect(joinBasePath('/', '/')).toBe('/');
  });

  it('joins an Astro base path with a pathname and preserves the base root', () => {
    expect(joinBasePath('/Atoms-H.github.io/', '/blog/')).toBe(
      '/Atoms-H.github.io/blog/',
    );
    expect(joinBasePath('/Atoms-H.github.io/', '/')).toBe(
      '/Atoms-H.github.io/',
    );
  });
});
