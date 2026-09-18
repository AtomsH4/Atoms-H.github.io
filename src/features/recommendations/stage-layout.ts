export type StageOffset = -2 | -1 | 0 | 1 | 2;

export type StageSlot = {
  position: readonly [number, number, number];
  rotation: readonly [number, number, number];
  scale: number;
};

export const desktopSlots = {
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
} as const satisfies Record<`${StageOffset}`, StageSlot>;

export const compactSlots = {
  '-1': {
    position: [-2.45, 0.05, -0.9],
    rotation: [0.04, 0.2, -0.08],
    scale: 0.88,
  },
  '0': {
    position: [0, -0.2, 0],
    rotation: [-0.04, -0.1, 0.03],
    scale: 0.86,
  },
  '1': {
    position: [2.45, 0.05, -0.9],
    rotation: [0.06, -0.22, 0.08],
    scale: 0.88,
  },
} as const satisfies Record<'-1' | '0' | '1', StageSlot>;

export type StageItem = {
  id: string;
  offset: StageOffset;
};

const wrapIndex = (index: number, length: number) =>
  ((index % length) + length) % length;

export const getStageItems = (
  ids: readonly string[],
  activeId: string,
  compact: boolean,
): StageItem[] => {
  if (ids.length === 0) return [];

  const requestedIndex = ids.indexOf(activeId);
  const activeIndex = requestedIndex === -1 ? 0 : requestedIndex;
  const offsets: readonly StageOffset[] = compact
    ? [0, -1, 1]
    : [0, -1, 1, -2, 2];
  const seenIds = new Set<string>();
  const result: StageItem[] = [];

  for (const offset of offsets) {
    const id = ids[wrapIndex(activeIndex + offset, ids.length)];

    if (id === undefined || seenIds.has(id)) continue;

    seenIds.add(id);
    result.push({ id, offset });
  }

  return result.sort((left, right) => left.offset - right.offset);
};
