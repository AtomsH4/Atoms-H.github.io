export type CanvasDragIntent = 'pending' | 'pan-x' | 'scroll-y';

export type CanvasDragState = {
  intent: CanvasDragIntent;
  startX: number;
  startY: number;
  lastX: number;
  lastTime: number;
  offsetX: number;
  velocityX: number;
};

export type CanvasDragResult = {
  steps: number;
  rebasedOffsetX: number;
};

const DIRECTION_LOCK_PX = 8;
const INERTIA_MS = 160;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const startCanvasDrag = (
  x: number,
  y: number,
  time: number,
): CanvasDragState => ({
  intent: 'pending',
  startX: x,
  startY: y,
  lastX: x,
  lastTime: time,
  offsetX: 0,
  velocityX: 0,
});

export const moveCanvasDrag = (
  state: CanvasDragState,
  x: number,
  y: number,
  time: number,
): CanvasDragState => {
  const offsetX = x - state.startX;
  const offsetY = y - state.startY;
  let intent = state.intent;

  if (
    intent === 'pending' &&
    Math.max(Math.abs(offsetX), Math.abs(offsetY)) >= DIRECTION_LOCK_PX
  ) {
    intent = Math.abs(offsetX) > Math.abs(offsetY) ? 'pan-x' : 'scroll-y';
  }

  const elapsed = Math.max(1, time - state.lastTime);

  return {
    ...state,
    intent,
    lastX: x,
    lastTime: time,
    offsetX: intent === 'pan-x' ? offsetX : state.offsetX,
    velocityX:
      intent === 'pan-x'
        ? (x - state.lastX) / elapsed
        : state.velocityX,
  };
};

export const finishCanvasDrag = (
  state: CanvasDragState,
  options: {
    itemCount: number;
    spacingPx: number;
    reducedMotion: boolean;
  },
): CanvasDragResult => {
  if (
    state.intent !== 'pan-x' ||
    options.itemCount < 2 ||
    options.spacingPx <= 0
  ) {
    return { steps: 0, rebasedOffsetX: 0 };
  }

  const projectedOffset =
    state.offsetX +
    (options.reducedMotion ? 0 : state.velocityX * INERTIA_MS);
  const limit = options.itemCount - 1;
  const steps = clamp(
    Math.round(-projectedOffset / options.spacingPx),
    -limit,
    limit,
  );

  return {
    steps,
    rebasedOffsetX: state.offsetX + steps * options.spacingPx,
  };
};

export const getCanvasReleaseOffset = (
  result: CanvasDragResult,
  unitsPerPixel: number,
  reducedMotion: boolean,
) => (reducedMotion ? 0 : result.rebasedOffsetX * unitsPerPixel);
