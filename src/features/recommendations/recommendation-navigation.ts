import type {
  RecommendationCategory,
  RecommendationItem,
} from './recommendation-types';

export type RecommendationFilter = RecommendationCategory;

export const filterRecommendationItems = (
  items: RecommendationItem[],
  filter: RecommendationFilter,
): RecommendationItem[] =>
  items.filter((item) => item.category === filter);

const decodeHashId = (hash: string): string | null => {
  const rawHashId = hash.replace(/^#/, '');
  if (!rawHashId) return null;

  try {
    return decodeURIComponent(rawHashId);
  } catch {
    return null;
  }
};

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

export const getInitialRecommendationSelection = (
  items: RecommendationItem[],
  hash: string,
  defaultCategory: RecommendationCategory,
): { filter: RecommendationCategory; activeId: string | null } => {
  const decodedHashId = decodeHashId(hash);
  const hashItem = decodedHashId
    ? items.find((item) => item.id === decodedHashId)
    : undefined;

  if (hashItem) {
    return { filter: hashItem.category, activeId: hashItem.id };
  }

  const defaultItem =
    items.find((item) => item.category === defaultCategory) ?? items[0] ?? null;

  return {
    filter: defaultItem?.category ?? defaultCategory,
    activeId: defaultItem?.id ?? null,
  };
};

export const getAdjacentRecommendationId = (
  items: RecommendationItem[],
  activeId: string | null,
  direction: -1 | 1,
): string | null => {
  if (items.length < 2) return null;

  return getRecommendationIdAtOffset(items, activeId, direction);
};

export const getRecommendationIdAtOffset = (
  items: RecommendationItem[],
  activeId: string | null,
  offset: number,
): string | null => {
  if (items.length === 0) return null;

  const activeIndex = items.findIndex((item) => item.id === activeId);
  const currentIndex = activeIndex === -1 ? 0 : activeIndex;
  const nextIndex =
    ((currentIndex + offset) % items.length + items.length) % items.length;

  return items[nextIndex]?.id ?? null;
};
