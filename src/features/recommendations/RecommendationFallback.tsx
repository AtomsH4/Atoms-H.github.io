import { RecommendationCover } from './RecommendationCover';
import styles from './RecommendationExperience.module.css';
import type { RecommendationItem } from './recommendation-types';

export type RecommendationFallbackProps = {
  items: RecommendationItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

export const RecommendationFallback = ({
  items,
  activeId,
  onSelect,
}: RecommendationFallbackProps) => (
  <ul className={styles.fallbackList} aria-label="推荐封面列表">
    {items.map((item) => (
      <li key={item.id}>
        <button
          className={styles.fallbackButton}
          type="button"
          aria-label={`选择 ${item.title}`}
          aria-pressed={item.id === activeId}
          onClick={() => onSelect(item.id)}
        >
          <RecommendationCover item={item} />
        </button>
      </li>
    ))}
  </ul>
);
