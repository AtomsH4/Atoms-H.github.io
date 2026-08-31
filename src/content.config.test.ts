// @vitest-environment node

import { describe, expect, it } from 'vitest';

import { collections } from './content.config';

const projectSchema = collections.projects.schema as {
  safeParse: (input: unknown) => { success: boolean };
};

describe('projects content schema', () => {
  it('rejects unknown frontmatter fields', () => {
    const result = projectSchema.safeParse({
      title: 'Project',
      summary: 'A project summary',
      pubDate: '2026-08-31',
      tags: [],
      featured: false,
      repository: 'https://github.com/AtomsH4/example',
      kind: 'own',
      drafft: true,
    });

    expect(result.success).toBe(false);
  });
});
