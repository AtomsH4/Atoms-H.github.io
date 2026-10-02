# 推荐页沉浸式海报改版实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将推荐页改成首屏可见、可拖动的沉浸式 3D 海报舞台，默认展示音乐，加载权威远程封面，并在 WebGL 不可用时保留 CSS 立体拖动体验。

**架构：** 继续由 `RecommendationExperience` 持有分类和当前作品状态，WebGL 舞台与 CSS 立体舞台只消费窄 props。内容 schema 新增严格的 `remote` 封面分支并彻底删除推荐语；远程图片通过支持 CORS 的 Cover Art Archive、Open Library、Netflix 和 YouTube CDN 直接加载，失败时使用本地生成封面。

**技术栈：** Astro 7、React 19、TypeScript、Three.js、React Three Fiber、Drei、CSS 3D transforms、Vitest、Testing Library、Playwright。

---

## 文件结构

### 新建

- `src/features/recommendations/drag-rotation.ts`：纯函数形式的指针拖动与旋转边界。
- `src/features/recommendations/drag-rotation.test.ts`：拖动、角度限制与复位测试。
- `src/features/recommendations/useDragRotation.ts`：将 Pointer Events 映射到纯旋转状态。
- `src/features/recommendations/RecommendationFallbackStage.tsx`：无 WebGL 时的单项 CSS 立体 CD / 书籍舞台。
- `src/features/recommendations/RecommendationFallbackStage.test.tsx`：降级舞台选择和拖动测试。

### 修改

- `src/features/recommendations/recommendation-types.ts`：删除 `summary`，增加远程封面类型与提供方。
- `src/features/recommendations/recommendation-types.test.ts`：覆盖新的判别联合与模型解析。
- `src/content.config.ts`：删除推荐语 schema，增加严格远程封面 schema。
- `src/content.config.test.ts`：验证远程封面、HTTPS 和遗留字段拒绝。
- `src/features/recommendations/recommendation-content.ts`：规范化本地授权封面路径，远程 URL 保持不变。
- `src/features/recommendations/recommendation-content.test.ts`：移除推荐语 fixture，测试远程 URL。
- `src/features/recommendations/recommendation-navigation.ts`：删除 `all`，新增 hash + 默认分类选择纯函数。
- `src/features/recommendations/recommendation-navigation.test.ts`：覆盖默认音乐和深链分类切换。
- `src/features/recommendations/create-cover-texture.ts`：加载 `remote`，为生成封面提供确定性彩色调色板。
- `src/features/recommendations/create-cover-texture.test.ts`：测试颜色确定性与 XML 转义。
- `src/features/recommendations/RecommendationCover.tsx`：支持远程图片和同色生成回退。
- `src/features/recommendations/RecommendationExperience.tsx`：默认音乐、无“全部”、海报叠层结构、无推荐语、CSS 立体降级。
- `src/features/recommendations/RecommendationExperience.test.tsx`：覆盖默认音乐、无“全部”、深链、远程封面和降级舞台。
- `src/features/recommendations/RecommendationExperience.module.css`：沉浸式海报、移动端构图和 CSS 3D 实物样式。
- `src/features/recommendations/RecommendationStage.tsx`：Canvas 填满海报容器并保持有限拖动。
- `src/features/recommendations/stage-layout.ts`：调整桌面与移动端槽位。
- `src/features/recommendations/stage-layout.test.ts`：锁定中心项和邻居位置。
- `src/pages/recommendations/index.astro`：删除大标题块，只保留可访问 h1。
- `src/layouts/RecommendationLayout.astro`：压缩推荐主题 header 与 main 留白。
- `src/components/HomeRecommendations.astro`：紧凑海报边界。
- `src/data/recommendations/*.md`：删除 `summary`，写入十一项远程封面元数据。
- `docs/recommendation-cover-sources.md`：更新封面提供方、来源页与风险说明。
- `tests/e2e/site.spec.ts`：首屏、默认分类、真拖动、CSS 降级、移动端和封面回归。

### 删除

- `src/features/recommendations/RecommendationFallback.tsx`：由可拖动 CSS 立体舞台替代。
- `public/media/recommendations/back-in-black.svg`：Back in Black 改用远程专辑封面，不再保留本地再分发文件。

---

### 任务 1：收紧内容契约并删除推荐语

**文件：**
- 修改：`src/features/recommendations/recommendation-types.ts`
- 修改：`src/features/recommendations/recommendation-types.test.ts`
- 修改：`src/content.config.ts`
- 修改：`src/content.config.test.ts`
- 修改：`src/features/recommendations/recommendation-content.ts`
- 修改：`src/features/recommendations/recommendation-content.test.ts`

- [ ] **步骤 1：先把类型和 schema 测试改成新契约**

在 `recommendation-types.test.ts` 增加：

