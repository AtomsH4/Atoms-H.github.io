import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

import { RecommendationFallback } from './RecommendationFallback';
import styles from './RecommendationExperience.module.css';
import { RecommendationStage } from './RecommendationStage';
import {
  filterRecommendationItems,
  getAdjacentRecommendationId,
  getInitialRecommendationId,
  type RecommendationFilter,
} from './recommendation-navigation';
import {
  recommendationCategoryConfig,
  recommendationCategoryValues,
  type RecommendationItem,
} from './recommendation-types';
import { useWebGLAvailability } from './useWebGLAvailability';

export type RecommendationExperienceProps =
  | { mode: 'catalog'; items: RecommendationItem[] }
  | { mode: 'featured'; items: RecommendationItem[]; allHref: string };

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia(query);
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
};

const isInteractiveArrowTarget = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest(
    'a, button, input, textarea, select, [contenteditable]:not([contenteditable="false"])',
  ) !== null;

const replaceLocationHash = (id: string) => {
  const nextUrl = `${window.location.pathname}${window.location.search}#${encodeURIComponent(id)}`;
  window.history.replaceState(window.history.state, '', nextUrl);
};

export const RecommendationExperience = (
  props: RecommendationExperienceProps,
) => {
  const { items, mode } = props;
  const { status, markFailed } = useWebGLAvailability();
  const compactViewport = useMediaQuery('(max-width: 760px)');
  const reducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );
  const compact = mode === 'featured' || compactViewport;
  const [filter, setFilter] = useState<RecommendationFilter>('all');
  const filteredItems = useMemo(
    () => filterRecommendationItems(items, filter),
    [filter, items],
  );
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.id ?? null,
  );
  const [hashReady, setHashReady] = useState(mode !== 'catalog');
  const [statusMessage, setStatusMessage] = useState('');
  const statusReady = useRef(false);
  const previousVisibleActiveId = useRef<string | null>(null);

  useEffect(() => {
    if (mode === 'catalog') {
      setHashReady(false);
      setActiveId(getInitialRecommendationId(items, window.location.hash));
      setHashReady(true);
      return;
    }

    setHashReady(true);
    setFilter('all');
    setActiveId((currentId) =>
      items.some((item) => item.id === currentId)
        ? currentId
        : (items[0]?.id ?? null),
    );
  }, [items, mode]);

  useEffect(() => {
    if (!filteredItems.some((item) => item.id === activeId)) {
      setActiveId(filteredItems[0]?.id ?? null);
    }
  }, [activeId, filteredItems]);

  useEffect(() => {
    if (
      mode === 'catalog' &&
      hashReady &&
      activeId &&
      filteredItems.some((item) => item.id === activeId)
    ) {
      replaceLocationHash(activeId);
    }
  }, [activeId, filteredItems, hashReady, mode]);

  const selectItem = useCallback(
    (id: string) => {
      if (filteredItems.some((item) => item.id === id)) {
        setActiveId(id);
      }
    },
    [filteredItems],
  );

  const selectAdjacent = useCallback(
    (direction: -1 | 1) => {
      const nextId = getAdjacentRecommendationId(
        filteredItems,
        activeId,
        direction,
      );

      if (nextId) setActiveId(nextId);
    },
    [activeId, filteredItems],
  );

  const selectFilter = (nextFilter: RecommendationFilter) => {
    const nextItems = filterRecommendationItems(items, nextFilter);

    setFilter(nextFilter);
    setActiveId(nextItems[0]?.id ?? null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') ||
      isInteractiveArrowTarget(event.target)
    ) {
      return;
    }

    const direction = event.key === 'ArrowLeft' ? -1 : 1;
    const nextId = getAdjacentRecommendationId(
      filteredItems,
      activeId,
      direction,
    );

    if (nextId) {
      event.preventDefault();
      setActiveId(nextId);
    }
  };

  const activeItem =
    filteredItems.find((item) => item.id === activeId) ??
    filteredItems[0] ??
    null;
  const visibleActiveId = activeItem?.id ?? null;

  useEffect(() => {
    if ((mode === 'catalog' && !hashReady) || !activeItem) {
      statusReady.current = false;
      previousVisibleActiveId.current = null;
      return;
    }

    if (!statusReady.current) {
      statusReady.current = true;
      previousVisibleActiveId.current = activeItem.id;
      return;
    }

    if (previousVisibleActiveId.current !== activeItem.id) {
      previousVisibleActiveId.current = activeItem.id;
      setStatusMessage(`当前推荐：${activeItem.title}`);
    }
  }, [activeItem, hashReady, mode]);

  if (items.length === 0) {
    return <p className={styles.emptyState}>推荐正在整理中。</p>;
  }

  return (
    <section
      className={styles.experience}
      aria-label="推荐浏览"
      data-recommendation-experience=""
      data-reduced-motion={String(reducedMotion)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <p
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </p>

      {mode === 'catalog' ? (
        <div className={styles.toolbar} role="toolbar" aria-label="筛选推荐">
          <button
            type="button"
            aria-pressed={filter === 'all'}
            onClick={() => selectFilter('all')}
          >
            全部
          </button>
          {recommendationCategoryValues.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filter === category}
              onClick={() => selectFilter(category)}
            >
              {recommendationCategoryConfig[category].label}
            </button>
          ))}
        </div>
      ) : (
        <a className={styles.allLink} href={props.allHref}>
          查看全部推荐
        </a>
      )}

      {activeItem ? (
        <>
          <div className={styles.metadata}>
            <p className={styles.categoryLabel}>
              {recommendationCategoryConfig[activeItem.category].label}
            </p>
            <h2>{activeItem.title}</h2>
            <dl className={styles.details}>
              <div>
                <dt>
                  {
                    recommendationCategoryConfig[activeItem.category]
                      .creatorLabel
                  }
                </dt>
                <dd>{activeItem.creator}</dd>
              </div>
              <div>
                <dt>年份</dt>
                <dd>{activeItem.year}</dd>
              </div>
            </dl>
            <p className={styles.summary}>{activeItem.summary}</p>
            <p className={styles.coverCredit}>
              {activeItem.cover.kind === 'licensed' ? (
                <>
                  <span>封面来源与署名：</span>
                  <a
                    href={activeItem.cover.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeItem.cover.credit}
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                  {' · '}
                  <span>许可：</span>
                  <a
                    href={activeItem.cover.licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeItem.cover.license}
                    <span className="sr-only">（在新标签页打开）</span>
                  </a>
                </>
              ) : (
                <>原创排版：{activeItem.cover.credit}</>
              )}
            </p>
            <a
              className={styles.externalLink}
              href={activeItem.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`查看 ${activeItem.title} 的外部详情`}
              aria-describedby={`recommendation-external-hint-${activeItem.id}`}
            >
              查看作品详情
              <span
                id={`recommendation-external-hint-${activeItem.id}`}
                className="sr-only"
              >
                （在新标签页打开）
              </span>
            </a>
          </div>

          <div className={styles.stage}>
            {status === 'available' && visibleActiveId ? (
              <RecommendationStage
                items={filteredItems}
                activeId={visibleActiveId}
                compact={compact}
                reducedMotion={reducedMotion}
                onSelect={selectItem}
                onFailure={markFailed}
              />
            ) : (
              <RecommendationFallback
                items={filteredItems}
                activeId={visibleActiveId}
                onSelect={selectItem}
              />
            )}
          </div>

          {(status === 'unavailable' || status === 'failed') && (
            <p className={styles.fallbackNotice}>
              {status === 'failed'
                ? '3D 初始化失败，当前使用二维推荐视图。'
                : '当前设备使用二维推荐视图。'}
            </p>
          )}
        </>
      ) : (
        <p className={styles.emptyState}>该分类暂无推荐。</p>
      )}

      {mode === 'catalog' && (
        <nav className={styles.navigation} aria-label="推荐项目导航">
          <button
            type="button"
            disabled={filteredItems.length < 2}
            onClick={() => selectAdjacent(-1)}
          >
            上一项
          </button>
          <button
            type="button"
            disabled={filteredItems.length < 2}
            onClick={() => selectAdjacent(1)}
          >
            下一项
          </button>
        </nav>
      )}
    </section>
  );
};

export default RecommendationExperience;
