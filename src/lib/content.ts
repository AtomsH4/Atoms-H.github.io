export type DatedEntry = {
  id: string;
  data: { draft: boolean; pubDate: Date };
};

export const getPublishedEntries = <T extends DatedEntry>(entries: T[]): T[] =>
  entries
    .filter((entry) => !entry.data.draft)
    .sort(
      (left, right) =>
        right.data.pubDate.getTime() - left.data.pubDate.getTime(),
    );