```ts
import type { RecommendationCover } from './recommendation-types';

it('keeps remote cover provenance separate from presentation', () => {
  const cover: RecommendationCover = {
    kind: 'remote',
    src: 'https://coverartarchive.org/release-group/example/front-1200',
    sourceUrl: 'https://musicbrainz.org/release-group/example',
    provider: 'cover-art-archive',
    credit: 'Cover Art Archive / MusicBrainz contributors',
  };

  expect(cover.kind).toBe('remote');
});
```

把 `content.config.test.ts` 的有效推荐 fixture 改成不含 `summary`，并增加：

```ts
it('accepts a strict HTTPS remote cover', () => {
  expect(recommendationSchema.safeParse({
    ...validRecommendation,
    cover: {
      kind: 'remote',
      src: 'https://covers.openlibrary.org/b/id/314604-L.jpg?default=false',
      sourceUrl: 'https://openlibrary.org/works/OL505740W',
      provider: 'open-library',
      credit: 'Open Library cover repository',
    },
  }).success).toBe(true);
});

it('rejects the removed summary field and insecure remote images', () => {
  expect(recommendationSchema.safeParse({
    ...validRecommendation,
    summary: 'Legacy recommendation copy',
  }).success).toBe(false);

  expect(recommendationSchema.safeParse({
    ...validRecommendation,
    cover: {
      kind: 'remote',
      src: 'http://example.com/cover.jpg',
      sourceUrl: 'https://example.com/item',
      provider: 'youtube',
      credit: 'Example',
    },
  }).success).toBe(false);
});
```

同步从 `recommendation-content.test.ts` 的 entry fixtures 与期望值中删除 `summary`，增加远程封面经 `toRecommendationItem` 后 URL 不变的断言。

- [ ] **步骤 2：运行测试并确认因旧契约失败**

运行：

```bash
npx vitest run src/features/recommendations/recommendation-types.test.ts src/content.config.test.ts src/features/recommendations/recommendation-content.test.ts
```

预期：FAIL；`RecommendationCover` 没有 `remote` 分支，schema 仍要求 `summary`。

- [ ] **步骤 3：实现最小类型与严格 schema**

在 `recommendation-types.ts` 导出：

```ts
export const remoteCoverProviderValues = [
  'cover-art-archive',
  'open-library',
  'netflix',
  'youtube',
] as const;

export type RemoteCoverProvider =
  (typeof remoteCoverProviderValues)[number];

export type RecommendationCover =
  | { kind: 'generated'; credit: string }
  | {
      kind: 'licensed';
      src: string;
      sourceUrl: string;
      license: string;
      licenseUrl: string;
      credit: string;
    }
  | {
      kind: 'remote';
      src: string;
      sourceUrl: string;
      provider: RemoteCoverProvider;
      credit: string;
    };
```

从 `RecommendationItem` 删除 `summary`。

在 `content.config.ts` 导入 `remoteCoverProviderValues`，向判别联合增加：

```ts
z.object({
  kind: z.literal('remote'),
  src: httpsUrl,
  sourceUrl: httpsUrl,
  provider: z.enum(remoteCoverProviderValues),
  credit: z.string().min(1),
}).strict(),
```

从 `recommendationSchema` 删除 `summary`。不要改 blog / notes / projects 的 `entrySchema.summary`。

`toRecommendationItem` 继续只对 `licensed` 的本地 `src` 调用 `joinBasePath`；`remote` 原样返回。

- [ ] **步骤 4：运行定向测试与全量单测**

运行：

```bash
npx vitest run src/features/recommendations/recommendation-types.test.ts src/content.config.test.ts src/features/recommendations/recommendation-content.test.ts
npm test
```

