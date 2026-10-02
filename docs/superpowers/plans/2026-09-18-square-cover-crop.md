# 推荐作品正方形封面裁剪实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 替换《月亮与六便士》的封面来源，并让 WebGL 与 CSS 回退中的所有图片都居中裁成正方形且不拉伸。

**架构：** 内容层只描述图片来源与署名；纹理层通过纯函数计算正方形 UV 裁剪；展示层让书籍实体保持竖向外形，但将正方形封面图居中放置。CSS 回退复用相同的“正方形图片置于竖向书封”视觉契约。

**技术栈：** Astro、React、TypeScript、Three.js、CSS Modules、Vitest、Playwright

---

## 文件结构

- 修改 `src/features/recommendations/recommendation-types.ts`：登记 `standard-ebooks` 远程图片提供方。
- 修改 `src/data/recommendations/the-moon-and-sixpence.md`：替换图片 URL、来源链接与署名。
- 修改 `src/content.config.test.ts`：锁定新来源契约。
- 修改 `src/features/recommendations/create-cover-texture.ts`：计算并应用居中正方形 UV 裁剪。
- 修改 `src/features/recommendations/create-cover-texture.test.ts`：测试横图、竖图、正方形与无效尺寸。
- 修改 `src/features/recommendations/models/BookModel.tsx`：把书籍封面图片平面改为正方形并居中。
- 修改 `src/features/recommendations/RecommendationExperience.module.css`：让 CSS 书籍封面采用正方形图片和底色留白。
- 修改 `tests/e2e/site.spec.ts`：验证书籍模式使用新图片来源且没有拉伸。

### 任务 1：替换《月亮与六便士》图片来源

**文件：**
- 修改：`src/features/recommendations/recommendation-types.ts`
- 修改：`src/data/recommendations/the-moon-and-sixpence.md`
- 测试：`src/content.config.test.ts`

- [ ] **步骤 1：编写失败的内容契约测试**

在 `src/content.config.test.ts` 中读取 `the-moon-and-sixpence.md`，断言内容包含：

```ts
expect(moonAndSixpence).toContain(
  'raw.githubusercontent.com/standardebooks/w-somerset-maugham_the-moon-and-sixpence/master/images/cover.jpg',
);
expect(moonAndSixpence).toContain('provider: standard-ebooks');
expect(moonAndSixpence).toContain('credit: "Standard Ebooks contributors"');
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/content.config.test.ts`

预期：FAIL，旧 Open Library URL 与 `open-library` provider 不满足新断言。

- [ ] **步骤 3：登记 provider 并修改内容配置**

在 `remoteCoverProviderValues` 中加入：

```ts
'standard-ebooks',
```

将《月亮与六便士》的 cover 改为：

```yaml
cover:
  kind: remote
  src: "https://raw.githubusercontent.com/standardebooks/w-somerset-maugham_the-moon-and-sixpence/master/images/cover.jpg"
  sourceUrl: "https://github.com/standardebooks/w-somerset-maugham_the-moon-and-sixpence"
  provider: standard-ebooks
  credit: "Standard Ebooks contributors"
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/content.config.test.ts src/features/recommendations/recommendation-types.test.ts`

预期：两个测试文件全部 PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/recommendation-types.ts \
  src/data/recommendations/the-moon-and-sixpence.md \
  src/content.config.test.ts
git commit -m "content: replace moon and sixpence cover"
```

### 任务 2：给 Three.js 纹理增加正方形居中裁剪

**文件：**
- 修改：`src/features/recommendations/create-cover-texture.ts`
- 测试：`src/features/recommendations/create-cover-texture.test.ts`

- [ ] **步骤 1：编写失败的纯函数测试**

导出并测试 `getSquareTextureTransform(width, height)`：

```ts
expect(getSquareTextureTransform(1400, 2100)).toEqual({
  repeat: [1, 2 / 3],
  offset: [0, 1 / 6],
});
expect(getSquareTextureTransform(2100, 1400)).toEqual({
  repeat: [2 / 3, 1],
  offset: [1 / 6, 0],
});
expect(getSquareTextureTransform(1024, 1024)).toEqual({
  repeat: [1, 1],
  offset: [0, 0],
});
expect(getSquareTextureTransform(0, 1024)).toBeNull();
```

扩展加载测试，为 mock 纹理提供 `image.width = 1400`、`image.height = 2100`，并断言加载成功后：

```ts
expect(request.texture.repeat.toArray()).toEqual([1, 2 / 3]);
expect(request.texture.offset.toArray()).toEqual([0, 1 / 6]);
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx vitest run src/features/recommendations/create-cover-texture.test.ts`

预期：FAIL，`getSquareTextureTransform` 尚未导出，纹理也没有修改 repeat/offset。

- [ ] **步骤 3：实现纯函数和纹理配置**

在 `create-cover-texture.ts` 增加：

```ts
export const getSquareTextureTransform = (width: number, height: number) => {
  if (width <= 0 || height <= 0) return null;
  if (width === height) return { repeat: [1, 1], offset: [0, 0] } as const;

  if (width > height) {
    const repeatX = height / width;
    return {
      repeat: [repeatX, 1],
      offset: [(1 - repeatX) / 2, 0],
    } as const;
  }

  const repeatY = width / height;
  return {
    repeat: [1, repeatY],
    offset: [0, (1 - repeatY) / 2],
  } as const;
};
```

在纹理加载成功回调中读取 `loadedTexture.image.width/height`，存在有效 transform 时调用：

```ts
loadedTexture.repeat.set(...transform.repeat);
loadedTexture.offset.set(...transform.offset);
```

- [ ] **步骤 4：运行测试验证通过**

运行：`npx vitest run src/features/recommendations/create-cover-texture.test.ts`

预期：该测试文件全部 PASS，sRGB、失败回退与 dispose 断言继续通过。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/create-cover-texture.ts \
  src/features/recommendations/create-cover-texture.test.ts
git commit -m "feat: crop recommendation textures to square"
```

