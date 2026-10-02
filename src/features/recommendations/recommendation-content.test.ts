import { describe, expect, it } from 'vitest';

import {
  getFeaturedRecommendations,
  getPublishedRecommendations,
  toRecommendationItem,
  type RecommendationEntry,
} from './recommendation-content';

const entries: RecommendationEntry[] = [
  {
    id: 'older',
    data: {
      title: 'Older',
      category: 'book',
      creator: 'Author',
      year: 2020,
      recommendDate: new Date('2026-09-01'),
      externalUrl: 'https://example.com/older',
      featured: true,
      draft: false,
      cover: { kind: 'generated', credit: 'AtomsH4' },
    },
  },
  {
    id: 'draft',
    data: {
      title: 'Draft',
      category: 'music',
      creator: 'Artist',
      year: 2021,
      recommendDate: new Date('2026-09-18'),
      externalUrl: 'https://example.com/draft',
      featured: true,
      draft: true,
      cover: { kind: 'generated', credit: 'AtomsH4' },
    },
  },
  {
    id: 'newer-featured',
    data: {
      title: 'Newer featured',
      category: 'screen',
      creator: 'Director',
      year: 2022,
      recommendDate: new Date('2026-09-17'),
      externalUrl: 'https://example.com/newer-featured',
      featured: true,
      draft: false,
      cover: { kind: 'generated', credit: 'AtomsH4' },
    },
  },
  {
    id: 'newest-unfeatured',
    data: {
      title: 'Newest unfeatured',
      category: 'music',
      creator: 'Artist',
      year: 2023,
      recommendDate: new Date('2026-09-19'),
      externalUrl: 'https://example.com/newest-unfeatured',
      featured: false,
      draft: false,
      cover: { kind: 'generated', credit: 'AtomsH4' },
    },
  },
];

describe('recommendation content helpers', () => {
  it('filters drafts and sorts descending without mutating the input array', () => {
    const originalOrder = entries.map((entry) => entry.id);

    expect(getPublishedRecommendations(entries).map((entry) => entry.id)).toEqual([
      'newest-unfeatured',
      'newer-featured',
      'older',
    ]);
    expect(entries.map((entry) => entry.id)).toEqual(originalOrder);
  });

  it('limits homepage selections to published featured entries in date order', () => {
    expect(getFeaturedRecommendations(entries, 1).map((entry) => entry.id)).toEqual([
      'newer-featured',
    ]);
  });

  it('normalizes metadata and resolves the default presentation', () => {
    expect(toRecommendationItem(entries[0], '/Atoms-H.github.io/')).toEqual({
      id: 'older',
      title: 'Older',
      category: 'book',
      presentation: 'book',
      creator: 'Author',
      year: 2020,
      externalUrl: 'https://example.com/older',
      cover: { kind: 'generated', credit: 'AtomsH4' },
    });
  });

  it('prefixes licensed cover paths and leaves generated and remote covers unchanged', () => {
    const licensed: RecommendationEntry = {
      ...entries[0],
      id: 'licensed',
      data: {
        ...entries[0].data,
        category: 'music',
        presentation: 'book',
        cover: {
          kind: 'licensed',
          src: '/media/recommendations/cover.svg',
          sourceUrl: 'https://example.com/source',
          license: 'CC BY 4.0',
          licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          credit: 'Example artist',
        },
      },
    };

    expect(toRecommendationItem(licensed, '/Atoms-H.github.io/')).toMatchObject({
      presentation: 'book',
      cover: {
        kind: 'licensed',
        src: '/Atoms-H.github.io/media/recommendations/cover.svg',
      },
    });
    expect(toRecommendationItem(entries[0], '/Atoms-H.github.io/').cover).toEqual(
      entries[0].data.cover,
    );

    const remote: RecommendationEntry = {
      ...entries[0],
      id: 'remote',
      data: {
        ...entries[0].data,
        cover: {
          kind: 'remote',
          src: 'https://covers.openlibrary.org/b/id/314604-L.jpg?default=false',
          sourceUrl: 'https://openlibrary.org/works/OL505740W',
          provider: 'open-library',
          credit: 'Open Library cover repository',
        },
      },
    };

    expect(toRecommendationItem(remote, '/Atoms-H.github.io/').cover).toEqual(
      remote.data.cover,
    );
  });
});
