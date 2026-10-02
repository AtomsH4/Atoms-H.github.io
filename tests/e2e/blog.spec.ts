import { expect, test } from '@playwright/test';

const articles = [
  {
    "slug": "leetcode-sql50-solutions",
    "title": "LeetCode - 高频SQL50题（基础版）部分题解",
    "pubDate": "2024-03-11T23:49:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/18067394",
    "date": "2024-03-11 23:49"
  },
  {
    "slug": "luogu-p1107-cats",
    "title": "洛谷 - P1107 [BJWC2008]雷涛的小猫",
    "pubDate": "2022-04-02T15:24:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/16092308.html",
    "date": "2022-04-02 15:24"
  },
  {
    "slug": "acwing-grid-collection",
    "title": "Acwing - 方格取数",
    "pubDate": "2022-02-10T16:28:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/15879729.html",
    "date": "2022-02-10 16:28"
  },
  {
    "slug": "acwing-mondrian",
    "title": "Acwing - 蒙德里安的梦想",
    "pubDate": "2021-08-02T00:32:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/15088209.html",
    "date": "2021-08-02 00:32"
  },
  {
    "slug": "acwing-book-sorting",
    "title": "AcWing - 排书",
    "pubDate": "2021-07-22T23:22:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/15046926.html",
    "date": "2021-07-22 23:22"
  },
  {
    "slug": "acwing-circuit-repair",
    "title": "AcWing - 电路维修",
    "pubDate": "2021-07-07T08:43:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/14979862.html",
    "date": "2021-07-07 08:43"
  },
  {
    "slug": "acwing-maze-path",
    "title": "AcWing - 迷宫问题",
    "pubDate": "2021-07-04T19:57:00+08:00",
    "url": "https://www.cnblogs.com/atomsh/p/14969741.html",
    "date": "2021-07-04 19:57"
  }
];

test('博客精选文章按原始发布时间倒序排列', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/blog/');
  await expect(page.getByRole('heading', { name: '博客', exact: true })).toBeVisible();
  for (const article of articles) {
    const card = page.locator('.entry-card').filter({ has: page.getByRole('link', { name: article.title, exact: true }) });
    await expect(card.locator('time')).toHaveAttribute('datetime', new Date(article.pubDate).toISOString());
  }
  const dates = await page.locator('.entry-card time').evaluateAll((elements) => elements.map((element) => Date.parse(element.getAttribute('datetime')!)));
  expect(dates.every((value) => Number.isFinite(value))).toBe(true);
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
  await expect(page.getByText('博客正在整理中。')).toHaveCount(0);
});

test('凌晨发布的文章仍显示北京时间的原始日期', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/blog/');
  const card = page.locator('.entry-card').filter({ has: page.getByRole('link', { name: 'Acwing - 蒙德里安的梦想', exact: true }) });
  await expect(card.locator('time')).toHaveText('2021年8月2日');
});

for (const article of articles) {
  test('博客全文可读且保留来源与时间：' + article.slug, async ({ page }) => {
    const response = await page.goto('/Atoms-H.github.io/blog/' + article.slug + '/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title);
    await expect(page.locator('article.prose time')).toHaveAttribute('datetime', article.pubDate);
    await expect(page.locator('article.prose time')).toHaveText(article.date + '（北京时间）');
    await expect(page.getByRole('link', { name: '博客园原文', exact: true })).toHaveAttribute('href', article.url);
    expect(await page.locator('article.prose pre code').count()).toBeGreaterThan(0);
  });
}

test('移动端博客图片完整加载且代码不撑破页面', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [slug, imageCount] of [['acwing-book-sorting', 3], ['acwing-maze-path', 1]] as const) {
    await page.goto('/Atoms-H.github.io/blog/' + slug + '/');
    const images = page.locator('article.prose img');
    await expect(images).toHaveCount(imageCount);
    for (const image of await images.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
      await expect(image).toHaveAttribute('alt', /.+/);
      const widths = await image.evaluate((element) => ({ image: element.getBoundingClientRect().width, article: element.closest('article')!.getBoundingClientRect().width }));
      expect(widths.image).toBeLessThanOrEqual(widths.article);
    }
    const code = page.locator('article.prose pre').first();
    await expect(code).toHaveCSS('overflow-x', 'auto');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
});
