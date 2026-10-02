// @vitest-environment node

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Original publication times and code fingerprints verified against AtomsH's Cnblogs posts.
const imports = [
  {
    "slug": "leetcode-sql50-solutions",
    "title": "LeetCode - 高频SQL50题（基础版）部分题解",
    "url": "https://www.cnblogs.com/atomsh/p/18067394",
    "pubDate": "2024-03-11T23:49:00+08:00",
    "hash": "8577433963c2121b6e5770a8856c0b31dce543f925b501f4a6cfa108ba3ca9e4",
    "originalDate": "2024-03-11 23:49"
  },
  {
    "slug": "luogu-p1107-cats",
    "title": "洛谷 - P1107 [BJWC2008]雷涛的小猫",
    "url": "https://www.cnblogs.com/atomsh/p/16092308.html",
    "pubDate": "2022-04-02T15:24:00+08:00",
    "hash": "782c63a33195e3d022b35e718db596712a05360d497a872a1fbabf2ffc773550",
    "originalDate": "2022-04-02 15:24"
  },
  {
    "slug": "acwing-grid-collection",
    "title": "Acwing - 方格取数",
    "url": "https://www.cnblogs.com/atomsh/p/15879729.html",
    "pubDate": "2022-02-10T16:28:00+08:00",
    "hash": "18f4da99486d79ba9dc04d92ee2a1ed7fbfeb060cd2edc7989a20e689074b5d2",
    "originalDate": "2022-02-10 16:28"
  },
  {
    "slug": "acwing-mondrian",
    "title": "Acwing - 蒙德里安的梦想",
    "url": "https://www.cnblogs.com/atomsh/p/15088209.html",
    "pubDate": "2021-08-02T00:32:00+08:00",
    "hash": "16afb5cee66992fd9c4d99a7fb678b9ecb0756b8700708b9af3ee42e55a7ec9d",
    "originalDate": "2021-08-02 00:32"
  },
  {
    "slug": "acwing-book-sorting",
    "title": "AcWing - 排书",
    "url": "https://www.cnblogs.com/atomsh/p/15046926.html",
    "pubDate": "2021-07-22T23:22:00+08:00",
    "hash": "ca7e07ec7b06fb05d552b903f7b5e386bade725f7c62da200a88432c7928d4da",
    "originalDate": "2021-07-22 23:22"
  },
  {
    "slug": "acwing-circuit-repair",
    "title": "AcWing - 电路维修",
    "url": "https://www.cnblogs.com/atomsh/p/14979862.html",
    "pubDate": "2021-07-07T08:43:00+08:00",
    "hash": "7dc9ee2b9543532842c8575431b27d21e507895042bd47ea83b1af9cd36da7ff",
    "originalDate": "2021-07-07 08:43"
  },
  {
    "slug": "acwing-maze-path",
    "title": "AcWing - 迷宫问题",
    "url": "https://www.cnblogs.com/atomsh/p/14969741.html",
    "pubDate": "2021-07-04T19:57:00+08:00",
    "hash": "17db8eb83c9f65dc75602414baa50f9eb7796dfc2233a80f2d0d1df6e3f9a45f",
    "originalDate": "2021-07-04 19:57"
  }
];
const normalizeCode = (code: string) =>
  code.split('\n').map((line) => line.trimEnd()).join('\n').trim();

describe('curated Cnblogs imports', () => {
  it.each(imports)('preserves the source, publication time and code of $slug', (entry) => {
    const path = join(process.cwd(), 'src/data/blog', entry.slug + '.md');
    expect(existsSync(path), 'The selected article must be present').toBe(true);
    const source = readFileSync(path, 'utf8');
    expect(source).toContain('title: ' + JSON.stringify(entry.title));
    expect(source).toContain('pubDate: ' + JSON.stringify(entry.pubDate));
    expect(source).toContain('datetime="' + entry.pubDate + '"');
    expect(source).toContain(entry.originalDate + '（北京时间）');
    expect(source).toContain('[博客园原文](' + entry.url + ')');
    const code = [...source.matchAll(/^```(?:cpp|sql)\n([\s\S]*?)\n```/gm)]
      .map((match) => normalizeCode(match[1]));
    expect(code.length).toBeGreaterThan(0);
    expect(createHash('sha256').update(code.join('\n\n')).digest('hex'))
      .toBe(entry.hash);
    expect(source).not.toMatch(/^#{1,6}\s*$/m);
    expect(source).not.toContain('img2020.cnblogs.com');
    for (const match of source.matchAll(/!\[[^\]]+\]\((\.\/images\/[^)]+)\)/g)) {
      expect(existsSync(join(process.cwd(), 'src/data/blog', match[1]))).toBe(true);
    }
  });
});
