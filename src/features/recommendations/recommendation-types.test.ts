import { describe, expect, it } from 'vitest';

import {
  presentationValues,
  recommendationCategoryConfig,
  recommendationCategoryValues,
  resolvePresentation,
  type RecommendationCover,
} from './recommendation-types';

describe('recommendation types', () => {
  it('keeps semantic categories separate from presentation types', () => {
    expect(recommendationCategoryValues).toEqual(['music', 'book', 'screen']);
    expect(presentationValues).toEqual(['disc', 'book']);
  });

  it('defines the screen category copy and default presentation', () => {
    expect(recommendationCategoryConfig.screen).toEqual({
      label: '影视与动画',
      creatorLabel: '导演 / 主创',
      defaultPresentation: 'disc',
    });
  });

  it('keeps remote cover provenance separate from presentation', () => {
    const cover: RecommendationCover = {
      kind: 'remote',
      src: 'https://coverartarchive.org/release-group/example/front-1200',
      sourceUrl: 'https://musicbrainz.org/release-group/example',
      provider: 'cover-art-archive',
      credit: 'Cover Art Archive / MusicBrainz contributors',
    };

    expect(cover.kind).toBe('remote');
  });

  it.each([
    ['music', undefined, 'disc'],
    ['book', undefined, 'book'],
    ['screen', undefined, 'disc'],
    ['music', 'book', 'book'],
  ] as const)(
    'resolves %s with override %s to %s',
    (category, presentation, expected) => {
      expect(resolvePresentation(category, presentation)).toBe(expected);
    },
  );
});
