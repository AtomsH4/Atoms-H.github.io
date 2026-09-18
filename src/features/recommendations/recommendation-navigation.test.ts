import { describe, expect, it } from 'vitest';

import type { RecommendationItem } from './recommendation-types';
import {
  filterRecommendationItems,
  getAdjacentRecommendationId,
  getInitialRecommendationId,
  getInitialRecommendationSelection,
} from './recommendation-navigation';

const items = ['music', 'book', 'screen'].map((category, index) => ({
  id: `item-${index + 1}`,
  title: `Item ${index + 1}`,
  category,
  presentation: category === 'book' ? 'book' : 'disc',
  creator: 'Creator',
  year: 2026,
  externalUrl: `https://example.com/${index + 1}`,
  cover: { kind: 'generated', credit: 'AtomsH4' },
})) as RecommendationItem[];

describe('recommendation navigation', () => {
  it('filters by semantic category', () => {
    expect(filterRecommendationItems(items, 'book').map((item) => item.id)).toEqual([
      'item-2',
    ]);
  });

  it('defaults to music and lets a deep link select its own category', () => {
    expect(getInitialRecommendationSelection(items, '', 'music')).toEqual({
      filter: 'music',
      activeId: 'item-1',
    });
    expect(
      getInitialRecommendationSelection(items, '#item-2', 'music'),
    ).toEqual({
      filter: 'book',
      activeId: 'item-2',
    });
    expect(
      getInitialRecommendationSelection(items, '#missing', 'music'),
    ).toEqual({
      filter: 'music',
      activeId: 'item-1',
    });
  });

  it('uses decoded valid hashes and falls back for invalid hashes', () => {
    const encodedItems = [{ ...items[0], id: 'item one' }, ...items.slice(1)];

    expect(getInitialRecommendationId(encodedItems, '#item%20one')).toBe('item one');
    expect(getInitialRecommendationId(items, '#missing')).toBe('item-1');
  });

  it('falls back for malformed percent encoding instead of throwing', () => {
    expect(getInitialRecommendationId(items, '#item-%E0%A4%A')).toBe('item-1');
  });

  it('wraps in both directions and treats an unknown active id as the first item', () => {
    expect(getAdjacentRecommendationId(items, 'item-3', 1)).toBe('item-1');
    expect(getAdjacentRecommendationId(items, 'item-1', -1)).toBe('item-3');
    expect(getAdjacentRecommendationId(items, 'missing', 1)).toBe('item-2');
  });

  it('disables navigation for fewer than two items', () => {
    expect(getAdjacentRecommendationId(items.slice(0, 1), 'item-1', 1)).toBeNull();
    expect(getAdjacentRecommendationId([], null, -1)).toBeNull();
    expect(getInitialRecommendationId([], '#item-1')).toBeNull();
  });
});
