import type {
  RecommendationCategory,
  RecommendationItem,
} from './recommendation-types';

export type RecommendationFilter = 'all' | RecommendationCategory;

export const filterRecommendationItems = (
  items: RecommendationItem[],
  filter: RecommendationFilter,
): RecommendationItem[] =>
  filter === 'all'
    ? items
    : items.filter((item) => item.category === filter);

export const getInitialRecommendationId = (
  items: RecommendationItem[],
  hash: string,
): string | null => {
  let candidate: string;

  try {
    candidate = decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return items[0]?.id ?? null;
  }

  return items.find((item) => item.id === candidate)?.id ?? items[0]?.id ?? null;
};

export const getAdjacentRecommendationId = (
  items: RecommendationItem[],
  activeId: string | null,
  direction: -1 | 1,
): string | null => {
  if (items.length < 2) return null;

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const currentIndex = activeIndex === -1 ? 0 : activeIndex;

  return items[(currentIndex + direction + items.length) % items.length].id;
};
