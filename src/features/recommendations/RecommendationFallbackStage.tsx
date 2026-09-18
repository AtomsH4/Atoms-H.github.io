import type { CSSProperties } from 'react';

import { RecommendationCover } from './RecommendationCover';
import styles from './RecommendationExperience.module.css';
import {
  resolvePresentation,
  type RecommendationItem,
} from './recommendation-types';
import { getStageItems } from './stage-layout';
import { useDragRotation } from './useDragRotation';

export type RecommendationFallbackStageProps = {
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
};

const PhysicalObject = ({
  item,
  active,
  offset,
  onSelect,
}: {
  item: RecommendationItem;
  active: boolean;
  offset: number;
  onSelect: (id: string) => void;
}) => {
  const { rotation, pointerHandlers } = useDragRotation();
  const presentation = resolvePresentation(item.category, item.presentation);
  const style = {
    '--rx': `${active ? rotation.rotationX : 0}deg`,
    '--ry': `${active ? rotation.rotationY : 0}deg`,
  } as CSSProperties;

  return (
    <button
      type="button"
      className={`${styles.cssObject} ${
        presentation === 'disc' ? styles.cssDisc : styles.cssBook
      }`}
      aria-label={`${active ? '旋转' : '选择'} ${item.title}`}
      aria-current={active ? 'true' : undefined}
      data-dragging={String(active && rotation.dragging)}
      data-offset={offset}
      data-presentation={presentation}
      style={style}
      onClick={active ? undefined : () => onSelect(item.id)}
      {...(active ? pointerHandlers : {})}
    >
      {presentation === 'disc' ? (
        <>
          <span className={styles.cssDiscEdge} aria-hidden="true" />
          <span className={styles.cssFace}>
            <RecommendationCover item={item} />
          </span>
          <span className={styles.cssDiscHub} aria-hidden="true" />
        </>
      ) : (
        <>
          <span className={styles.cssBookPages} aria-hidden="true" />
          <span className={styles.cssBookSpine} aria-hidden="true" />
          <span className={styles.cssFace}>
            <RecommendationCover item={item} />
          </span>
        </>
      )}
    </button>
  );
};

export const RecommendationFallbackStage = ({
  items,
  activeId,
  compact,
  reducedMotion,
  onSelect,
}: RecommendationFallbackStageProps) => {
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const stageItems = getStageItems(
    items.map((item) => item.id),
    activeId,
    compact,
  );

  return (
    <div
      className={styles.cssStage}
      data-compact={String(compact)}
      data-reduced-motion={String(reducedMotion)}
      data-testid="recommendation-fallback-stage"
    >
      {stageItems.map(({ id, offset }) => {
        const item = itemsById.get(id);
        if (!item) return null;

        return (
          <PhysicalObject
            key={id}
            item={item}
            active={id === activeId}
            offset={offset}
            onSelect={onSelect}
          />
        );
      })}
    </div>
  );
};
