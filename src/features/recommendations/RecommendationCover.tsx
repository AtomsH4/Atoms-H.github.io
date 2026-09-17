import { useEffect, useState } from 'react';

import type { RecommendationItem } from './recommendation-types';
import styles from './RecommendationExperience.module.css';

export type RecommendationCoverProps = {
  item: RecommendationItem;
};

const GeneratedCover = ({ item }: RecommendationCoverProps) => (
  <span className={styles.generatedCover} data-cover-kind="generated">
    <span className={styles.generatedTitle}>{item.title}</span>
    <span className={styles.generatedCreator}>{item.creator}</span>
    <span className={styles.generatedYear}>{item.year}</span>
  </span>
);

export const RecommendationCover = ({ item }: RecommendationCoverProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSource = item.cover.kind === 'licensed' ? item.cover.src : null;

  useEffect(() => {
    setImageFailed(false);
  }, [item.id, imageSource]);

  if (item.cover.kind === 'generated' || imageFailed) {
    return <GeneratedCover item={item} />;
  }

  return (
    <img
      className={styles.licensedCover}
      src={item.cover.src}
      alt={`${item.title} 封面`}
      onError={() => setImageFailed(true)}
    />
  );
};
