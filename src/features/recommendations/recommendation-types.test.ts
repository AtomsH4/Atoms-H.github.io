import { describe, expect, it } from 'vitest';

import {
  presentationValues,
  recommendationCategoryConfig,
  recommendationCategoryValues,
  resolvePresentation,
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
