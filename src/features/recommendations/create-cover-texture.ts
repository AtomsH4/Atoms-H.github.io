import { useEffect, useState } from 'react';
import * as THREE from 'three';

import type { RecommendationItem } from './recommendation-types';

const xmlEntities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (character) => xmlEntities[character]);

const palettes = [
  { background: '#192a56', accent: '#fbc531', foreground: '#f5f6fa' },
  { background: '#6d214f', accent: '#ffda79', foreground: '#fff7e6' },
  { background: '#0b5345', accent: '#f4d03f', foreground: '#fdfefe' },
  { background: '#7b241c', accent: '#85c1e9', foreground: '#ffffff' },
  { background: '#17202a', accent: '#e67e22', foreground: '#f8f9f9' },
  { background: '#4a235a', accent: '#76d7c4', foreground: '#ffffff' },
] as const;

export const getGeneratedCoverPalette = (id: string) => {
  const hash = [...id].reduce(
    (value, character) =>
      ((value * 31) + character.charCodeAt(0)) >>> 0,
    0,
  );
  return palettes[hash % palettes.length];
};

export const createGeneratedCoverDataUrl = (input: {
  id: string;
  title: string;
  creator: string;
  year: number;
}): string => {
  const title = escapeXml(input.title);
  const creator = escapeXml(input.creator);
  const palette = getGeneratedCoverPalette(input.id);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${palette.background}" />
  <circle cx="846" cy="182" r="248" fill="${palette.accent}" opacity="0.92" />
  <path d="M0 730 L1024 470 L1024 1024 L0 1024 Z" fill="${palette.accent}" opacity="0.28" />
  <g fill="${palette.foreground}" font-family="system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif">
    <text x="96" y="136" font-size="30" font-weight="600" letter-spacing="8">RECOMMENDED</text>
    <text x="96" y="500" font-size="86" font-weight="750">${title}</text>
    <text x="96" y="790" font-size="42" font-weight="500">${creator}</text>
    <text x="96" y="884" font-size="34" font-weight="600" letter-spacing="5">${input.year}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const useRecommendationTexture = (
  item: RecommendationItem,
): THREE.Texture | null => {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const imageSource = item.cover.kind === 'generated' ? null : item.cover.src;

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const ownedTextures = new Set<THREE.Texture>();
    const generatedSource = createGeneratedCoverDataUrl(item);
    let cancelled = false;
    let visibleTexture: THREE.Texture | null = null;

    const disposeOwnedTexture = (ownedTexture: THREE.Texture) => {
      if (ownedTextures.delete(ownedTexture)) ownedTexture.dispose();
    };

    const loadTexture = (source: string, fallbackToGenerated: boolean) => {
      let requestedTexture: THREE.Texture | null = null;

      const handleError = () => {
        if (cancelled) return;

        if (requestedTexture) disposeOwnedTexture(requestedTexture);

        if (fallbackToGenerated) {
          loadTexture(generatedSource, false);
        } else {
          setTexture(null);
        }
      };

      try {
        requestedTexture = loader.load(
          source,
          (loadedTexture) => {
            if (cancelled) {
              disposeOwnedTexture(loadedTexture);
              return;
            }

            loadedTexture.colorSpace = THREE.SRGBColorSpace;
            if (visibleTexture && visibleTexture !== loadedTexture) {
              disposeOwnedTexture(visibleTexture);
            }
            visibleTexture = loadedTexture;
            setTexture(loadedTexture);
          },
          undefined,
          handleError,
        );
        ownedTextures.add(requestedTexture);
      } catch {
        handleError();
      }
    };

    setTexture(null);
    loadTexture(imageSource ?? generatedSource, imageSource !== null);

    return () => {
      cancelled = true;
      ownedTextures.forEach((ownedTexture) => ownedTexture.dispose());
      ownedTextures.clear();
    };
  }, [
    item.cover.kind,
    item.creator,
    item.id,
    item.title,
    item.year,
    imageSource,
  ]);

  return texture;
};
