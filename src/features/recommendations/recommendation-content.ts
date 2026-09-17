import { joinBasePath } from '../../lib/site-path';
import {
  resolvePresentation,
  type RecommendationItem,
} from './recommendation-types';

export type RecommendationEntry = {
  id: string;
  data: Omit<RecommendationItem, 'id' | 'presentation'> & {
    presentation?: RecommendationItem['presentation'];
    recommendDate: Date;
    featured: boolean;
    draft: boolean;
  };
};

export const getPublishedRecommendations = <T extends RecommendationEntry>(
  entries: readonly T[],
): T[] =>
  entries
    .filter((entry) => !entry.data.draft)
    .sort(
      (left, right) =>
        right.data.recommendDate.getTime() -
        left.data.recommendDate.getTime(),
    );

export const getFeaturedRecommendations = <T extends RecommendationEntry>(
  entries: readonly T[],
  limit = 3,
): T[] =>
  getPublishedRecommendations(entries)
    .filter((entry) => entry.data.featured)
    .slice(0, limit);

export const toRecommendationItem = (
  entry: RecommendationEntry,
  basePath: string,
): RecommendationItem => ({
  id: entry.id,
  title: entry.data.title,
  category: entry.data.category,
  presentation: resolvePresentation(
    entry.data.category,
    entry.data.presentation,
  ),
  creator: entry.data.creator,
  year: entry.data.year,
  summary: entry.data.summary,
  externalUrl: entry.data.externalUrl,
  cover:
    entry.data.cover.kind === 'licensed'
      ? {
          ...entry.data.cover,
          src: joinBasePath(basePath, entry.data.cover.src),
        }
      : entry.data.cover,
});
