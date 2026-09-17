// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { collections } from './content.config';

const projectSchema = collections.projects.schema as {
  safeParse: (input: unknown) => { success: boolean };
};
const recommendationSchema = collections.recommendations.schema as {
  safeParse: (input: unknown) => { success: boolean };
};

const validRecommendation = {
  title: 'Kind of Blue',
  category: 'music',
  creator: 'Miles Davis',
  year: 1959,
  recommendDate: '2026-09-18',
  summary: 'A landmark modal jazz album.',
  externalUrl: 'https://en.wikipedia.org/wiki/Kind_of_Blue',
  cover: {
    kind: 'generated',
    credit: 'Original artwork generated for this site',
  },
};

describe('projects content schema', () => {
  it('rejects unknown frontmatter fields', () => {
    const result = projectSchema.safeParse({
      title: 'Project',
      summary: 'A project summary',
      pubDate: '2026-08-31',
      tags: [],
      featured: false,
      repository: 'https://github.com/AtomsH4/example',
      kind: 'own',
      drafft: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('recommendations content schema', () => {
  it('accepts a generated cover and applies boolean defaults', () => {
    const result = recommendationSchema.safeParse(validRecommendation);

    expect(result).toMatchObject({
      success: true,
      data: {
        featured: false,
        draft: false,
        cover: { kind: 'generated' },
      },
    });
  });

  it('rejects a licensed cover without licenseUrl', () => {
    const result = recommendationSchema.safeParse({
      ...validRecommendation,
      cover: {
        kind: 'licensed',
        src: '/media/recommendations/kind-of-blue.webp',
        sourceUrl: 'https://example.com/kind-of-blue',
        license: 'CC BY 4.0',
        credit: 'Example Records',
      },
    });

    expect(result.success).toBe(false);
  });

  it.each([
    ['unknown category', { category: 'podcast' }],
    ['unknown presentation', { presentation: 'poster' }],
    ['an additional field', { unexpected: true }],
    ['an HTTP external URL', { externalUrl: 'http://example.com/item' }],
    [
      'an HTTP licensed source URL',
      {
        cover: {
          kind: 'licensed',
          src: '/media/recommendations/kind-of-blue.svg',
          sourceUrl: 'http://example.com/kind-of-blue',
          license: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          credit: 'Example Records',
        },
      },
    ],
    [
      'an HTTP license URL',
      {
        cover: {
          kind: 'licensed',
          src: '/media/recommendations/kind-of-blue.svg',
          sourceUrl: 'https://example.com/kind-of-blue',
          license: 'CC BY 4.0',
          licenseUrl: 'http://creativecommons.org/licenses/by/4.0/',
          credit: 'Example Records',
        },
      },
    ],
  ])('rejects %s', (_label, override) => {
    const result = recommendationSchema.safeParse({
      ...validRecommendation,
      ...override,
    });

    expect(result.success).toBe(false);
  });
});
