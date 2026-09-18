import { useReducer, type PointerEventHandler } from 'react';

import { createDragRotation, updateDragRotation } from './drag-rotation';

export const useDragRotation = () => {
  const [rotation, dispatch] = useReducer(
    updateDragRotation,
    undefined,
    createDragRotation,
  );

  const onPointerDown: PointerEventHandler<HTMLButtonElement> = (event) => {
    event.currentTarget.setPointerCapture?.(event.pointerId);
    dispatch({
      type: 'start',
      x: event.clientX,
      y: event.clientY,
    });
  };

  const onPointerMove: PointerEventHandler<HTMLButtonElement> = (event) => {
    dispatch({
      type: 'move',
      x: event.clientX,
      y: event.clientY,
    });
  };

  const endDrag: PointerEventHandler<HTMLButtonElement> = () => {
    dispatch({ type: 'end' });
  };

  return {
    rotation,
    pointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onLostPointerCapture: endDrag,
    },
  };
};
