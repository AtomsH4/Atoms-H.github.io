import { useCallback, useEffect, useState } from 'react';

export type WebGLStatus =
  | 'checking'
  | 'available'
  | 'unavailable'
  | 'failed';

export const useWebGLAvailability = (): {
  status: WebGLStatus;
  markFailed: () => void;
} => {
  const [status, setStatus] = useState<WebGLStatus>('checking');

  useEffect(() => {
    let active = true;

    try {
      const canvas = document.createElement('canvas');
      const context =
        canvas.getContext('webgl2') ?? canvas.getContext('webgl');

      if (active) {
        setStatus(context ? 'available' : 'unavailable');
      }
    } catch {
      if (active) {
        setStatus('unavailable');
      }
    }

    return () => {
      active = false;
    };
  }, []);

  const markFailed = useCallback(() => {
    setStatus('failed');
  }, []);

  return { status, markFailed };
};
