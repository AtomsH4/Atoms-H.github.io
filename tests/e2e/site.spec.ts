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
