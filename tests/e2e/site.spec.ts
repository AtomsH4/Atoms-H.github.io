import { expect, test } from '@playwright/test';

test('博客和随笔均有可读的空状态而非 404', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/blog/');
  await expect(page.getByRole('heading', { name: '博客', exact: true })).toBeVisible();
  await expect(page.getByText('博客正在整理中。', { exact: true })).toBeVisible();

  await page.goto('/Atoms-H.github.io/notes/');
  await expect(page.getByRole('heading', { name: '随笔', exact: true })).toBeVisible();
  await expect(page.getByText('随笔正在整理中。', { exact: true })).toBeVisible();
});

test('首页以博客与精选项目为主要入口', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/');

  await expect(page.getByRole('link', { name: '博客', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '随笔', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '项目', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /技能/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '精选项目', exact: true })).toBeVisible();
});

test('项目卡通过安全的新标签页仓库链接打开项目', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/projects/');

  const card = page.locator('.entry-card').filter({ hasText: 'AtomsH4 Profile' });
  const repositoryLink = card.locator('a.entry-repository');

  await expect(repositoryLink).toHaveAttribute(
    'href',
    'https://github.com/AtomsH4/AtomsH4',
  );
  await expect(repositoryLink).toHaveAttribute('target', '_blank');
  await expect(repositoryLink).toHaveAttribute('rel', /\bnoreferrer\b/);
  await expect(card.locator('a[href^="/Atoms-H.github.io/projects/"]')).toHaveCount(0);
});

test('未知路径显示自定义 404 页面并提供返回首页入口', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/does-not-exist/');

  await expect(page.getByRole('heading', { name: '页面未找到', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: '返回首页', exact: true })).toHaveAttribute(
    'href',
    '/Atoms-H.github.io/',
  );
});

test('移动端导航可打开并显示导航链接', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/Atoms-H.github.io/');

  const navigation = page.getByRole('navigation', { name: '主导航', exact: true });
  const toggle = navigation.getByRole('button', { name: '打开导航', exact: true });

  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(navigation.locator('#site-navigation')).toHaveAttribute('data-open', 'true');
  await expect(
    navigation.getByRole('link', { name: '博客', exact: true }),
  ).toBeVisible();
});
