import { useEffect, useState, type CSSProperties } from 'react';

import { getGeneratedCoverPalette } from './create-cover-texture';
import type { RecommendationItem } from './recommendation-types';
import styles from './RecommendationExperience.module.css';

export type RecommendationCoverProps = {
  item: RecommendationItem;
};

const GeneratedCover = ({ item }: RecommendationCoverProps) => {
  const palette = getGeneratedCoverPalette(item.id);
  const style = {
    '--cover-background': palette.background,
    '--cover-accent': palette.accent,
    '--cover-foreground': palette.foreground,
  } as CSSProperties;

  return (
    <span
      className={styles.generatedCover}
      data-cover-kind="generated"
      style={style}
    >
      <span className={styles.generatedTitle}>{item.title}</span>
      <span className={styles.generatedCreator}>{item.creator}</span>
      <span className={styles.generatedYear}>{item.year}</span>
    </span>
  );
};

export const RecommendationCover = ({ item }: RecommendationCoverProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = item.cover.kind === 'generated' ? null : item.cover.src;

  useEffect(() => {
    setImageFailed(false);
  }, [item.id, imageSource]);

  if (!imageSource || imageFailed) {
    return <GeneratedCover item={item} />;
  }

  return (
    <img
      className={styles.licensedCover}
      src={imageSource}
      alt={`${item.title} 封面`}
      onError={() => setImageFailed(true)}
    />
  );
};
