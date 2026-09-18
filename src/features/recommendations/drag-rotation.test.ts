import { describe, expect, it } from 'vitest';

import { createDragRotation, updateDragRotation } from './drag-rotation';

describe('drag rotation', () => {
  it('maps pointer movement into bounded rotation', () => {
    const started = updateDragRotation(createDragRotation(), {
      type: 'start',
      x: 100,
      y: 100,
    });
    const moved = updateDragRotation(started, {
      type: 'move',
      x: 500,
      y: -200,
    });

    expect(moved.rotationX).toBe(-18);
    expect(moved.rotationY).toBe(28);
  });

  it('ignores movement until dragging begins', () => {
    expect(
      updateDragRotation(createDragRotation(), {
        type: 'move',
        x: 20,
        y: 40,
      }),
    ).toEqual(createDragRotation());
  });

  it('returns to zero when released', () => {
    const state = {
      ...createDragRotation(),
      dragging: true,
      rotationX: 10,
      rotationY: 15,
    };

    expect(updateDragRotation(state, { type: 'end' })).toMatchObject({
      dragging: false,
      rotationX: 0,
      rotationY: 0,
    });
  });
});
