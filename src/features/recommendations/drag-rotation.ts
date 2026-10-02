export type DragRotation = {
  dragging: boolean;
  startX: number;
  startY: number;
  rotationX: number;
  rotationY: number;
};

export type DragRotationAction =
  | { type: 'start'; x: number; y: number }
  | { type: 'move'; x: number; y: number }
  | { type: 'end' };

export const createDragRotation = (): DragRotation => ({
  dragging: false,
  startX: 0,
  startY: 0,
  rotationX: 0,
  rotationY: 0,
});

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export const updateDragRotation = (
  state: DragRotation,
  action: DragRotationAction,
): DragRotation => {
  if (action.type === 'start') {
    return {
      ...state,
      dragging: true,
      startX: action.x,
      startY: action.y,
    };
  }

  if (action.type === 'move') {
    if (!state.dragging) return state;

    return {
      ...state,
      rotationX: clamp((action.y - state.startY) * 0.16, -18, 18),
      rotationY: clamp((action.x - state.startX) * 0.18, -28, 28),
    };
  }

  return createDragRotation();
};
