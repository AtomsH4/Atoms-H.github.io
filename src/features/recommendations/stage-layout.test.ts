import { describe, expect, it } from 'vitest';

import { compactSlots, desktopSlots, getStageItems } from './stage-layout';

describe('getStageItems', () => {
  it('centers the active item and exposes two neighbors on desktop', () => {
    const result = getStageItems(
      ['a', 'b', 'c', 'd', 'e', 'f'],
      'c',
      false,
    );

    expect(result.map(({ id, offset }) => [id, offset])).toEqual([
      ['a', -2],
      ['b', -1],
      ['c', 0],
      ['d', 1],
      ['e', 2],
    ]);
  });

  it('shows one neighbor on each side on compact screens', () => {
    const result = getStageItems(['a', 'b', 'c', 'd'], 'a', true);

    expect(result.map(({ id, offset }) => [id, offset])).toEqual([
      ['d', -1],
      ['a', 0],
      ['b', 1],
    ]);
  });

  it('does not repeat ids when fewer items exist than slots', () => {
    expect(getStageItems([], 'missing', false)).toEqual([]);
    expect(getStageItems(['a'], 'a', false)).toEqual([
      { id: 'a', offset: 0 },
    ]);
    expect(getStageItems(['a', 'b'], 'b', false)).toEqual([
      { id: 'a', offset: -1 },
      { id: 'b', offset: 0 },
    ]);
  });

  it('falls back to the first id when the active id is unknown', () => {
    expect(getStageItems(['a', 'b', 'c'], 'missing', true)).toEqual([
      { id: 'c', offset: -1 },
      { id: 'a', offset: 0 },
      { id: 'b', offset: 1 },
    ]);
  });
});

describe('desktopSlots', () => {
  it('uses the fixed poster composition', () => {
    expect(desktopSlots).toEqual({
      '-2': {
        position: [-4.1, -0.6, -1.4],
        rotation: [-0.08, 0.35, -0.22],
        scale: 0.62,
      },
      '-1': {
        position: [-1.85, -0.15, -0.7],
        rotation: [0.04, 0.2, -0.1],
        scale: 0.8,
      },
      '0': {
        position: [0.55, -0.1, 0],
        rotation: [-0.04, -0.12, 0.05],
        scale: 1.05,
      },
      '1': {
        position: [3, 0.35, -0.65],
        rotation: [0.08, -0.22, 0.12],
        scale: 0.8,
      },
      '2': {
        position: [5.35, 0.7, -1.35],
        rotation: [-0.05, -0.38, 0.2],
        scale: 0.62,
      },
    });
  });

  it('offsets the desktop focus and keeps compact neighbors at the edges', () => {
    expect(desktopSlots['0'].position).toEqual([0.55, -0.1, 0]);
    expect(compactSlots['0'].position).toEqual([0, -0.2, 0]);
    expect(Math.abs(compactSlots['1'].position[0])).toBeGreaterThan(2);
  });
});
