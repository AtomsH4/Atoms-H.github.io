import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RecommendationCover } from './RecommendationCover';
import { RecommendationExperience } from './RecommendationExperience';
import type { RecommendationItem } from './recommendation-types';

vi.mock('./RecommendationStage', () => ({
  RecommendationStage: ({
    activeId,
    compact,
    reducedMotion,
  }: {
    activeId: string;
    compact: boolean;
    reducedMotion: boolean;
  }) => (
    <div
      data-testid="recommendation-stage"
      data-active-id={activeId}
      data-compact={String(compact)}
      data-reduced-motion={String(reducedMotion)}
    />
  ),
}));

const webGLState = vi.hoisted(() => ({ status: 'available' }));

vi.mock('./useWebGLAvailability', () => ({
  useWebGLAvailability: () => ({
    status: webGLState.status,
    markFailed: vi.fn(),
  }),
}));

const mockWebGLStatus = (
  status: 'checking' | 'available' | 'unavailable' | 'failed',
) => {
  webGLState.status = status;
};

const items: RecommendationItem[] = [
  {
    id: 'music-item',
    title: 'Music title',
    category: 'music',
    presentation: 'disc',
    creator: 'Artist',
    year: 2026,
    summary: 'Music summary',
    externalUrl: 'https://example.com/music',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
  {
    id: 'book-item',
    title: 'Book title',
    category: 'book',
    presentation: 'book',
    creator: 'Author',
    year: 2025,
    summary: 'Book summary',
    externalUrl: 'https://example.com/book',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
  {
    id: 'screen-item',
    title: 'Screen title',
    category: 'screen',
    presentation: 'disc',
    creator: 'Director',
    year: 2024,
    summary: 'Screen summary',
    externalUrl: 'https://example.com/screen',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
];

beforeEach(() => {
  webGLState.status = 'available';
  window.history.replaceState(null, '', '/');
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('RecommendationExperience', () => {
  it('filters categories and keeps one explicit active item', async () => {
    const user = userEvent.setup();
    render(<RecommendationExperience items={items} mode="catalog" />);

    await user.click(screen.getByRole('button', { name: '书籍' }));

    expect(screen.getByRole('heading', { name: 'Book title' })).toBeVisible();
    expect(screen.queryByText('Music title')).not.toBeInTheDocument();
    expect(screen.getByTestId('recommendation-stage')).toHaveAttribute(
      'data-active-id',
      'book-item',
    );
  });

  it('wraps next and previous navigation and updates the hash without scrolling', async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    render(<RecommendationExperience items={items} mode="catalog" />);

    await user.click(screen.getByRole('button', { name: '上一项' }));

    expect(screen.getByRole('heading', { name: 'Screen title' })).toBeVisible();
    await waitFor(() => expect(window.location.hash).toBe('#screen-item'));

    await user.click(screen.getByRole('button', { name: '下一项' }));

    expect(screen.getByRole('heading', { name: 'Music title' })).toBeVisible();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('uses a valid location hash as the initial selection', async () => {
    window.history.replaceState(null, '', '/#book-item');

    render(<RecommendationExperience items={items} mode="catalog" />);

    expect(
      await screen.findByRole('heading', { name: 'Book title' }),
    ).toBeVisible();
  });

  it('renders the two-dimensional fallback when WebGL is unavailable', () => {
    mockWebGLStatus('unavailable');

    render(<RecommendationExperience items={items} mode="catalog" />);

    expect(screen.getByText('当前设备使用二维推荐视图。')).toBeVisible();
    expect(screen.queryByTestId('recommendation-stage')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '选择 Book title' }),
    ).toBeVisible();
  });

  it('keeps featured mode narrow', () => {
    render(
      <RecommendationExperience
        items={items}
        mode="featured"
        allHref="/Atoms-H.github.io/recommendations/"
      />,
    );

    expect(
      screen.queryByRole('button', { name: '全部' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '上一项' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看全部推荐' })).toHaveAttribute(
      'href',
      '/Atoms-H.github.io/recommendations/',
    );
    expect(screen.getByTestId('recommendation-stage')).toHaveAttribute(
      'data-compact',
      'true',
    );
  });

  it('shows a stable empty state without mounting the stage or navigation', () => {
    render(<RecommendationExperience items={[]} mode="catalog" />);

    expect(screen.getByText('推荐正在整理中。')).toBeVisible();
    expect(screen.queryByTestId('recommendation-stage')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does not hijack arrow keys from ordinary links', async () => {
    render(<RecommendationExperience items={items} mode="catalog" />);
    const link = screen.getByRole('link', {
      name: '查看 Music title 的外部详情',
    });

    link.focus();
    const wasNotCancelled = fireEvent.keyDown(link, { key: 'ArrowRight' });

    expect(wasNotCancelled).toBe(true);
    expect(screen.getByRole('heading', { name: 'Music title' })).toBeVisible();
  });

  it('passes the reduced-motion preference through to the stage', async () => {
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<RecommendationExperience items={items} mode="catalog" />);

    await waitFor(() =>
      expect(screen.getByTestId('recommendation-stage')).toHaveAttribute(
        'data-reduced-motion',
        'true',
      ),
    );
  });
});

describe('RecommendationCover', () => {
  it('falls back to generated typography when a licensed image fails', () => {
    const licensedItem: RecommendationItem = {
      ...items[0],
      id: 'licensed-item',
      title: 'Licensed title',
      cover: {
        kind: 'licensed',
        src: '/cover.svg',
        sourceUrl: 'https://example.com/source',
        license: 'CC BY 4.0',
        licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        credit: 'Cover artist',
      },
    };

    render(<RecommendationCover item={licensedItem} />);
    const image = screen.getByRole('img', { name: 'Licensed title 封面' });

    fireEvent.error(image);

    expect(
      screen.queryByRole('img', { name: 'Licensed title 封面' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Licensed title')).toBeVisible();
    expect(screen.getByText('Artist')).toBeVisible();
    expect(screen.getByText('2026')).toBeVisible();
  });
});