### 任务 3：统一 WebGL 与 CSS 书籍封面布局

**文件：**
- 修改：`src/features/recommendations/models/BookModel.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`
- 测试：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：编写失败的浏览器测试**

在推荐页测试中切换到书籍并选中《月亮与六便士》，验证：

```ts
await page.getByRole('button', { name: '书籍', exact: true }).click();
await expect(page.getByRole('heading', { level: 2 })).toHaveText('月亮与六便士');
await expect(page.getByText('Standard Ebooks contributors')).toBeVisible();
```

在 WebGL 不可用测试中检查 CSS 书籍图片的盒模型为正方形：

```ts
const dimensions = await page
  .getByRole('img', { name: '月亮与六便士 封面' })
  .evaluate((image) => ({ width: image.clientWidth, height: image.clientHeight }));
expect(Math.abs(dimensions.width - dimensions.height)).toBeLessThanOrEqual(1);
```

- [ ] **步骤 2：运行测试验证失败**

运行：`npx playwright test tests/e2e/site.spec.ts --grep "推荐页"`

预期：FAIL，CSS 书籍封面当前被强制为竖向容器尺寸。

- [ ] **步骤 3：修改 3D 和 CSS 书籍图片平面**

在 `BookModel.tsx` 中把图片平面改为正方形：

```tsx
<planeGeometry args={[2.94, 2.94]} />
```

在 CSS 中让 `.cssBook .cssFace` 居中承载正方形图片：

```css
.cssBook .cssFace {
  display: grid;
  place-items: center;
  background: #161616;
}

.cssBook .cssFace > * {
  width: 100%;
  height: auto;
  aspect-ratio: 1;
}
```

- [ ] **步骤 4：运行针对性验证**

运行：

```bash
npx playwright test tests/e2e/site.spec.ts --grep "推荐页"
npm test
npm run check
```

预期：推荐页端到端测试、15 个单元测试文件和 Astro 检查全部通过；检查结果为 0 errors。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/models/BookModel.tsx \
  src/features/recommendations/RecommendationExperience.module.css \
  tests/e2e/site.spec.ts
git commit -m "style: preserve square recommendation artwork"
```

### 任务 4：生产构建与视觉验收

**文件：**
- 验证：`src/data/recommendations/the-moon-and-sixpence.md`
- 验证：`src/features/recommendations/create-cover-texture.ts`
- 验证：`src/features/recommendations/models/BookModel.tsx`
- 验证：`src/features/recommendations/RecommendationExperience.module.css`

- [ ] **步骤 1：运行完整验证**

运行：

```bash
npm test
npm run check
npm run build
npm run test:e2e
git diff --check
```

预期：所有命令退出码为 0。

- [ ] **步骤 2：启动并检查本地预览**

运行：`npm run preview -- --host 127.0.0.1`

打开 `/Atoms-H.github.io/recommendations/`，切换到书籍并确认：

- 《月亮与六便士》显示 Standard Ebooks 人物油画源图；
- 图片居中裁成正方形，人物比例正常；
- 书籍实体仍为竖向，图片上下显示深色书封区域；
- CSS 回退与 WebGL 布局一致；
- CD 图片同样没有拉伸。

- [ ] **步骤 3：记录最终状态**

运行：

```bash
git status --short
npx astro preview status
```

预期：工作区干净，预览服务在 `http://127.0.0.1:4321` 运行。
