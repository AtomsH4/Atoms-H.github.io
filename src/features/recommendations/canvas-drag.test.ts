import { describe, expect, it } from 'vitest';

import {
  finishCanvasDrag,
  getCanvasReleaseOffset,
  moveCanvasDrag,
  startCanvasDrag,
} from './canvas-drag';

describe('canvas drag routing', () => {
  it('keeps small movement pending and yields vertical motion to scrolling', () => {
    const start = startCanvasDrag(100, 100, 0);

    expect(moveCanvasDrag(start, 104, 105, 16).intent).toBe('pending');
    expect(moveCanvasDrag(start, 104, 128, 32).intent).toBe('scroll-y');
  });

  it('locks horizontal movement to canvas panning', () => {
    const moved = moveCanvasDrag(
      startCanvasDrag(120, 100, 0),
      42,
      106,
      120,
    );

    expect(moved.intent).toBe('pan-x');
    expect(moved.offsetX).toBe(-78);
  });

  it('projects inertia and preserves continuity after selection rebasing', () => {
    const moved = moveCanvasDrag(
      startCanvasDrag(100, 100, 0),
      40,
      102,
      100,
    );

    expect(
      finishCanvasDrag(moved, {
        itemCount: 4,
        spacingPx: 100,
        reducedMotion: false,
      }).steps,
    ).toBe(2);
    expect(
      finishCanvasDrag(moved, {
        itemCount: 4,
        spacingPx: 100,
        reducedMotion: true,
      }),
    ).toEqual({ steps: 1, rebasedOffsetX: 40 });
  });

  it('maps the rebased release offset into render units before settling', () => {
    const result = { steps: 1, rebasedOffsetX: -20 };

    expect(getCanvasReleaseOffset(result, 0.01, false)).toBe(-0.2);
    expect(getCanvasReleaseOffset(result, 0.01, true)).toBe(0);
  });

  it('does not navigate before a horizontal gesture is established', () => {
    const pending = moveCanvasDrag(
      startCanvasDrag(100, 100, 0),
      104,
      105,
      16,
    );

    expect(
      finishCanvasDrag(pending, {
        itemCount: 4,
        spacingPx: 100,
        reducedMotion: false,
      }),
    ).toEqual({ steps: 0, rebasedOffsetX: 0 });
  });
});
