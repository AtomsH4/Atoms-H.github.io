import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecommendationFallbackStage } from './RecommendationFallbackStage';
import type { RecommendationItem } from './recommendation-types';

const items: RecommendationItem[] = [
  {
    id: 'music-item',
    title: 'Music title',
    category: 'music',
    presentation: 'disc',
    creator: 'Artist',
    year: 2026,
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
    externalUrl: 'https://example.com/book',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
];

afterEach(cleanup);

describe('RecommendationFallbackStage', () => {
  it('renders one active physical presentation and its neighbor', () => {
    render(
      <RecommendationFallbackStage
        items={items}
        activeId="music-item"
        compact={false}
        reducedMotion={false}
        onSelect={vi.fn()}
      />,
    );

    const active = screen.getByRole('button', { name: '旋转 Music title' });
    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveAttribute('data-presentation', 'disc');
    expect(
      screen.getAllByRole('button').filter(
        (button) => button.getAttribute('aria-current') === 'true',
      ),
    ).toHaveLength(1);
    expect(screen.getByRole('button', { name: '选择 Book title' })).toHaveAttribute(
      'data-presentation',
      'book',
    );
  });

  it('updates rotation while dragging and resets it on release', () => {
    render(
      <RecommendationFallbackStage
        items={items}
        activeId="music-item"
        compact={false}
        reducedMotion={false}
        onSelect={vi.fn()}
      />,
    );

    const active = screen.getByRole('button', { name: '旋转 Music title' });
    expect(active).toHaveStyle({ '--rx': '0deg', '--ry': '0deg' });

    fireEvent.pointerDown(active, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(active, { pointerId: 1, clientX: 180, clientY: 50 });

    expect(active).not.toHaveStyle({ '--rx': '0deg', '--ry': '0deg' });
    expect(active).toHaveAttribute('data-dragging', 'true');

    fireEvent.pointerUp(active, { pointerId: 1 });

    expect(active).toHaveStyle({ '--rx': '0deg', '--ry': '0deg' });
    expect(active).toHaveAttribute('data-dragging', 'false');
  });

  it('lets a neighboring object become active', () => {
    const onSelect = vi.fn();
    render(
      <RecommendationFallbackStage
        items={items}
        activeId="music-item"
        compact
        reducedMotion={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '选择 Book title' }));

    expect(onSelect).toHaveBeenCalledWith('book-item');
  });
});
