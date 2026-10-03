import { expect, test } from '@playwright/test';

const articles = [
  {
    slug: 'cherry-studio-print-window-ownership',
    title: 'Cherry Studio 笔记打印中的窗口归属与跨进程分工',
    pullRequest: 'https://github.com/CherryHQ/cherry-studio/pull/16681',
    mergedAt: '2026-07-07T08:29:56.000Z',
    date: '2026年7月7日',
    topic: '先确定打印的是哪一份内容',
    diagram: 'cherry-studio-print/flow.svg',
    diagramName: '查看打印流程原图',
  },
  {
    slug: 'cherry-studio-doctor-state-boundaries',
    title: 'Cherry Studio System Doctor 的前后端状态边界',
    pullRequest: 'https://github.com/CherryHQ/cherry-studio/pull/20006',
    mergedAt: '2026-09-18T08:58:43.000Z',
    date: '2026年9月18日',
    topic: '后端结果与前端会话不是同一种状态',
    diagram: 'cherry-studio-doctor/state-ownership.svg',
    diagramName: '查看 Doctor 状态归属原图',
  },
];
const lifecycleTitle = '用 Skill 梳理 Cherry Studio 的生命周期设计';
const lifecyclePath = '/blog/cherry-studio-lifecycle-skill/';

test('架构复盘按 PR 合并时间归档并保持时间倒序', async ({ page }) => {
  await page.goto('/blog/');

  for (const article of articles) {
    const card = page.locator('.entry-card').filter({
      has: page.getByRole('link', { name: article.title, exact: true }),
    });
    await expect(card).toHaveCount(1);
    await expect(card.locator('time')).toHaveAttribute(
      'datetime',
      article.mergedAt,
    );
    await expect(card.locator('time')).toHaveText(article.date);
  }

  await expect(page.getByRole('link', { name: lifecycleTitle, exact: true }))
    .toHaveAttribute('href', lifecyclePath);
  const lifecycleCard = page.locator('.entry-card').filter({
    has: page.getByRole('link', { name: lifecycleTitle, exact: true }),
  });
  await expect(lifecycleCard.locator('time')).toHaveAttribute('datetime', '2026-10-02T00:00:00.000Z');
  const dates = await page.locator('.entry-card time').evaluateAll((elements) =>
    elements.map((element) => Date.parse(element.getAttribute('datetime')!)),
  );
  expect(dates).toEqual([...dates].sort((a, b) => b - a));
});

for (const article of articles) {
  test(`架构复盘可读并关联来源和生命周期长文：${article.slug}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const response = await page.goto(`/blog/${article.slug}/`);

    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(article.title);
    const body = page.locator('article.prose');
    await expect(body.getByRole('heading', { name: article.topic, exact: true }))
      .toBeVisible();
    await expect(body.locator(`a[href="${article.pullRequest}"]`).first())
      .toBeVisible();
    const lifecycleLink = body.getByRole('link', { name: lifecycleTitle, exact: true });
    await expect(lifecycleLink).toHaveAttribute('href', lifecyclePath);
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )).toBeLessThanOrEqual(0);

    await lifecycleLink.click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(lifecycleTitle);
  });
}

for (const article of articles) {
  test(`架构配图完整加载且可打开原图：${article.slug}`, async ({ page }) => {
    const imagePath = `/media/blog/${article.diagram}`;
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/blog/${article.slug}/`);
      const figure = page.locator('article.prose figure');
      const image = figure.locator('img');
      await expect(figure).toHaveCount(1);
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute('src', imagePath);
      await expect(image).toHaveAttribute('alt', /.+/);
      await expect.poll(() => image.evaluate((element: HTMLImageElement) =>
        element.complete && element.naturalWidth > 0,
      )).toBe(true);
      await expect(figure.locator('figcaption')).toContainText('图 1');
      const link = figure.getByRole('link', { name: article.diagramName, exact: true });
      await expect(link).toHaveAttribute('href', imagePath);
      expect(await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      )).toBeLessThanOrEqual(0);
    }

    await page.getByRole('link', { name: article.diagramName, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(imagePath.replaceAll('.', '\\.') + '$'));
    const response = await page.request.get(imagePath);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/svg+xml');
  });
}

test('随笔不重复收录博客中的架构文章', async ({ page }) => {
  await page.goto('/notes/');
  await expect(page.getByRole('heading', { name: '随笔', exact: true })).toBeVisible();
  for (const title of [...articles.map((article) => article.title), lifecycleTitle]) {
    await expect(page.getByRole('link', { name: title, exact: true })).toHaveCount(0);
  }
});
