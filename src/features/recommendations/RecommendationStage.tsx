import type { RecommendationItem } from './recommendation-types';

export type RecommendationStageProps = {
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  onFailure: () => void;
};

export const RecommendationStage = ({
  activeId,
}: RecommendationStageProps) => (
  <div data-testid="recommendation-stage" data-active-id={activeId} />
);
