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

export const createGeneratedCoverDataUrl = (input: {
  title: string;
  creator: string;
  year: number;
}): string => {
  const title = escapeXml(input.title);
  const creator = escapeXml(input.creator);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="#000" />
  <g fill="#fff" font-family="system-ui, -apple-system, BlinkMacSystemFont, &quot;Segoe UI&quot;, sans-serif">
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
  const licensedSource = item.cover.kind === 'licensed' ? item.cover.src : null;

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
    loadTexture(licensedSource ?? generatedSource, licensedSource !== null);

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
    licensedSource,
  ]);

  return texture;
};
