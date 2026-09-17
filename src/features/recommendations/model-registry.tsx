import type { ComponentType } from 'react';

import { BookModel } from './models/BookModel';
import { DiscModel } from './models/DiscModel';
import type {
  RecommendationItem,
  RecommendationPresentation,
} from './recommendation-types';

export type RecommendationModelProps = {
  item: RecommendationItem;
  active: boolean;
  onSelect: () => void;
};

export const recommendationModelRegistry = {
  disc: DiscModel,
  book: BookModel,
} satisfies Record<
  RecommendationPresentation,
  ComponentType<RecommendationModelProps>
>;