预期：定向测试和全量测试 PASS；其他推荐 fixture 若仍含 `summary` 会明确失败，并在后续任务逐项删除。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/recommendation-types.ts src/features/recommendations/recommendation-types.test.ts src/content.config.ts src/content.config.test.ts src/features/recommendations/recommendation-content.ts src/features/recommendations/recommendation-content.test.ts
git commit -m "refactor: update recommendation content contract"
```

---

### 任务 2：迁移十一项远程封面数据

**文件：**
- 修改：`src/data/recommendations/*.md`
- 修改：`docs/recommendation-cover-sources.md`
- 删除：`public/media/recommendations/back-in-black.svg`

- [ ] **步骤 1：为迁移写内容集合失败断言**

在 `src/content.config.test.ts` 增加对实际内容文件的静态扫描：

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

it('stores no recommendation summaries or local third-party cover paths', () => {
  const directory = join(process.cwd(), 'src/data/recommendations');
  const sources = readdirSync(directory)
    .filter((name) => name.endsWith('.md'))
    .map((name) => readFileSync(join(directory, name), 'utf8'));

  expect(sources).toHaveLength(11);
  expect(sources.every((source) => !/^summary:/m.test(source))).toBe(true);
  expect(sources.every((source) => !/src:\s*\/media\/recommendations\//m.test(source))).toBe(true);
});
```

- [ ] **步骤 2：运行测试确认十一份旧内容失败**

运行：

```bash
npx vitest run src/content.config.test.ts
```

预期：FAIL；旧文件仍包含 `summary`，Back in Black 仍使用本地路径。

- [ ] **步骤 3：删除所有推荐语并写入精确远程封面**

十一项使用以下数据。每个对象都必须完整写入对应 Markdown，不能在运行时搜索：

| Slug | provider | `src` | `sourceUrl` | `credit` |
| --- | --- | --- | --- | --- |
| `wo-biao-shi-li-jie` | `cover-art-archive` | `https://coverartarchive.org/release-group/695dd59f-d70e-4960-b5fc-e6864eaa2e81/front-1200` | `https://musicbrainz.org/release-group/695dd59f-d70e-4960-b5fc-e6864eaa2e81` | `Cover Art Archive / MusicBrainz contributors` |
| `leave-the-door-open` | `cover-art-archive` | `https://coverartarchive.org/release-group/b2518ad1-3d54-4a8a-badb-959893da24d0/front-1200` | `https://musicbrainz.org/release-group/b2518ad1-3d54-4a8a-badb-959893da24d0` | `Cover Art Archive / MusicBrainz contributors` |
| `gei-zi-ji-de-qing-shu` | `cover-art-archive` | `https://coverartarchive.org/release-group/fe9bf6c3-dbe7-3170-baf4-ebe31d2b40d7/front-1200` | `https://musicbrainz.org/release-group/fe9bf6c3-dbe7-3170-baf4-ebe31d2b40d7` | `Cover Art Archive / MusicBrainz contributors` |
| `back-in-black` | `cover-art-archive` | `https://coverartarchive.org/release-group/d3bc1a64-7561-3787-b680-0003aa50f8f1/front-1200` | `https://musicbrainz.org/release-group/d3bc1a64-7561-3787-b680-0003aa50f8f1` | `Cover Art Archive / MusicBrainz contributors` |
| `the-moon-and-sixpence` | `open-library` | `https://covers.openlibrary.org/b/id/314604-L.jpg?default=false` | `https://openlibrary.org/works/OL505740W` | `Open Library cover repository` |
| `flowers-for-algernon` | `open-library` | `https://covers.openlibrary.org/b/id/12947700-L.jpg?default=false` | `https://openlibrary.org/works/OL515754W` | `Open Library cover repository` |
| `to-live` | `open-library` | `https://covers.openlibrary.org/b/id/6823968-L.jpg?default=false` | `https://openlibrary.org/works/OL15861449W` | `Open Library cover repository` |
| `hospital-playlist` | `netflix` | `https://occ-0-988-993.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABXz6fYrErIOBHwmhpDarBaAhO4z0ZTgfL9nqgOXx1KYJYDaifJnP39BOmMrqEhEFpcA0TomlstCkrSTley7v5_zjs_KXnNkcyTkc.jpg?r=8dd` | `https://www.netflix.com/title/81239224` | `Netflix official title artwork` |
| `dear-you` | `youtube` | `https://i.ytimg.com/vi/kDPgu6Hxgaw/maxresdefault.jpg` | `https://www.youtube.com/watch?v=kDPgu6Hxgaw` | `CMC Pictures official trailer / YouTube` |
| `neon-genesis-evangelion` | `netflix` | `https://occ-0-993-988.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABeIY-txUfgVvbEibevVB1R6dhriIrBxtEkciAIizz_3WWKn4HnP8LBZWEGdVfUnFrKeXM77dsLgc5kLMb3eNwwMwQDm-jvvCNAOx.jpg?r=ffe` | `https://www.netflix.com/title/81033445` | `Netflix official title artwork` |
| `flipped` | `netflix` | `https://occ-0-988-993.1.nflxso.net/dnm/api/v6/6AYY37jfdO6hpXcMjf9Yu5cnmO0/AAAABaIMA2Hn0l4KFRrIy4qNp5PAsP9mKSl-GHJlOLz_fq_YgOWMDwOPLyIm4hK_lpof2Q8cRoeRctLLBOQVcLKnSwQ8zNBTF3gP6AWw.jpg?r=1da` | `https://www.netflix.com/title/70130442` | `Netflix official title artwork` |

每个 frontmatter 形式为：

```yaml
cover:
  kind: remote
  src: <表格中的完整 HTTPS URL>
  sourceUrl: <表格中的完整来源页>
  provider: <表格中的 provider>
  credit: <表格中的 credit>
```

删除所有 `summary` 行。删除 `public/media/recommendations/back-in-black.svg`。

- [ ] **步骤 4：更新封面审计文档**

`docs/recommendation-cover-sources.md` 对每项记录 provider、来源页、是否支持 CORS、远程引用决定与风险说明。明确：

- Cover Art Archive 图片公开可访问但原作不因此进入公共领域。
- Open Library 官方建议公共页面直接使用其 Covers API URL 并链接回作品页。
- Netflix 与 YouTube 图像来自官方作品页或官方预告片，仅远程引用并保留来源。
- 仓库不保存上述第三方位图。

- [ ] **步骤 5：验证远程端点与内容构建**

运行：

```bash
npx vitest run src/content.config.test.ts src/features/recommendations/recommendation-content.test.ts
npm run build
```

再运行一次只读端点检查：

```bash
rg '^\s+src: https://' src/data/recommendations -N | sed 's/^.*src: //' | while IFS= read -r url; do curl --fail --silent --show-error --location --range 0-0 --max-time 20 "$url" >/dev/null; done
```

预期：11 个端点全部返回可读取图片；构建识别 11 项推荐且不含 schema 错误。

- [ ] **步骤 6：Commit**

```bash
git add src/data/recommendations docs/recommendation-cover-sources.md src/content.config.test.ts
git add -u public/media/recommendations/back-in-black.svg
git commit -m "content: use remote recommendation covers"
```

---

### 任务 3：支持远程纹理和确定性彩色回退

**文件：**
- 修改：`src/features/recommendations/create-cover-texture.ts`
- 修改：`src/features/recommendations/create-cover-texture.test.ts`
- 修改：`src/features/recommendations/RecommendationCover.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.test.tsx`

- [ ] **步骤 1：编写彩色生成封面和远程失败测试**

在 `create-cover-texture.test.ts` 增加：

```ts
import { getGeneratedCoverPalette } from './create-cover-texture';

it('creates a stable non-monochrome palette for each item', () => {
  expect(getGeneratedCoverPalette('music-item')).toEqual(
    getGeneratedCoverPalette('music-item'),
  );
  const palette = getGeneratedCoverPalette('music-item');
  expect(new Set([palette.background, palette.accent, palette.foreground]).size)
    .toBe(3);
});
```

把 `RecommendationExperience.test.tsx` 的封面测试扩展为 `remote`：渲染远程 `<img>`，触发 `error` 后出现标题、作者、年份和 `data-cover-kind="generated"`。

- [ ] **步骤 2：运行测试并确认失败**

```bash
npx vitest run src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/RecommendationExperience.test.tsx
```

预期：FAIL；没有 `getGeneratedCoverPalette`，`RecommendationCover` 只识别 licensed 图片。

- [ ] **步骤 3：实现调色板与通用图片源**

在 `create-cover-texture.ts` 增加六组固定调色板，并用字符串哈希选择：

```ts
const palettes = [
  { background: '#192a56', accent: '#fbc531', foreground: '#f5f6fa' },
  { background: '#6d214f', accent: '#ffda79', foreground: '#fff7e6' },
  { background: '#0b5345', accent: '#f4d03f', foreground: '#fdfefe' },
  { background: '#7b241c', accent: '#85c1e9', foreground: '#ffffff' },
  { background: '#17202a', accent: '#e67e22', foreground: '#f8f9f9' },
  { background: '#4a235a', accent: '#76d7c4', foreground: '#ffffff' },
] as const;

export const getGeneratedCoverPalette = (id: string) => {
  const hash = [...id].reduce((value, character) =>
    ((value * 31) + character.charCodeAt(0)) >>> 0, 0);
  return palettes[hash % palettes.length];
};
```

把 `createGeneratedCoverDataUrl` 的输入类型补上 `id: string`，用 `item.id` 选色，在 SVG 中增加一块 accent 几何形状；仍对标题与创作者做 XML 转义。现有调用传入完整 `RecommendationItem`，所以不新增并行参数；测试 fixture 也显式填写 `id`，避免调色板来源隐式依赖标题。

把纹理源统一为：

```ts
const imageSource = item.cover.kind === 'generated' ? null : item.cover.src;
loadTexture(imageSource ?? generatedSource, imageSource !== null);
```

TextureLoader 保持 `SRGBColorSpace`、取消过期回调和 dispose 行为。远程失败只回退生成纹理。

`RecommendationCover` 同样把 `licensed | remote` 视为图片，把生成回退的调色板通过 CSS custom properties传入。

- [ ] **步骤 4：验证定向测试、类型和构建**

```bash
npx vitest run src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/RecommendationExperience.test.tsx
npm run check
npm run build
```

预期：全部 PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/create-cover-texture.ts src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/RecommendationCover.tsx src/features/recommendations/RecommendationExperience.test.tsx
git commit -m "feat: load remote recommendation artwork"
```

---

### 任务 4：默认音乐并删除“全部”筛选

**文件：**
- 修改：`src/features/recommendations/recommendation-navigation.ts`
- 修改：`src/features/recommendations/recommendation-navigation.test.ts`
- 修改：`src/features/recommendations/RecommendationExperience.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.test.tsx`

- [ ] **步骤 1：为默认分类和深链写失败测试**

在 navigation test 中定义：

```ts
expect(getInitialRecommendationSelection(items, '', 'music')).toEqual({
  filter: 'music',
  activeId: 'item-1',
});

expect(getInitialRecommendationSelection(items, '#item-2', 'music')).toEqual({
  filter: 'book',
  activeId: 'item-2',
});
```

在 Experience test 中断言：

```tsx
render(<RecommendationExperience items={items} mode="catalog" />);
expect(screen.queryByRole('button', { name: '全部' })).not.toBeInTheDocument();
expect(screen.getByRole('button', { name: '音乐' })).toHaveAttribute('aria-pressed', 'true');
expect(screen.getByRole('heading', { name: 'Music title' })).toBeVisible();
```

另加 `/#book-item` 首次渲染时“书籍”被按下且标题为 Book title。

- [ ] **步骤 2：运行红灯**

```bash
npx vitest run src/features/recommendations/recommendation-navigation.test.ts src/features/recommendations/RecommendationExperience.test.tsx
```

预期：FAIL；现有 filter 包含 `all`，也没有 selection helper。

- [ ] **步骤 3：实现纯选择函数与组件状态**

把 filter 收窄为：

```ts
export type RecommendationFilter = RecommendationCategory;
```

新增：

```ts
export const getInitialRecommendationSelection = (
  items: RecommendationItem[],
  hash: string,
  defaultCategory: RecommendationCategory,
): { filter: RecommendationCategory; activeId: string | null } => {
  const rawHashId = hash.replace(/^#/, '');
  let decodedHashId: string | null = null;
  try {
    decodedHashId = rawHashId ? decodeURIComponent(rawHashId) : null;
  } catch {
    decodedHashId = null;
  }
  const hashItem = decodedHashId
    ? items.find((item) => item.id === decodedHashId)
    : undefined;
  if (hashItem) {
    return { filter: hashItem.category, activeId: hashItem.id };
  }

  const defaultItem = items.find((item) => item.category === defaultCategory)
    ?? items[0]
    ?? null;
  return {
    filter: defaultItem?.category ?? defaultCategory,
    activeId: defaultItem?.id ?? null,
  };
};
```

`RecommendationExperienceProps` 的 catalog 分支增加可选 `defaultCategory?: RecommendationCategory`，默认 `music`。只渲染 `recommendationCategoryValues` 三个按钮；featured 模式继续不渲染分类。

- [ ] **步骤 4：验证测试**

```bash
npx vitest run src/features/recommendations/recommendation-navigation.test.ts src/features/recommendations/RecommendationExperience.test.tsx
npm test
```

预期：PASS，且全量单测无回归。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/recommendation-navigation.ts src/features/recommendations/recommendation-navigation.test.ts src/features/recommendations/RecommendationExperience.tsx src/features/recommendations/RecommendationExperience.test.tsx
git commit -m "feat: default recommendations to music"
```

---

### 任务 5：实现可拖动 CSS 立体降级舞台

**文件：**
- 创建：`src/features/recommendations/drag-rotation.ts`
- 创建：`src/features/recommendations/drag-rotation.test.ts`
- 创建：`src/features/recommendations/useDragRotation.ts`
- 创建：`src/features/recommendations/RecommendationFallbackStage.tsx`
- 创建：`src/features/recommendations/RecommendationFallbackStage.test.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`
- 删除：`src/features/recommendations/RecommendationFallback.tsx`

- [ ] **步骤 1：写旋转纯函数红灯测试**

`drag-rotation.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { createDragRotation, updateDragRotation } from './drag-rotation';

describe('drag rotation', () => {
  it('maps pointer movement into bounded rotation', () => {
    const started = updateDragRotation(createDragRotation(), {
      type: 'start', x: 100, y: 100,
    });
    const moved = updateDragRotation(started, {
      type: 'move', x: 500, y: -200,
    });
    expect(moved.rotationX).toBe(-18);
    expect(moved.rotationY).toBe(28);
  });

  it('returns to zero when released', () => {
    const state = { ...createDragRotation(), dragging: true, rotationX: 10, rotationY: 15 };
    expect(updateDragRotation(state, { type: 'end' })).toMatchObject({
      dragging: false, rotationX: 0, rotationY: 0,
    });
  });
});
```

- [ ] **步骤 2：写降级组件红灯测试**

`RecommendationFallbackStage.test.tsx` 使用 music/book 两项，覆盖：

- 只存在一个 `aria-current="true"` 的 active 模型。
- active music 输出 `data-presentation="disc"`，book 输出 `book`。
- pointer down / move 后 active 元素的 inline custom properties 从 `0deg` 变化。
- pointer up 后 custom properties 回到 `0deg`。
- 点击邻居调用 `onSelect`。

- [ ] **步骤 3：运行红灯**

```bash
npx vitest run src/features/recommendations/drag-rotation.test.ts src/features/recommendations/RecommendationFallbackStage.test.tsx
```

预期：FAIL；模块尚不存在。

- [ ] **步骤 4：实现纯 reducer 和 hook**

`drag-rotation.ts` 导出明确状态和 action：

```ts
export type DragRotation = {
  dragging: boolean;
  startX: number;
  startY: number;
  rotationX: number;
  rotationY: number;
};

export type DragRotationAction =
  | { type: 'start'; x: number; y: number }
  | { type: 'move'; x: number; y: number }
  | { type: 'end' };

export const createDragRotation = (): DragRotation => ({
  dragging: false, startX: 0, startY: 0, rotationX: 0, rotationY: 0,
});
```

`move` 用 `(startY - y) * 0.16` 得到 X、`(x - startX) * 0.18` 得到 Y，分别 clamp 到 `[-18, 18]` 和 `[-28, 28]`。`end` 复位为零。

`useDragRotation.ts` 用 `useReducer` 暴露 `rotation` 和 `pointerHandlers`；pointer down 时 `setPointerCapture`，pointer up / cancel / lost capture 都 dispatch end。reduced motion 时 release 立即无过渡，其他情况由 CSS transition 复位。

- [ ] **步骤 5：实现 CSS 立体舞台**

`RecommendationFallbackStage` props 与 WebGL 舞台对齐到：

```ts
type Props = {
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
};
```

使用 `getStageItems` 获取 active 与邻居。active 外层绑定拖动；非 active 只绑定 click。CD 结构包含 cover face、中心孔和 edge；书结构包含 cover、pages 和 spine。封面面使用 `RecommendationCover`。

CSS 要求：

```css
.cssStage { perspective: 1100px; touch-action: pan-y; }
.cssObject { transform: translate3d(...) rotateX(var(--rx)) rotateY(var(--ry)); transform-style: preserve-3d; }
.cssObject[data-dragging='false'] { transition: transform 420ms cubic-bezier(.2,.8,.2,1); }
.cssDisc { border-radius: 50%; }
.cssDisc::after { /* 中心孔 */ }
.cssBookPages { transform: translateZ(-0.5rem); }
.cssBookSpine { transform: rotateY(90deg); }
```

Experience 在 `checking | unavailable | failed` 时渲染该舞台；提示文本放在底部细栏，不再输出多卡列表。删除旧 `RecommendationFallback.tsx`。

- [ ] **步骤 6：验证组件与全量单测**

```bash
npx vitest run src/features/recommendations/drag-rotation.test.ts src/features/recommendations/RecommendationFallbackStage.test.tsx src/features/recommendations/RecommendationExperience.test.tsx
npm test
```

预期：PASS。

- [ ] **步骤 7：Commit**

```bash
git add src/features/recommendations/drag-rotation.ts src/features/recommendations/drag-rotation.test.ts src/features/recommendations/useDragRotation.ts src/features/recommendations/RecommendationFallbackStage.tsx src/features/recommendations/RecommendationFallbackStage.test.tsx src/features/recommendations/RecommendationExperience.tsx src/features/recommendations/RecommendationExperience.module.css
git add -u src/features/recommendations/RecommendationFallback.tsx
git commit -m "feat: add draggable css recommendation stage"
```

---

### 任务 6：重排沉浸式海报与首屏 3D 舞台

**文件：**
- 修改：`src/features/recommendations/RecommendationExperience.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`
- 修改：`src/features/recommendations/RecommendationStage.tsx`
- 修改：`src/features/recommendations/stage-layout.ts`
- 修改：`src/features/recommendations/stage-layout.test.ts`
- 修改：`src/pages/recommendations/index.astro`
- 修改：`src/layouts/RecommendationLayout.astro`
- 修改：`src/components/HomeRecommendations.astro`

- [ ] **步骤 1：先写页面结构组件测试**

在 `RecommendationExperience.test.tsx` 增加：

```tsx
expect(screen.getByTestId('recommendation-poster')).toContainElement(
  screen.getByTestId('recommendation-stage'),
);
expect(screen.getByRole('heading', { name: 'Music title', level: 2 })).toBeVisible();
expect(screen.getByText('Artist')).toBeVisible();
expect(screen.getByText('2026')).toBeVisible();
expect(screen.queryByText('Music summary')).not.toBeInTheDocument();
```

为根节点增加 `data-mode="catalog|featured"` 断言，便于 CSS 对首页应用紧凑高度。

- [ ] **步骤 2：锁定响应式槽位红灯**

在 `stage-layout.test.ts` 增加位置断言：

```ts
expect(desktopSlots['0'].position).toEqual([0.55, -0.1, 0]);
expect(compactSlots['0'].position).toEqual([0, -0.2, 0]);
expect(Math.abs(compactSlots['1'].position[0])).toBeGreaterThan(2);
```

这些坐标保证桌面当前项给左上文字留白，移动端当前项居中且邻居只露边。

- [ ] **步骤 3：运行红灯**

```bash
npx vitest run src/features/recommendations/RecommendationExperience.test.tsx src/features/recommendations/stage-layout.test.ts
```

预期：FAIL；旧结构仍是 metadata 后跟 stage，槽位值不匹配。

- [ ] **步骤 4：重构 Experience 海报 DOM**

结构调整为：

```tsx
<section className={styles.experience} data-mode={mode} ...>
  <div className={styles.poster} data-testid="recommendation-poster">
    <div className={styles.stage}>...</div>
    <div className={styles.metadata}>分类、h2、作者、年份</div>
    {mode === 'catalog' && <div className={styles.toolbar}>三个分类</div>}
    <nav className={styles.navigation}>边缘上一项 / 下一项</nav>
    <div className={styles.posterIndex}>01 / 04 · Drag to rotate</div>
    <div className={styles.credits}>来源、许可、详情</div>
  </div>
