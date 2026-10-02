import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWebGLAvailability } from './useWebGLAvailability';

describe('useWebGLAvailability', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports unavailable when neither WebGL context can be created', async () => {
    const getContext = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockReturnValue(null);

    const { result } = renderHook(() => useWebGLAvailability());

    await waitFor(() => expect(result.current.status).toBe('unavailable'));
    expect(getContext.mock.calls.map(([contextId]) => contextId)).toEqual([
      'webgl2',
      'webgl',
    ]);
  });

  it('can be moved to failed after a runtime context error', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      {} as WebGL2RenderingContext,
    );

    const { result } = renderHook(() => useWebGLAvailability());

    await waitFor(() => expect(result.current.status).toBe('available'));

    act(() => result.current.markFailed());

    expect(result.current.status).toBe('failed');
  });
});
