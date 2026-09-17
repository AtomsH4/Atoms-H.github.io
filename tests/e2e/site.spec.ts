import { expect, test } from '@playwright/test';
import sharp from 'sharp';

test.use({
  launchOptions: {
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  },
});

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

test('推荐页提供分类、首批内容和安全外链', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/recommendations/');

  await expect(
    page.getByRole('heading', { name: '推荐', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: '音乐' })).toBeVisible();
  await expect(page.getByRole('button', { name: '书籍' })).toBeVisible();
  await expect(page.getByRole('button', { name: '影视与动画' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '我表示理解', level: 2 }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /外部详情/ }),
  ).toHaveAttribute('target', '_blank');
  await expect(
    page.getByRole('link', { name: /外部详情/ }),
  ).toHaveAttribute('rel', /noreferrer/);

  const nextButton = page.getByRole('button', { name: '下一项' });
  await nextButton.click();
  await nextButton.click();
  await nextButton.click();
  await expect(
    page.getByRole('heading', { name: 'Back in Black', level: 2 }),
  ).toBeVisible();
  const sourceLink = page.locator(
    'a[href="https://commons.wikimedia.org/wiki/File:ACDC_Back_in_Black_cover.svg"]',
  );
  const licenseLink = page.locator(
    'a[href="https://commons.wikimedia.org/wiki/Template:PD-textlogo"]',
  );
  await expect(sourceLink).toContainText('Angus Young');
  await expect(sourceLink).toContainText('在新标签页打开');
  await expect(sourceLink).toHaveAttribute('target', '_blank');
  await expect(sourceLink).toHaveAttribute('rel', /\bnoopener\b.*\bnoreferrer\b/);
  await expect(licenseLink).toContainText('Public domain');
  await expect(licenseLink).toContainText('在新标签页打开');
  await expect(licenseLink).toHaveAttribute('target', '_blank');
  await expect(licenseLink).toHaveAttribute('rel', /\bnoopener\b.*\bnoreferrer\b/);
});

test('首页精选深链到对应推荐', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/');

  await expect(
    page.getByRole('link', { name: /查看全部推荐/ }),
  ).toHaveAttribute('href', '/Atoms-H.github.io/recommendations/');

  await page.goto('/Atoms-H.github.io/recommendations/#flipped');
  await expect(
    page.getByRole('heading', { name: '怦然心动' }),
  ).toBeVisible();
});

test('推荐页支持根节点键盘循环和分类首项切换', async ({ page }) => {
  await page.goto(
    '/Atoms-H.github.io/recommendations/#wo-biao-shi-li-jie',
  );

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('推荐');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);

  const experience = page.locator('[data-recommendation-experience]');
  const status = page.getByRole('status');
  await expect(
    page.getByRole('heading', { name: '我表示理解', level: 2 }),
  ).toBeVisible();
  await expect(status).toBeEmpty();
  await experience.focus();
  await experience.press('ArrowLeft');

  await expect(
    page.getByRole('heading', { name: '怦然心动', level: 2 }),
  ).toBeVisible();
  await expect(status).toHaveText('当前推荐：怦然心动');

  await page.getByRole('button', { name: '书籍' }).click();
  await expect(
    page.getByRole('heading', { name: '月亮与六便士', level: 2 }),
  ).toBeVisible();
  await expect(status).toHaveText('当前推荐：月亮与六便士');
});

test('推荐页在 WebGL 不可用时保留二维视图和详情链接', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value: () => null,
    });
  });

  await page.goto('/Atoms-H.github.io/recommendations/');

  await expect(
    page.getByText('当前设备使用二维推荐视图。', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: '选择 我表示理解' }),
  ).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);

  const detailLink = page.getByRole('link', { name: /我表示理解.*外部详情/ });
  await expect(detailLink).toBeVisible();
  await expect(detailLink).toHaveAttribute('target', '_blank');
  await expect(detailLink).toHaveAttribute('rel', /\bnoopener\b.*\bnoreferrer\b/);
});

test('推荐页在暗色系统偏好下仍保持浅色海报', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/Atoms-H.github.io/recommendations/');

  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(247, 246, 241)',
  );
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(9, 9, 9)');
});

test('推荐页在移动端遵循减少动态效果并保持纵向滚动', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/Atoms-H.github.io/recommendations/');

  const experience = page.locator('[data-recommendation-experience]');
  await expect(experience).toHaveAttribute('data-reduced-motion', 'true');
  await expect(
    page.getByText('原创排版：AtomsH4', { exact: true }),
  ).toBeVisible();

  const horizontalOverflow = await page.evaluate(() =>
    Math.max(
      document.body.scrollWidth - document.body.clientWidth,
      document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    ),
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(0);

  await page.mouse.wheel(0, 600);
  await expect
    .poll(() => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(0);
  await expect(
    page.getByText('原创排版：AtomsH4', { exact: true }),
  ).toBeVisible();
});

test('推荐页 Canvas 支持真实拖动并保持当前作品', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/recommendations/');
  await page.getByRole('button', { name: '音乐', exact: true }).click();

  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
  await expect(canvas).toHaveAttribute(
    'data-recommendation-stage-ready',
    'true',
  );
  await expect(canvas).toHaveCSS('touch-action', 'pan-y');
  const heading = page.getByRole('heading', { level: 2 });
  const activeTitle = await heading.textContent();
  const box = await canvas.boundingBox();

  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.height).toBeGreaterThanOrEqual(420);
  await page.waitForTimeout(250);
  const { data: pixels, info } = await sharp(await canvas.screenshot())
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let darkPixels = 0;
  for (let index = 0; index < pixels.length; index += info.channels) {
    if (
      pixels[index] < 64 &&
      pixels[index + 1] < 64 &&
      pixels[index + 2] < 64
    ) {
      darkPixels += 1;
    }
  }
  expect(darkPixels / (pixels.length / info.channels)).toBeGreaterThan(0.08);

  const centerX = box.x + box.width / 2;
  const centerY = box.y + box.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 80, centerY + 30, { steps: 5 });
  await page.mouse.up();

  await expect(canvas).toBeVisible();
  await expect(heading).toHaveText(activeTitle ?? '');

  const contextLossHandled = await canvas.evaluate((element) => {
    const event = new Event('webglcontextlost', { cancelable: true });
    element.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(contextLossHandled).toBe(true);
  await expect(
    page.getByText('3D 初始化失败，当前使用二维推荐视图。', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(canvas).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: `选择 ${activeTitle}` }),
  ).toBeVisible();
});
