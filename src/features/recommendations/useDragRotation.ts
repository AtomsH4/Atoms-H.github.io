import { useReducer, useRef, type PointerEventHandler } from 'react';

import { createDragRotation, updateDragRotation } from './drag-rotation';

export const useDragRotation = () => {
  const [rotation, dispatch] = useReducer(
    updateDragRotation,
    undefined,
    createDragRotation,
  );
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const onPointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startPosition.current = { x: event.clientX, y: event.clientY };
    didDrag.current = false;
    dispatch({
      type: 'start',
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onPointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    const start = startPosition.current;

    if (
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 4
    ) {
      didDrag.current = true;
    }

    dispatch({
      type: 'move',
      x: event.clientX,
      y: event.clientY,
    });
  };

  const endDrag: PointerEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    startPosition.current = null;
    dispatch({ type: 'end' });
  };

  const consumeDraggedClick = () => {
    const consumed = didDrag.current;
    didDrag.current = false;
    return consumed;
  };

  return {
    rotation,
    consumeDraggedClick,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: endDrag,
    },
  };
};