</section>
```

彻底删除 summary 渲染。credits 对 remote 显示 provider 和 source link，对 licensed 保留 source / license，对 generated 显示原创排版。

- [ ] **步骤 5：实现海报布局 CSS**

桌面：

```css
.experience { padding: 0; background: var(--poster-paper, #f7f6f1); }
.poster { position: relative; min-height: clamp(42rem, calc(100svh - 7rem), 58rem); overflow: clip; border-block: 1px solid rgb(0 0 0 / 18%); }
.stage { position: absolute; inset: 0; min-height: 0; margin: 0; z-index: 0; }
.stage canvas { width: 100% !important; height: 100% !important; }
.metadata { position: absolute; top: clamp(1.25rem, 3vw, 2.5rem); left: clamp(1.25rem, 3vw, 2.5rem); z-index: 2; width: min(24rem, 32vw); pointer-events: none; }
.toolbar { position: absolute; top: 1.5rem; right: 2rem; z-index: 3; }
.credits { position: absolute; left: 2rem; right: 2rem; bottom: 1.25rem; z-index: 3; display: flex; justify-content: space-between; border-top: 1px solid currentColor; }
```

移动端 `@media (max-width:760px)`：poster 高度至少 `calc(100svh - 5rem)`；metadata 宽度不超过 70%；toolbar 在顶部右侧并允许紧凑换行；stage 保持 55–60svh 的可视物体区；credits 进入海报底部但不覆盖箭头。

featured 模式使用 `data-mode='featured'` 把 poster 高度限制在 `min(38rem, 70svh)`。

- [ ] **步骤 6：让 Canvas 填满父级并更新槽位**

移除 Canvas 的固定 inline `height: clamp(...)`，改为：

```tsx
<Canvas style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} ...>
```

更新 slots：

```ts
desktopSlots['0'] = {
  position: [0.55, -0.1, 0], rotation: [-0.04, -0.12, 0.05], scale: 1.05,
};
compactSlots['0'] = {
  position: [0, -0.2, 0], rotation: [-0.04, -0.1, 0.03], scale: 0.86,
};
compactSlots['-1'].position = [-2.45, 0.05, -0.9];
compactSlots['1'].position = [2.45, 0.05, -0.9];
```

桌面两侧槽位保持五项构图，但整体向右偏移约 0.5，给左上信息留白。

- [ ] **步骤 7：收紧 Astro 外框**

`src/pages/recommendations/index.astro` 改为：

```astro
<RecommendationLayout title="推荐 | AtomsH4">
  <h1 class="sr-only">推荐</h1>
  <RecommendationExperience items={items} mode="catalog" client:load />
</RecommendationLayout>
```

删除旧 `.recommendation-title` 样式。

`RecommendationLayout.astro` 将推荐主题 header 的 margin / padding 压缩到单行，main 使用 `width:min(100%,96rem); margin:.75rem auto 1.5rem;`。不要修改 BaseLayout 或普通页面。

`HomeRecommendations.astro` 保留 section 标题和“查看全部推荐”，但取消外层重复 padding，让内部紧凑 poster 自己控制构图。

- [ ] **步骤 8：验证定向测试、类型和构建**

```bash
npx vitest run src/features/recommendations/RecommendationExperience.test.tsx src/features/recommendations/stage-layout.test.ts
npm run check
npm run build
```

预期：PASS；推荐页静态产物存在。

- [ ] **步骤 9：Commit**

```bash
git add src/features/recommendations/RecommendationExperience.tsx src/features/recommendations/RecommendationExperience.module.css src/features/recommendations/RecommendationStage.tsx src/features/recommendations/stage-layout.ts src/features/recommendations/stage-layout.test.ts src/pages/recommendations/index.astro src/layouts/RecommendationLayout.astro src/components/HomeRecommendations.astro src/features/recommendations/RecommendationExperience.test.tsx
git commit -m "feat: redesign recommendations as immersive poster"
```

---

### 任务 7：补齐真实浏览器回归

**文件：**
- 修改：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：更新旧断言为新行为**

修改推荐页 E2E：

- 不再断言“全部”。
- 首次载入断言音乐 `aria-pressed=true`。
- 不再寻找推荐语。
- `#flipped` 深链后断言影视与动画分类 active。
- WebGL 不可用时断言 `[data-css-recommendation-stage]` 存在，不再断言黑白封面按钮列表。

- [ ] **步骤 2：新增首屏与拖动红灯测试**

增加：

```ts
test('推荐页首屏展示海报舞台和左上信息', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/Atoms-H.github.io/recommendations/');

  const poster = page.getByTestId('recommendation-poster');
  const canvas = page.locator('canvas');
  const metadata = page.locator('[data-recommendation-metadata]');
  const canvasBox = await canvas.boundingBox();
  const metadataBox = await metadata.boundingBox();

  expect(canvasBox).not.toBeNull();
  expect(metadataBox).not.toBeNull();
  expect(canvasBox!.y).toBeLessThan(260);
  expect(metadataBox!.x).toBeLessThan(180);
  expect(metadataBox!.y).toBeLessThan(260);
  await expect(page.getByRole('button', { name: '音乐' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '全部' })).toHaveCount(0);
  await expect(poster).not.toContainText('克制而有张力');
});
```

扩展现有 Canvas 拖动测试：拖动前、pointer down/move 时和释放后截取 canvas，断言拖动中的 buffer 与拖动前不同；等待 snap 后标题和 active id 保持不变。

- [ ] **步骤 3：新增 CSS 3D 降级拖动红灯测试**

在覆盖 `getContext` 为 null 后：

```ts
const object = page.locator('[data-css-recommendation-active]');
await expect(object).toHaveAttribute('data-presentation', 'disc');
const before = await object.getAttribute('style');
const box = await object.boundingBox();
await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
await page.mouse.down();
await page.mouse.move(box!.x + box!.width / 2 + 90, box!.y + box!.height / 2 + 25, { steps: 5 });
const during = await object.getAttribute('style');
expect(during).not.toBe(before);
await page.mouse.up();
await expect(object).toHaveAttribute('style', /--rx:\s*0deg/);
```

- [ ] **步骤 4：运行新增 E2E 并确认失败**

```bash
npx playwright test tests/e2e/site.spec.ts --grep "推荐页"
```

预期：至少首屏布局、无“全部”和 CSS 立体舞台断言 FAIL。

- [ ] **步骤 5：完成最小测试适配并运行完整验证**

只修改 E2E 选择器和等待条件，不为通过测试而放宽已批准的用户行为。

运行：

```bash
npm test
npm run check
npm run build
npm run test:e2e
git diff --check
```

预期：所有命令 exit 0；Astro check 0 errors；所有 E2E PASS。

- [ ] **步骤 6：Commit**

```bash
git add tests/e2e/site.spec.ts
git commit -m "test: cover immersive recommendation poster"
```

---

### 任务 8：视觉验收与交付确认

**文件：**
- 可能修改：仅限前述任务中发现真实缺陷的文件

- [ ] **步骤 1：启动生产预览**

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

- [ ] **步骤 2：桌面视觉检查**

在 1440×900 检查：

1. Canvas 在首屏内，当前封面明显可见。
2. 分类、标题、作者、年份位于左上角。
3. 右上只有音乐、书籍、影视与动画；音乐默认 active。
4. 没有推荐语。
5. 当前物体拖动后旋转，释放后复位；邻居点击可切换。
6. 远程封面不是黑白排版回退；网络失败时才出现彩色生成封面。

- [ ] **步骤 3：移动端视觉检查**

在 390×844 检查：

1. 当前物体居中，两侧只露边。
2. 左上信息不遮挡主要封面。
3. 页面可纵向滚动且无横向溢出。
4. 横向拖动模型不会阻断纵向页面滚动。

- [ ] **步骤 4：无 WebGL 检查**

通过 Playwright init script 禁用 WebGL，确认 CSS CD / 书籍仍有厚度、封面、邻居和拖动复位。

- [ ] **步骤 5：若发现缺陷，先写最小回归再修复**

只允许一次集中修正提交：

```bash
git add src/features/recommendations src/pages/recommendations/index.astro src/layouts/RecommendationLayout.astro src/components/HomeRecommendations.astro src/data/recommendations docs/recommendation-cover-sources.md tests/e2e/site.spec.ts
git commit -m "fix: polish immersive recommendation poster"
```

没有修改时不创建空提交。

- [ ] **步骤 6：最终状态**

```bash
git status --short --branch
git log --oneline -12
```

预期：worktree 干净，提交按内容契约、数据、纹理、默认分类、CSS 降级、布局和 E2E 分层。
