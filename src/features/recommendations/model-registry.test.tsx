import { describe, expect, it } from 'vitest';

import { recommendationModelRegistry } from './model-registry';
import { presentationValues } from './recommendation-types';

describe('recommendationModelRegistry', () => {
  it('registers every supported presentation exactly once', () => {
    expect(Object.keys(recommendationModelRegistry).sort()).toEqual(
      [...presentationValues].sort(),
    );
  });
});
