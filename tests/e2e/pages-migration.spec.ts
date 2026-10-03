import { expect, test } from '@playwright/test';

test('博客在域名根路径下访问，导航不再带仓库前缀', async ({ page }) => {
  const response = await page.goto('/blog/');

  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('博客');
  await expect(page.locator('a[href^="/Atoms-H.github.io"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'GitHub Pages（在新标签页打开）' }))
    .toHaveAttribute('href', 'https://atomsh4.github.io/');
});

for (const pathname of ['/', '/blog/', '/notes/', '/projects/', '/recommendations/', '/about/']) {
  test(`旧站点入口跳转到根路径：${pathname}`, async ({ page, baseURL }) => {
    await page.goto(`/Atoms-H.github.io${pathname}`, { waitUntil: 'domcontentloaded' });

    await expect.poll(() => page.url().split('#')[0]).toBe(new URL(pathname, baseURL).href);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
}

for (const [oldPath, newPath] of [
  ['/blog/cherry-studio-lifecycle-skill/', '/blog/cherry-studio-lifecycle-skill/'],
  ['/blog/cherry-studio-lifecycle-skill', '/blog/cherry-studio-lifecycle-skill/'],
  ['/notes/acwing-maze-path/', '/notes/acwing-maze-path/'],
  ['/blog/acwing-maze-path/', '/notes/acwing-maze-path/'],
]) {
  test(`旧正文链接跳转到迁移后的文章：${oldPath}`, async ({ page, baseURL }) => {
    await page.goto(`/Atoms-H.github.io${oldPath}`);

    await expect(page).toHaveURL(new URL(newPath, baseURL).href);
    await expect(page.locator('article.prose')).toBeVisible();
  });
}

test('旧推荐深链保留查询参数和作品定位', async ({ page, baseURL }) => {
  await page.goto('/Atoms-H.github.io/recommendations/?from=bookmark#flipped', { waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(new URL('/recommendations/?from=bookmark#flipped', baseURL).href);
  await expect(page.getByRole('heading', { name: '怦然心动', exact: true })).toBeVisible();
});

test('旧文章链接保留章节锚点', async ({ page, baseURL }) => {
  await page.goto('/Atoms-H.github.io/blog/cherry-studio-lifecycle-skill/#lifecycle');

  await expect(page).toHaveURL(new URL('/blog/cherry-studio-lifecycle-skill/#lifecycle', baseURL).href);
});

test('禁用 JavaScript 时旧博客入口仍能跳转', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/Atoms-H.github.io/blog/');
    await expect(page).toHaveURL(new URL('/blog/', baseURL).href);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('博客');
  } finally {
    await context.close();
  }
});
