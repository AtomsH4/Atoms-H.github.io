import { describe, expect, it } from 'vitest';

import { getPublishedEntries } from './content';

describe('getPublishedEntries', () => {
  it('filters drafts and sorts published entries by descending publication date', () => {
    const entries = [
      {
        id: 'older',
        data: { draft: false, pubDate: new Date('2026-01-02') },
      },
      {
        id: 'draft',
        data: { draft: true, pubDate: new Date('2026-08-30') },
      },
      {
        id: 'newer',
        data: { draft: false, pubDate: new Date('2026-08-01') },
      },
    ];

    expect(getPublishedEntries(entries).map((entry) => entry.id)).toEqual([
      'newer',
      'older',
    ]);
  });
});
