import { act, renderHook } from '@testing-library/react';
import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createGeneratedCoverDataUrl,
  useRecommendationTexture,
} from './create-cover-texture';
import type { RecommendationItem } from './recommendation-types';

const decodeSvgDataUrl = (dataUrl: string) =>
  decodeURIComponent(dataUrl.slice(dataUrl.indexOf(',') + 1));

describe('createGeneratedCoverDataUrl', () => {
  it('creates a self-contained 1024px SVG data URL with system typography', () => {
    const result = createGeneratedCoverDataUrl({
      title: 'A title',
      creator: 'A creator',
      year: 2026,
    });
    const decoded = decodeSvgDataUrl(result);

    expect(result).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    expect(decoded).toContain('width="1024"');
    expect(decoded).toContain('height="1024"');
    expect(decoded).toContain('viewBox="0 0 1024 1024"');
    expect(decoded).toContain('fill="#000"');
    expect(decoded).toContain('fill="#fff"');
    expect(decoded).toContain('font-family="system-ui');
    expect(decoded).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(decoded).not.toMatch(/<(?:image|use)\b|\bhref=|url\(/);
  });

  it('XML-escapes title and creator text so they cannot inject SVG', () => {
    const result = createGeneratedCoverDataUrl({
      title: `A & B < C > D "quoted" 'single'`,
      creator: `</text><script>alert("x")</script> & 'creator'`,
      year: 2026,
    });
    const decoded = decodeSvgDataUrl(result);

    expect(decoded).toContain(
      'A &amp; B &lt; C &gt; D &quot;quoted&quot; &apos;single&apos;',
    );
    expect(decoded).toContain(
      '&lt;/text&gt;&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; &apos;creator&apos;',
    );
    expect(decoded).not.toContain('<script>');
  });
});

type PendingTextureLoad = {
  url: string;
  texture: THREE.Texture<HTMLImageElement>;
  onLoad?: (texture: THREE.Texture<HTMLImageElement>) => void;
  onError?: (error: unknown) => void;
};

const createItem = (
  id: string,
  cover: RecommendationItem['cover'],
): RecommendationItem => ({
  id,
  title: `Title ${id}`,
  category: 'book',
  presentation: 'book',
  creator: `Creator ${id}`,
  year: 2026,
  summary: 'Summary',
  externalUrl: 'https://example.com/work',
  cover,
});

describe('useRecommendationTexture', () => {
  const pendingLoads: PendingTextureLoad[] = [];

  beforeEach(() => {
    pendingLoads.length = 0;
    vi.spyOn(THREE.TextureLoader.prototype, 'load').mockImplementation(
      (url, onLoad, _onProgress, onError) => {
        const texture = new THREE.Texture<HTMLImageElement>();
        pendingLoads.push({ url, texture, onLoad, onError });
        return texture;
      },
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads a generated cover in sRGB and disposes it on cleanup', () => {
    const item = createItem('generated', {
      kind: 'generated',
      credit: 'Original',
    });
    const { result, unmount } = renderHook(() =>
      useRecommendationTexture(item),
    );
    const request = pendingLoads[0];
    const dispose = vi.spyOn(request.texture, 'dispose');

    expect(request.url).toMatch(/^data:image\/svg\+xml/);

    act(() => request.onLoad?.(request.texture));

    expect(result.current).toBe(request.texture);
    expect(request.texture.colorSpace).toBe(THREE.SRGBColorSpace);

    unmount();
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('falls back from a failed licensed cover without surfacing the error', () => {
    const item = createItem('licensed', {
      kind: 'licensed',
      src: '/media/recommendations/cover.svg',
      sourceUrl: 'https://example.com/source',
      license: 'CC BY 4.0',
      licenseUrl: 'https://example.com/license',
      credit: 'Creator',
    });
    const { result, unmount } = renderHook(() =>
      useRecommendationTexture(item),
    );
    const licensedRequest = pendingLoads[0];
    const licensedDispose = vi.spyOn(licensedRequest.texture, 'dispose');

    expect(licensedRequest.url).toBe('/media/recommendations/cover.svg');

    act(() => licensedRequest.onError?.(new Error('load failed')));

    expect(licensedDispose).toHaveBeenCalledOnce();
    expect(pendingLoads).toHaveLength(2);
    expect(pendingLoads[1].url).toMatch(/^data:image\/svg\+xml/);

    act(() => pendingLoads[1].onLoad?.(pendingLoads[1].texture));

    expect(result.current).toBe(pendingLoads[1].texture);
    expect(result.current?.colorSpace).toBe(THREE.SRGBColorSpace);
    unmount();
  });

  it('ignores stale callbacks after the item changes', () => {
    const firstItem = createItem('first', {
      kind: 'generated',
      credit: 'Original',
    });
    const secondItem = createItem('second', {
      kind: 'generated',
      credit: 'Original',
    });
    const { result, rerender } = renderHook(
      ({ item }: { item: RecommendationItem }) =>
        useRecommendationTexture(item),
      { initialProps: { item: firstItem } },
    );
    const staleRequest = pendingLoads[0];
    const staleDispose = vi.spyOn(staleRequest.texture, 'dispose');

    rerender({ item: secondItem });
    expect(staleDispose).toHaveBeenCalledOnce();

    act(() => staleRequest.onLoad?.(staleRequest.texture));

    expect(result.current).toBeNull();

    const currentRequest = pendingLoads[1];
    act(() => currentRequest.onLoad?.(currentRequest.texture));
    expect(result.current).toBe(currentRequest.texture);
  });
});
