# 3D 海报风推荐页实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 Astro 博客增加独立的黑白海报风推荐页和首页精选，以单个 React Three Fiber 画布展示可拖动旋转的 CD 与闭合书籍，并在无 WebGL 或封面失败时保留完整二维体验。

**架构：** Astro 内容集合负责校验、排序和静态路由；一个 React `RecommendationExperience` 显式持有筛选与当前项状态，并在二维降级视图和单个 WebGL 舞台之间切换。语义分类通过集中配置映射到独立的表现类型，3D 舞台只查询模型注册表，不依赖音乐、书籍或影视分类分支。

**技术栈：** Astro 7、React 19、TypeScript、Three.js、React Three Fiber、Drei、Vitest、Testing Library、Playwright。

---

## 范围与风险判断

这是一个跨越内容 schema、导航、首页、独立页面和浏览器 3D 运行时的中等规模前端功能。内容模型、交互状态、3D 渲染和页面集成可以按顺序独立交付；不修改持久化、后端、IPC 或其他基础设施。

共享布局有三种可选做法：

1. 给 `BaseLayout` 增加 `theme` 参数：修改共享契约，仅为一个页面服务，不采用。
2. 在现有 `BaseLayout` 内放全宽白色区域：页头和页面背景仍是玻璃渐变，不能满足设计，不采用。
3. 新建 `RecommendationLayout` 并复用 `SiteHeader`、`SiteFooter`：改动限制在功能层，不扩张共享布局 API，采用。

## 文件结构

### 创建

- `src/features/recommendations/recommendation-types.ts`：分类、表现、封面和客户端展示类型；分类配置与表现解析。
- `src/features/recommendations/recommendation-types.test.ts`：分类默认值、表现覆盖和有限枚举测试。
- `src/features/recommendations/recommendation-content.ts`：排序、草稿过滤、首页精选与内容条目规范化。
- `src/features/recommendations/recommendation-content.test.ts`：内容查询逻辑测试。
- `src/features/recommendations/recommendation-navigation.ts`：筛选、锚点和循环切换等纯状态函数。
- `src/features/recommendations/recommendation-navigation.test.ts`：状态函数测试。
- `src/features/recommendations/useWebGLAvailability.ts`：WebGL 能力检测和运行时失败状态。
- `src/features/recommendations/useWebGLAvailability.test.tsx`：能力检测测试。
- `src/features/recommendations/RecommendationCover.tsx`：HTML 版授权封面和原创排版封面。
- `src/features/recommendations/RecommendationFallback.tsx`：二维推荐横列。
- `src/features/recommendations/RecommendationExperience.tsx`：完整页与首页共享的显式状态所有者。
- `src/features/recommendations/RecommendationExperience.test.tsx`：筛选、循环、深链、降级和首页模式测试。
- `src/features/recommendations/RecommendationExperience.module.css`：海报舞台、控制区和二维降级样式。
- `src/features/recommendations/create-cover-texture.ts`：为授权图片和原创封面创建纹理 URL、加载失败回退。
- `src/features/recommendations/create-cover-texture.test.ts`：SVG 转义和回退 URL 测试。
- `src/features/recommendations/models/DiscModel.tsx`：程序化 CD 模型。
- `src/features/recommendations/models/BookModel.tsx`：程序化闭合书籍模型。
- `src/features/recommendations/model-registry.tsx`：表现类型到 3D 模型的显式注册表。
- `src/features/recommendations/model-registry.test.tsx`：注册表覆盖测试。
- `src/features/recommendations/stage-layout.ts`：桌面与移动端槽位、可见项计算。
- `src/features/recommendations/stage-layout.test.ts`：槽位和环形邻居测试。
- `src/features/recommendations/RecommendationStage.tsx`：任务 5 先建立可 mock 的窄契约，任务 7 替换为单 Canvas、灯光、阴影、模型选择和受限拖动实现。
- `src/layouts/RecommendationLayout.astro`：推荐页专属黑白页面框架。
- `src/pages/recommendations/index.astro`：推荐页路由和内容加载。
- `src/components/HomeRecommendations.astro`：首页精选边界组件。
- `src/data/recommendations/*.md`：十一项初始推荐内容。
- `public/media/recommendations/back-in-black.svg`：许可可核验的 Back in Black 文字封面。
- `docs/recommendation-cover-sources.md`：逐项封面审计和许可记录。

### 修改

- `package.json`、`package-lock.json`：增加 Three.js、React Three Fiber、Drei 和 Three 类型。
- `src/content.config.ts`：注册 `recommendations` 集合和严格 schema。
- `src/content.config.test.ts`：覆盖推荐条目的判别联合校验。
- `src/components/Navigation.tsx`：增加“推荐”入口。
- `src/components/Navigation.test.tsx`：验证基础路径与推荐入口。
- `src/pages/index.astro`：加载精选推荐并插入首页区块。
- `tests/e2e/site.spec.ts`：推荐页、首页深链、移动端、键盘和 WebGL 降级测试。

### 不修改

- `src/layouts/BaseLayout.astro`：不添加单页主题参数。
- `src/components/EntryCard.astro`、`src/components/EntryList.astro`：不扩张文章卡片 API。
- 现有博客、随笔与项目内容 schema：保持原契约。

---

### 任务 1：建立依赖与基线

**文件：**
- 修改：`package.json`
- 修改：`package-lock.json`

- [ ] **步骤 1：确认当前工作区和基线测试**

运行：

```bash
git status --short
npm test
npm run build
```

预期：现有 Vitest 测试和 Astro 生产构建通过；只记录用户已有的未跟踪文件，不把它们加入后续提交。

- [ ] **步骤 2：安装兼容 React 19 的 3D 依赖**

运行：

```bash
npm install three@^0.186.0 @react-three/fiber@^9.7.0 @react-three/drei@^10.7.8
npm install --save-dev @types/three@^0.186.0
```

预期：`package.json` 增加三个运行时依赖和一个开发依赖，`npm install` 无 peer dependency 错误。

- [ ] **步骤 3：验证安装未破坏基线**

运行：

```bash
npm test
npm run build
```

预期：PASS；此时还没有推荐页面。

- [ ] **步骤 4：Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add 3d recommendation dependencies"
```

---

### 任务 2：定义低耦合类型和严格内容 schema

**文件：**
- 创建：`src/features/recommendations/recommendation-types.ts`
- 创建：`src/features/recommendations/recommendation-types.test.ts`
- 修改：`src/content.config.ts`
- 修改：`src/content.config.test.ts`

- [ ] **步骤 1：编写分类与表现解析的失败测试**

创建 `src/features/recommendations/recommendation-types.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import {
  recommendationCategoryConfig,
  recommendationCategoryValues,
  presentationValues,
  resolvePresentation,
  type RecommendationItem,
} from './recommendation-types';

const item = (
  category: RecommendationItem['category'],
  presentation?: RecommendationItem['presentation'],
): RecommendationItem => ({
  id: `${category}-item`,
  title: 'Title',
  category,
  presentation,
  creator: 'Creator',
  year: 2026,
  summary: 'Summary',
  externalUrl: 'https://example.com/item',
  cover: { kind: 'generated', credit: 'AtomsH4' },
});

describe('recommendation type configuration', () => {
  it('keeps semantic categories separate from presentation types', () => {
    expect(recommendationCategoryValues).toEqual(['music', 'book', 'screen']);
    expect(presentationValues).toEqual(['disc', 'book']);
    expect(recommendationCategoryConfig.screen.label).toBe('影视与动画');
  });

  it('uses a category default while allowing an explicit presentation override', () => {
    expect(resolvePresentation(item('music'))).toBe('disc');
    expect(resolvePresentation(item('book'))).toBe('book');
    expect(resolvePresentation(item('music', 'book'))).toBe('book');
  });
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
npx vitest run src/features/recommendations/recommendation-types.test.ts
```

预期：FAIL，模块 `./recommendation-types` 不存在。

- [ ] **步骤 3：实现最小类型和配置**

创建 `src/features/recommendations/recommendation-types.ts`：

```ts
export const recommendationCategoryValues = ['music', 'book', 'screen'] as const;
export const presentationValues = ['disc', 'book'] as const;

export type RecommendationCategory = (typeof recommendationCategoryValues)[number];
export type RecommendationPresentation = (typeof presentationValues)[number];

export type RecommendationCover =
  | { kind: 'generated'; credit: string }
  | {
      kind: 'licensed';
      src: string;
      sourceUrl: string;
      license: string;
      licenseUrl: string;
      credit: string;
    };

export type RecommendationItem = {
  id: string;
  title: string;
  category: RecommendationCategory;
  presentation?: RecommendationPresentation;
  creator: string;
  year: number;
  summary: string;
  externalUrl: string;
  cover: RecommendationCover;
};

type CategoryConfig = {
  label: string;
  creatorLabel: string;
  defaultPresentation: RecommendationPresentation;
};

export const recommendationCategoryConfig = {
  music: { label: '音乐', creatorLabel: '音乐人', defaultPresentation: 'disc' },
  book: { label: '书籍', creatorLabel: '作者', defaultPresentation: 'book' },
  screen: {
    label: '影视与动画',
    creatorLabel: '导演 / 主创',
    defaultPresentation: 'disc',
  },
} satisfies Record<RecommendationCategory, CategoryConfig>;

export const resolvePresentation = (
  item: Pick<RecommendationItem, 'category' | 'presentation'>,
): RecommendationPresentation =>
  item.presentation ?? recommendationCategoryConfig[item.category].defaultPresentation;
```

- [ ] **步骤 4：为 recommendations schema 编写失败测试**

在 `src/content.config.test.ts` 追加：

```ts
const recommendationSchema = collections.recommendations.schema as {
  safeParse: (input: unknown) => { success: boolean };
};

const validRecommendation = {
  title: 'Recommendation',
  category: 'music',
  creator: 'Artist',
  year: 2026,
  recommendDate: '2026-09-18',
  summary: 'A concise recommendation.',
  externalUrl: 'https://example.com/recommendation',
  featured: false,
  draft: false,
  cover: { kind: 'generated', credit: 'AtomsH4' },
};

describe('recommendations content schema', () => {
  it('accepts generated covers without fake external license fields', () => {
    expect(recommendationSchema.safeParse(validRecommendation).success).toBe(true);
  });

  it('requires complete attribution for licensed covers', () => {
    const result = recommendationSchema.safeParse({
      ...validRecommendation,
      cover: {
        kind: 'licensed',
        src: '/media/recommendations/example.webp',
        sourceUrl: 'https://example.com/source',
        license: 'CC BY 4.0',
        credit: 'Example Author',
      },
    });

    expect(result.success).toBe(false);
  });

  it('rejects unknown categories, presentations, fields and non-HTTPS links', () => {
    expect(
      recommendationSchema.safeParse({
        ...validRecommendation,
        category: 'game',
        presentation: 'case',
        externalUrl: 'http://example.com',
        typo: true,
      }).success,
    ).toBe(false);
  });
});
```

- [ ] **步骤 5：运行 schema 测试并确认失败**

运行：

```bash
npx vitest run src/content.config.test.ts src/features/recommendations/recommendation-types.test.ts
```

预期：FAIL，`collections.recommendations` 不存在。

- [ ] **步骤 6：实现严格 schema**

在 `src/content.config.ts` 中导入枚举并增加：

```ts
import {
  presentationValues,
  recommendationCategoryValues,
} from './features/recommendations/recommendation-types';

const httpsUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith('https://'), '必须使用 HTTPS URL');

const coverSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('generated'),
    credit: z.string().min(1),
  }).strict(),
  z.object({
    kind: z.literal('licensed'),
    src: z.string().regex(/^\/media\/recommendations\/[a-z0-9-]+\.(?:webp|svg)$/),
    sourceUrl: httpsUrl,
    license: z.string().min(1),
    licenseUrl: httpsUrl,
    credit: z.string().min(1),
  }).strict(),
]);

const recommendationSchema = z.object({
  title: z.string().min(1),
  category: z.enum(recommendationCategoryValues),
  presentation: z.enum(presentationValues).optional(),
  creator: z.string().min(1),
  year: z.number().int().min(1800).max(2100),
  recommendDate: z.coerce.date(),
  summary: z.string().min(1),
  externalUrl: httpsUrl,
  featured: z.boolean().default(false),
  draft: z.boolean().default(false),
  cover: coverSchema,
}).strict();
```

在 `collections` 中增加：

```ts
recommendations: defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/recommendations' }),
  schema: recommendationSchema,
}),
```

- [ ] **步骤 7：运行测试验证通过**

运行：

```bash
npx vitest run src/content.config.test.ts src/features/recommendations/recommendation-types.test.ts
```

预期：PASS。

- [ ] **步骤 8：Commit**

```bash
git add src/content.config.ts src/content.config.test.ts src/features/recommendations/recommendation-types.ts src/features/recommendations/recommendation-types.test.ts
git commit -m "feat: define recommendation content contract"
```

---

### 任务 3：实现内容排序、规范化和导航纯函数

**文件：**
- 创建：`src/features/recommendations/recommendation-content.ts`
- 创建：`src/features/recommendations/recommendation-content.test.ts`
- 创建：`src/features/recommendations/recommendation-navigation.ts`
- 创建：`src/features/recommendations/recommendation-navigation.test.ts`

- [ ] **步骤 1：编写内容查询的失败测试**

创建 `src/features/recommendations/recommendation-content.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import {
  getFeaturedRecommendations,
  getPublishedRecommendations,
  toRecommendationItem,
} from './recommendation-content';

const entries = [
  {
    id: 'older',
    data: {
      title: 'Older', category: 'book' as const, creator: 'Author', year: 2020,
      recommendDate: new Date('2026-09-01'), summary: 'Older summary',
      externalUrl: 'https://example.com/older', featured: true, draft: false,
      cover: { kind: 'generated' as const, credit: 'AtomsH4' },
    },
  },
  {
    id: 'draft',
    data: {
      title: 'Draft', category: 'music' as const, creator: 'Artist', year: 2021,
      recommendDate: new Date('2026-09-18'), summary: 'Draft summary',
      externalUrl: 'https://example.com/draft', featured: true, draft: true,
      cover: { kind: 'generated' as const, credit: 'AtomsH4' },
    },
  },
  {
    id: 'newer',
    data: {
      title: 'Newer', category: 'screen' as const, creator: 'Director', year: 2022,
      recommendDate: new Date('2026-09-17'), summary: 'Newer summary',
      externalUrl: 'https://example.com/newer', featured: false, draft: false,
      cover: { kind: 'generated' as const, credit: 'AtomsH4' },
    },
  },
];

describe('recommendation content helpers', () => {
  it('filters drafts and sorts descending by recommendation date', () => {
    expect(getPublishedRecommendations(entries).map((entry) => entry.id)).toEqual([
      'newer',
      'older',
    ]);
  });

  it('limits homepage selections to published featured entries', () => {
    expect(getFeaturedRecommendations(entries, 3).map((entry) => entry.id)).toEqual([
      'older',
    ]);
  });

  it('normalizes dates away and resolves the default presentation', () => {
    expect(toRecommendationItem(entries[0], '/Atoms-H.github.io/')).toMatchObject({
      id: 'older',
      presentation: 'book',
      cover: { kind: 'generated' },
    });
  });
});
```

- [ ] **步骤 2：编写筛选、深链与循环切换的失败测试**

创建 `src/features/recommendations/recommendation-navigation.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import type { RecommendationItem } from './recommendation-types';
import {
  filterRecommendationItems,
  getAdjacentRecommendationId,
  getInitialRecommendationId,
} from './recommendation-navigation';

const items = ['music', 'book', 'screen'].map((category, index) => ({
  id: `item-${index + 1}`,
  title: `Item ${index + 1}`,
  category,
  presentation: category === 'book' ? 'book' : 'disc',
  creator: 'Creator',
  year: 2026,
  summary: 'Summary',
  externalUrl: `https://example.com/${index + 1}`,
  cover: { kind: 'generated', credit: 'AtomsH4' },
})) as RecommendationItem[];

describe('recommendation navigation', () => {
  it('filters by semantic category', () => {
    expect(filterRecommendationItems(items, 'book').map((item) => item.id)).toEqual([
      'item-2',
    ]);
  });

  it('uses a valid hash and falls back to the first item for an invalid hash', () => {
    expect(getInitialRecommendationId(items, '#item-2')).toBe('item-2');
    expect(getInitialRecommendationId(items, '#missing')).toBe('item-1');
  });

  it('wraps in both directions and disables navigation for a single item', () => {
    expect(getAdjacentRecommendationId(items, 'item-3', 1)).toBe('item-1');
    expect(getAdjacentRecommendationId(items, 'item-1', -1)).toBe('item-3');
    expect(getAdjacentRecommendationId(items.slice(0, 1), 'item-1', 1)).toBeNull();
  });
});
```

- [ ] **步骤 3：运行测试并确认失败**

运行：

```bash
npx vitest run src/features/recommendations/recommendation-content.test.ts src/features/recommendations/recommendation-navigation.test.ts
```

预期：FAIL，两个实现模块不存在。

- [ ] **步骤 4：实现内容帮助函数**

创建 `src/features/recommendations/recommendation-content.ts`，使用以下公开签名：

```ts
import { joinBasePath } from '../../lib/site-path';
import { resolvePresentation, type RecommendationItem } from './recommendation-types';

export type RecommendationEntry = {
  id: string;
  data: Omit<RecommendationItem, 'id' | 'presentation'> & {
    presentation?: RecommendationItem['presentation'];
    recommendDate: Date;
    featured: boolean;
    draft: boolean;
  };
};

export const getPublishedRecommendations = <T extends RecommendationEntry>(
  entries: T[],
): T[] => entries
  .filter((entry) => !entry.data.draft)
  .sort((left, right) =>
    right.data.recommendDate.getTime() - left.data.recommendDate.getTime());

export const getFeaturedRecommendations = <T extends RecommendationEntry>(
  entries: T[],
  limit = 3,
): T[] => getPublishedRecommendations(entries)
  .filter((entry) => entry.data.featured)
  .slice(0, limit);

export const toRecommendationItem = (
  entry: RecommendationEntry,
  basePath: string,
): RecommendationItem => {
  const item: RecommendationItem = {
    id: entry.id,
    title: entry.data.title,
    category: entry.data.category,
    presentation: entry.data.presentation,
    creator: entry.data.creator,
    year: entry.data.year,
    summary: entry.data.summary,
    externalUrl: entry.data.externalUrl,
    cover: entry.data.cover.kind === 'licensed'
      ? { ...entry.data.cover, src: joinBasePath(basePath, entry.data.cover.src) }
      : entry.data.cover,
  };

  return { ...item, presentation: resolvePresentation(item) };
};
```

- [ ] **步骤 5：实现导航纯函数**

创建 `src/features/recommendations/recommendation-navigation.ts`：

```ts
import type { RecommendationCategory, RecommendationItem } from './recommendation-types';

export type RecommendationFilter = 'all' | RecommendationCategory;

export const filterRecommendationItems = (
  items: RecommendationItem[],
  filter: RecommendationFilter,
): RecommendationItem[] =>
  filter === 'all' ? items : items.filter((item) => item.category === filter);

export const getInitialRecommendationId = (
  items: RecommendationItem[],
  hash: string,
): string | null => {
  const candidate = decodeURIComponent(hash.replace(/^#/, ''));
  return items.find((item) => item.id === candidate)?.id ?? items[0]?.id ?? null;
};

export const getAdjacentRecommendationId = (
  items: RecommendationItem[],
  activeId: string | null,
  direction: -1 | 1,
): string | null => {
  if (items.length < 2) return null;
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === activeId));
  return items[(currentIndex + direction + items.length) % items.length].id;
};
```

- [ ] **步骤 6：运行测试验证通过**

运行：

```bash
npx vitest run src/features/recommendations/recommendation-content.test.ts src/features/recommendations/recommendation-navigation.test.ts
```

预期：PASS。

- [ ] **步骤 7：Commit**

```bash
git add src/features/recommendations/recommendation-content.ts src/features/recommendations/recommendation-content.test.ts src/features/recommendations/recommendation-navigation.ts src/features/recommendations/recommendation-navigation.test.ts
git commit -m "feat: add recommendation content helpers"
```

---

### 任务 4：审计封面并录入十一项内容

**文件：**
- 创建：`docs/recommendation-cover-sources.md`
- 创建：`src/data/recommendations/wo-biao-shi-li-jie.md`
- 创建：`src/data/recommendations/leave-the-door-open.md`
- 创建：`src/data/recommendations/gei-zi-ji-de-qing-shu.md`
- 创建：`src/data/recommendations/back-in-black.md`
- 创建：`src/data/recommendations/the-moon-and-sixpence.md`
- 创建：`src/data/recommendations/flowers-for-algernon.md`
- 创建：`src/data/recommendations/to-live.md`
- 创建：`src/data/recommendations/hospital-playlist.md`
- 创建：`src/data/recommendations/dear-you.md`
- 创建：`src/data/recommendations/neon-genesis-evangelion.md`
- 创建：`src/data/recommendations/flipped.md`
- 创建：`public/media/recommendations/back-in-black.svg`

- [ ] **步骤 1：创建逐项封面审计文档**

在 `docs/recommendation-cover-sources.md` 记录以下确定状态：

```markdown
# 推荐封面来源审计

| Slug | 结果 | 来源与许可决定 |
| --- | --- | --- |
| wo-biao-shi-li-jie | generated | 官方发行页面未提供可复用许可，使用原创排版封面。 |
| leave-the-door-open | generated | 官方发行页面未提供可复用许可，使用原创排版封面。 |
| gei-zi-ji-de-qing-shu | generated | 官方发行页面未提供可复用许可，使用原创排版封面。 |
| back-in-black | licensed | Wikimedia Commons `ACDC Back in Black cover.svg`，PD-textlogo；保留 trademark 提示，只作作品识别。 |
| the-moon-and-sixpence | generated | 虽有 1919 年公共领域扫描件，但不采用未核实的现代中文版封面，使用原创排版封面。 |
| flowers-for-algernon | generated | 现代封面无明确自由许可，使用原创排版封面。 |
| to-live | generated | 现代封面无明确自由许可，使用原创排版封面。 |
| hospital-playlist | generated | 宣传海报无明确自由许可，使用原创排版封面。 |
| dear-you | generated | 宣传海报无明确自由许可，使用原创排版封面。 |
| neon-genesis-evangelion | generated | 宣传海报与家用媒体封面无明确自由许可，使用原创排版封面。 |
| flipped | generated | 宣传海报无明确自由许可，使用原创排版封面。 |
```

在表格后记录 Back in Black 的来源页、`PD-textlogo` 许可页、作者说明和商标提示。不得把搜索结果缩略图或非自由的 fair-use 文件列为可复用素材。

- [ ] **步骤 2：下载许可可核验的矢量封面**

运行：

```bash
mkdir -p public/media/recommendations
curl --fail --location "https://commons.wikimedia.org/wiki/Special:Redirect/file/ACDC_Back_in_Black_cover.svg" --output public/media/recommendations/back-in-black.svg
```

预期：文件为 SVG 文本，不是 HTML 错误页；运行 `file public/media/recommendations/back-in-black.svg` 显示 SVG 或 XML。

- [ ] **步骤 3：按精确数据创建十一项 Markdown**

每个文件使用任务 2 的 schema。字段值按下表录入；除 Back in Black 外，`cover` 均为 `{ kind: generated, credit: AtomsH4 }`。

| Slug | category | creator | year | recommendDate | featured | externalUrl |
| --- | --- | --- | ---: | --- | --- | --- |
| wo-biao-shi-li-jie | music | 单依纯 | 2025 | 2026-09-18 | false | `https://www.youtube.com/watch?v=fwhyNzv69QQ` |
| leave-the-door-open | music | Bruno Mars、Anderson .Paak（Silk Sonic） | 2021 | 2026-09-17 | true | `https://www.youtube.com/watch?v=adLGHcj_fmA` |
| gei-zi-ji-de-qing-shu | music | 王菲 | 2000 | 2026-09-16 | false | `https://zh.wikipedia.org/wiki/%E7%B5%A6%E8%87%AA%E5%B7%B1%E7%9A%84%E6%83%85%E6%9B%B8` |
| back-in-black | music | AC/DC | 1980 | 2026-09-15 | false | `https://www.youtube.com/watch?v=pAgnJDJN4VA` |
| the-moon-and-sixpence | book | 威廉·萨默塞特·毛姆 | 1919 | 2026-09-14 | false | `https://standardebooks.org/ebooks/w-somerset-maugham/the-moon-and-sixpence` |
| flowers-for-algernon | book | 丹尼尔·凯斯 | 1966 | 2026-09-13 | true | `https://en.wikipedia.org/wiki/Flowers_for_Algernon` |
| to-live | book | 余华 | 1992 | 2026-09-12 | false | `https://zh.wikipedia.org/wiki/%E6%B4%BB%E7%9D%80_(%E5%B0%8F%E8%AF%B4)` |
| hospital-playlist | screen | 申沅昊 | 2020 | 2026-09-11 | false | `https://www.netflix.com/title/81239224` |
| dear-you | screen | 蓝鸿春 | 2026 | 2026-09-10 | false | `https://www.1905.com/mdb/film/2259123/` |
| neon-genesis-evangelion | screen | 庵野秀明 | 1995 | 2026-09-09 | false | `https://www.netflix.com/title/81033445` |
| flipped | screen | Rob Reiner | 2010 | 2026-09-08 | true | `https://en.wikipedia.org/wiki/Flipped_(2010_film)` |

使用以下十一条 `summary`，不要复制第三方评论：

```text
我表示理解：克制而有张力的演唱，把理解背后的失落留在余韵里。
Leave the Door Open：复古灵魂乐的质感、从容的节奏与丝滑和声几乎无可挑剔。
给自己的情书：清醒而温柔的自我对话，在孤独里保留一份体面。
Back in Black：干净直接的吉他 riff 和毫不拖泥带水的节奏，至今依然有冲击力。
月亮与六便士：在世俗安稳与艺术执念之间，追问一个人愿意为自由付出什么。
献给阿尔吉侬的花束：以智力的获得与失去照见尊严、爱和被理解的渴望。
活着：在不断失去之中写出普通人顽强而沉默的生命力。
机智的医生生活：把友情、职业与日常琐碎拍得温暖克制，是可以反复回去的生活剧。
给阿嬷的情书：借一封跨越岁月的家书，连接迁徙、守候与潮汕人的故乡记忆。
新世纪福音战士：把少年成长、孤独和自我认同藏进宏大的机甲末世外壳。
怦然心动：从两种视角重新观看心动，也重新认识偏见、家庭与成长。
```

Back in Black 的封面对象必须是：

```yaml
cover:
  kind: licensed
  src: /media/recommendations/back-in-black.svg
  sourceUrl: https://commons.wikimedia.org/wiki/File:ACDC_Back_in_Black_cover.svg
  license: Public domain — PD-textlogo; trademark notice applies
  licenseUrl: https://commons.wikimedia.org/wiki/Template:PD-textlogo
  credit: Angus Young（概念）；Wikimedia Commons SVG 贡献者
```

- [ ] **步骤 4：运行 schema 和生产构建验证内容**

运行：

```bash
npx vitest run src/content.config.test.ts src/features/recommendations/recommendation-content.test.ts
npm run build
```

预期：PASS；构建日志识别 `recommendations` 集合，没有无效 URL、未知字段或日期错误。

- [ ] **步骤 5：Commit**

```bash
git add docs/recommendation-cover-sources.md src/data/recommendations public/media/recommendations/back-in-black.svg
git commit -m "content: add initial recommendations"
```

---

### 任务 5：构建可测试的二维体验和状态所有权

**文件：**
- 创建：`src/features/recommendations/useWebGLAvailability.ts`
- 创建：`src/features/recommendations/useWebGLAvailability.test.tsx`
- 创建：`src/features/recommendations/RecommendationCover.tsx`
- 创建：`src/features/recommendations/RecommendationFallback.tsx`
- 创建：`src/features/recommendations/RecommendationExperience.tsx`
- 创建：`src/features/recommendations/RecommendationExperience.test.tsx`
- 创建：`src/features/recommendations/RecommendationExperience.module.css`
- 创建：`src/features/recommendations/RecommendationStage.tsx`

- [ ] **步骤 1：编写 WebGL 能力检测的失败测试**

创建 `src/features/recommendations/useWebGLAvailability.test.tsx`：

```tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useWebGLAvailability } from './useWebGLAvailability';

describe('useWebGLAvailability', () => {
  afterEach(() => vi.restoreAllMocks());

  it('reports unavailable when neither WebGL context can be created', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const { result } = renderHook(() => useWebGLAvailability());
    await waitFor(() => expect(result.current.status).toBe('unavailable'));
  });

  it('can be moved to failed after a runtime context error', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as WebGL2RenderingContext);
    const { result } = renderHook(() => useWebGLAvailability());
    await waitFor(() => expect(result.current.status).toBe('available'));
    act(() => result.current.markFailed());
    await waitFor(() => expect(result.current.status).toBe('failed'));
  });
});
```

- [ ] **步骤 2：编写体验组件的失败测试**

创建 `src/features/recommendations/RecommendationExperience.test.tsx`，mock `RecommendationStage`，覆盖：

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecommendationExperience } from './RecommendationExperience';
import type { RecommendationItem } from './recommendation-types';

vi.mock('./RecommendationStage', () => ({
  RecommendationStage: ({ activeId }: { activeId: string }) => (
    <div data-testid="recommendation-stage" data-active-id={activeId} />
  ),
}));

const webGLState = vi.hoisted(() => ({ status: 'available' }));
vi.mock('./useWebGLAvailability', () => ({
  useWebGLAvailability: () => ({
    status: webGLState.status,
    markFailed: vi.fn(),
  }),
}));

const mockWebGLStatus = (
  status: 'checking' | 'available' | 'unavailable' | 'failed',
) => {
  webGLState.status = status;
};

const items: RecommendationItem[] = [
  {
    id: 'music-item', title: 'Music title', category: 'music',
    presentation: 'disc', creator: 'Artist', year: 2026, summary: 'Music summary',
    externalUrl: 'https://example.com/music',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
  {
    id: 'book-item', title: 'Book title', category: 'book',
    presentation: 'book', creator: 'Author', year: 2025, summary: 'Book summary',
    externalUrl: 'https://example.com/book',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
  {
    id: 'screen-item', title: 'Screen title', category: 'screen',
    presentation: 'disc', creator: 'Director', year: 2024, summary: 'Screen summary',
    externalUrl: 'https://example.com/screen',
    cover: { kind: 'generated', credit: 'AtomsH4' },
  },
];

beforeEach(() => {
  webGLState.status = 'available';
  window.location.hash = '';
});

it('filters categories and keeps one explicit active item', async () => {
  const user = userEvent.setup();
  render(<RecommendationExperience items={items} mode="catalog" />);
  await user.click(screen.getByRole('button', { name: '书籍' }));
  expect(screen.getByRole('heading', { name: 'Book title' })).toBeVisible();
  expect(screen.queryByText('Music title')).not.toBeInTheDocument();
});

it('wraps next and previous navigation', async () => {
  const user = userEvent.setup();
  render(<RecommendationExperience items={items} mode="catalog" />);
  await user.click(screen.getByRole('button', { name: '上一项' }));
  expect(screen.getByRole('heading', { name: 'Screen title' })).toBeVisible();
  await user.click(screen.getByRole('button', { name: '下一项' }));
  expect(screen.getByRole('heading', { name: 'Music title' })).toBeVisible();
});

it('uses a valid location hash as the initial selection', async () => {
  window.location.hash = '#book-item';
  render(<RecommendationExperience items={items} mode="catalog" />);
  expect(await screen.findByRole('heading', { name: 'Book title' })).toBeVisible();
});

it('renders the two-dimensional fallback when WebGL is unavailable', () => {
  mockWebGLStatus('unavailable');
  render(<RecommendationExperience items={items} mode="catalog" />);
  expect(screen.getByText('当前设备使用二维推荐视图。')).toBeVisible();
  expect(screen.queryByTestId('recommendation-stage')).not.toBeInTheDocument();
});

it('keeps featured mode narrow', () => {
  render(
    <RecommendationExperience
      items={items.slice(0, 3)}
      mode="featured"
      allHref="/Atoms-H.github.io/recommendations/"
    />,
  );
  expect(screen.queryByRole('button', { name: '全部' })).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: '查看全部推荐' })).toBeVisible();
});

it('shows a stable empty state when no recommendations exist', () => {
  render(<RecommendationExperience items={[]} mode="catalog" />);
  expect(screen.getByText('推荐正在整理中。')).toBeVisible();
});
```

测试夹具必须包含 music、book、screen 三项，使用任务 2 的 `RecommendationItem` 类型。

- [ ] **步骤 3：运行测试并确认失败**

运行：

```bash
npx vitest run src/features/recommendations/useWebGLAvailability.test.tsx src/features/recommendations/RecommendationExperience.test.tsx
```

预期：FAIL，组件和 hook 尚不存在。

- [ ] **步骤 4：实现 WebGL 能力检测**

`useWebGLAvailability.ts` 在 `useEffect` 中创建临时 canvas，依次尝试 `webgl2` 和 `webgl`，服务端初始状态为 `checking`；返回：

```ts
type WebGLStatus = 'checking' | 'available' | 'unavailable' | 'failed';

export const useWebGLAvailability = (): {
  status: WebGLStatus;
  markFailed: () => void;
};
```

`markFailed` 只把状态设为 `failed`，不尝试全局重建上下文。

- [ ] **步骤 5：实现封面、降级视图和体验组件**

`RecommendationExperience` 使用判别联合 props：

```ts
type Props =
  | { mode: 'catalog'; items: RecommendationItem[] }
  | { mode: 'featured'; items: RecommendationItem[]; allHref: string };
```

同时创建窄契约版 `RecommendationStage.tsx`，导出与任务 7 相同的 props 类型，并暂时返回：

```tsx
export type RecommendationStageProps = {
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
  onFailure: () => void;
};

export const RecommendationStage = ({ activeId }: RecommendationStageProps) => (
  <div data-testid="recommendation-stage" data-active-id={activeId} />
);
```

这样 Experience 在任务 5 可独立测试和提交，任务 7 只替换舞台内部实现，不改变调用方。

实现要求：

```tsx
const [filter, setFilter] = useState<RecommendationFilter>('all');
const filteredItems = useMemo(
  () => filterRecommendationItems(items, filter),
  [items, filter],
);
const [activeId, setActiveId] = useState(items[0]?.id ?? null);

useEffect(() => {
  if (mode === 'catalog') {
    setActiveId(getInitialRecommendationId(items, window.location.hash));
  }
}, [items, mode]);

useEffect(() => {
  if (!filteredItems.some((item) => item.id === activeId)) {
    setActiveId(filteredItems[0]?.id ?? null);
  }
}, [activeId, filteredItems]);
```

- `RecommendationCover` 对 `licensed` 渲染带 `alt` 的 `<img>`，`onError` 后切到标题/创作者/年份排版；对 `generated` 直接排版。
- `RecommendationFallback` 接收 `items`、`activeId`、`onSelect`，使用按钮化封面列表，不拥有筛选状态。
- `RecommendationExperience` 始终渲染当前条目的 HTML 标题、创作者、年份、推荐语、来源和外部链接。
- `items` 为空时只渲染“推荐正在整理中。”，不挂载 Stage 或导航按钮。
- `checking`、`unavailable`、`failed` 都先显示二维视图；只有 `available` 挂载 Stage。
- `catalog` 显示四个筛选按钮、上一项和下一项；`featured` 不显示筛选，只显示 `allHref`。
- 容器处理 `ArrowLeft`、`ArrowRight`，但输入焦点位于普通链接时不阻止浏览器默认行为。
- 文件同时导出命名组件和默认组件：`export const RecommendationExperience ...` 与 `export default RecommendationExperience`，保持测试和 Astro 导入一致。

- [ ] **步骤 6：添加最小样式以保证测试和无 JS 状态可读**

`RecommendationExperience.module.css` 至少定义：

```css
.experience { position: relative; color: #0b0b0b; }
.toolbar { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.toolbar button { border: 0; border-bottom: 1px solid transparent; background: none; }
.toolbar button[aria-pressed='true'] { border-color: currentColor; }
.metadata { position: relative; z-index: 2; max-width: 24rem; }
.stage { min-height: clamp(28rem, 68vh, 50rem); }
.fallbackList { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }
.generatedCover { display: grid; aspect-ratio: 1; place-content: space-between; padding: 1rem; color: #fff; background: #111; }
@media (max-width: 760px) { .fallbackList { grid-template-columns: 1fr; } }
```

- [ ] **步骤 7：运行组件测试验证通过**

运行：

```bash
npx vitest run src/features/recommendations/useWebGLAvailability.test.tsx src/features/recommendations/RecommendationExperience.test.tsx
```

预期：PASS。

- [ ] **步骤 8：Commit**

```bash
git add src/features/recommendations/useWebGLAvailability.ts src/features/recommendations/useWebGLAvailability.test.tsx src/features/recommendations/RecommendationCover.tsx src/features/recommendations/RecommendationFallback.tsx src/features/recommendations/RecommendationExperience.tsx src/features/recommendations/RecommendationExperience.test.tsx src/features/recommendations/RecommendationExperience.module.css src/features/recommendations/RecommendationStage.tsx
git commit -m "feat: add recommendation browsing experience"
```

---

### 任务 6：实现封面纹理、CD、书籍和模型注册表

**文件：**
- 创建：`src/features/recommendations/create-cover-texture.ts`
- 创建：`src/features/recommendations/create-cover-texture.test.ts`
- 创建：`src/features/recommendations/models/DiscModel.tsx`
- 创建：`src/features/recommendations/models/BookModel.tsx`
- 创建：`src/features/recommendations/model-registry.tsx`
- 创建：`src/features/recommendations/model-registry.test.tsx`

- [ ] **步骤 1：编写生成封面纹理 URL 的失败测试**

创建 `create-cover-texture.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import { createGeneratedCoverDataUrl } from './create-cover-texture';

describe('createGeneratedCoverDataUrl', () => {
  it('creates a self-contained SVG data URL and escapes user-visible text', () => {
    const result = createGeneratedCoverDataUrl({
      title: 'A < B & C', creator: 'Creator', year: 2026,
    });
    const decoded = decodeURIComponent(result.split(',')[1]);
    expect(result).toMatch(/^data:image\/svg\+xml/);
    expect(decoded).toContain('A &lt; B &amp; C');
    expect(decoded).toContain('Creator');
  });
});
```

- [ ] **步骤 2：编写注册表覆盖的失败测试**

创建 `model-registry.test.tsx`：

```tsx
import { describe, expect, it } from 'vitest';

import { presentationValues } from './recommendation-types';
import { recommendationModelRegistry } from './model-registry';

describe('recommendationModelRegistry', () => {
  it('registers every supported presentation exactly once', () => {
    expect(Object.keys(recommendationModelRegistry).sort()).toEqual(
      [...presentationValues].sort(),
    );
  });
});
```

- [ ] **步骤 3：运行测试并确认失败**

运行：

```bash
npx vitest run src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/model-registry.test.tsx
```

预期：FAIL，实现文件不存在。

- [ ] **步骤 4：实现安全的原创封面 SVG 和纹理 hook**

`createGeneratedCoverDataUrl` 必须 XML 转义标题与创作者，并输出 1024×1024、黑底白字、只使用系统字体的 SVG data URL。导出：

```ts
export const createGeneratedCoverDataUrl = (input: {
  title: string;
  creator: string;
  year: number;
}): string;

export const useRecommendationTexture = (
  item: RecommendationItem,
): THREE.Texture | null;
```

hook 行为：

1. `generated` 直接加载 data URL。
2. `licensed` 先加载本地 `src`。
3. 授权图片加载失败时改为加载同一条目的生成 data URL，不让错误冒泡毁掉整个 Canvas。
4. 设置 `texture.colorSpace = THREE.SRGBColorSpace`。
5. effect 清理时取消过期回调并释放不再使用的纹理。

- [ ] **步骤 5：实现两个窄模型组件**

两者共享以下 props，不读取分类配置、路由或筛选状态：

```ts
export type RecommendationModelProps = {
  item: RecommendationItem;
  active: boolean;
  onSelect: () => void;
};
```

`DiscModel.tsx` 使用：

```tsx
<group onClick={(event) => { event.stopPropagation(); onSelect(); }}>
  <mesh position={[0, 0, 0.05]}>
    <ringGeometry args={[0.34, 2, 96]} />
    <meshStandardMaterial map={texture} metalness={0.15} roughness={0.3} />
  </mesh>
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <cylinderGeometry args={[2, 2, 0.1, 96, 1, true]} />
    <meshPhysicalMaterial metalness={0.85} roughness={0.18} iridescence={0.55} />
  </mesh>
  <mesh position={[0, 0, -0.05]} rotation={[0, Math.PI, 0]}>
    <ringGeometry args={[0.34, 2, 96]} />
    <meshPhysicalMaterial metalness={0.9} roughness={0.2} iridescence={0.65} />
  </mesh>
</group>
```

补充内孔壁圆柱，并确保所有 mesh 使用 `castShadow`/`receiveShadow` 的最小必要组合。

`BookModel.tsx` 使用一个纸张 `RoundedBox`、前后两块薄封面和一个略高于前封面的纹理平面；书保持闭合，不增加铰链、骨骼或翻页状态。

- [ ] **步骤 6：实现显式模型注册表**

```tsx
export const recommendationModelRegistry = {
  disc: DiscModel,
  book: BookModel,
} satisfies Record<RecommendationPresentation, ComponentType<RecommendationModelProps>>;
```

只允许 Stage 通过这个对象选择模型。

- [ ] **步骤 7：运行测试和类型检查**

运行：

```bash
npx vitest run src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/model-registry.test.tsx
npm run check
```

预期：PASS；没有 Three.js JSX 或材质属性类型错误。

- [ ] **步骤 8：Commit**

```bash
git add src/features/recommendations/create-cover-texture.ts src/features/recommendations/create-cover-texture.test.ts src/features/recommendations/models src/features/recommendations/model-registry.tsx src/features/recommendations/model-registry.test.tsx
git commit -m "feat: add recommendation 3d models"
```

---

### 任务 7：实现单画布舞台和响应式构图

**文件：**
- 创建：`src/features/recommendations/stage-layout.ts`
- 创建：`src/features/recommendations/stage-layout.test.ts`
- 修改：`src/features/recommendations/RecommendationStage.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.tsx`

- [ ] **步骤 1：编写舞台槽位失败测试**

创建 `stage-layout.test.ts`：

```ts
import { describe, expect, it } from 'vitest';

import { getStageItems } from './stage-layout';

describe('getStageItems', () => {
  it('centers the active item and exposes two neighbors on desktop', () => {
    const result = getStageItems(['a', 'b', 'c', 'd', 'e', 'f'], 'c', false);
    expect(result.map(({ id, offset }) => [id, offset])).toEqual([
      ['a', -2], ['b', -1], ['c', 0], ['d', 1], ['e', 2],
    ]);
  });

  it('shows only one neighbor on each side on compact screens', () => {
    const result = getStageItems(['a', 'b', 'c', 'd'], 'a', true);
    expect(result.map(({ id, offset }) => [id, offset])).toEqual([
      ['d', -1], ['a', 0], ['b', 1],
    ]);
  });
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
npx vitest run src/features/recommendations/stage-layout.test.ts
```

预期：FAIL，`stage-layout` 不存在。

- [ ] **步骤 3：实现纯槽位计算**

`getStageItems(ids, activeId, compact)` 使用环形索引，桌面返回 offset `-2..2`，移动端返回 `-1..1`，条目不足时不重复同一个 id。另导出固定槽位：

```ts
export const desktopSlots = {
  '-2': { position: [-4.6, -0.6, -1.4], rotation: [-0.08, 0.35, -0.22], scale: 0.62 },
  '-1': { position: [-2.35, -0.15, -0.7], rotation: [0.04, 0.2, -0.1], scale: 0.8 },
  '0': { position: [0, 0.15, 0], rotation: [-0.04, -0.12, 0.05], scale: 1 },
  '1': { position: [2.5, 0.35, -0.65], rotation: [0.08, -0.22, 0.12], scale: 0.8 },
  '2': { position: [4.85, 0.7, -1.35], rotation: [-0.05, -0.38, 0.2], scale: 0.62 },
} as const;
```

移动端槽位使用更窄的 x 坐标并放大相邻项露出比例。

- [ ] **步骤 4：实现单 Canvas 舞台**

`RecommendationStage` props：

```ts
type Props = RecommendationStageProps;
```

Canvas 固定配置：

```tsx
<Canvas
  aria-hidden="true"
  dpr={[1, 1.5]}
  frameloop="demand"
  shadows
  camera={{ position: [0, 0, 9], fov: 34 }}
  gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
  onCreated={({ gl }) => {
    gl.domElement.addEventListener('webglcontextlost', onFailure, { once: true });
  }}
>
  <ambientLight intensity={0.8} />
  <directionalLight position={[4, 6, 7]} intensity={2.2} castShadow />
  <Environment background={false}>
    <Lightformer form="rect" intensity={2.5} position={[0, 4, 5]} scale={[8, 3]} />
  </Environment>
  <ContactShadows key={activeId} frames={1} opacity={0.2} blur={2.5} resolution={256} />
  {/* staged items */}
</Canvas>
```

当前项用 `PresentationControls` 包裹，设置有限 `polar`、`azimuth`、`snap`；`reducedMotion` 时取消弹性 snap 并直接复位。非当前项只有点击选择，不可拖动。不要增加 `OrbitControls`、缩放或相机平移。

槽位切换使用 R3F `useFrame` 对 group position、rotation、scale 做阻尼插值，并在未收敛时调用 `invalidate()`；收敛后停止请求帧，保持 `frameloop="demand"`。

- [ ] **步骤 5：把舞台接入 Experience**

在 Experience 中增加两个小 hook：

- `matchMedia('(max-width: 760px)')` 得到 `compact`。
- `matchMedia('(prefers-reduced-motion: reduce)')` 得到 `reducedMotion`。

只有 WebGL `available` 且存在 `activeId` 时渲染 Stage；`onFailure` 调用 `markFailed`。容器输出 `data-reduced-motion`，便于浏览器测试验证。

- [ ] **步骤 6：运行目标测试和类型检查**

运行：

```bash
npx vitest run src/features/recommendations/stage-layout.test.ts src/features/recommendations/RecommendationExperience.test.tsx
npm run check
```

预期：PASS。

- [ ] **步骤 7：Commit**

```bash
git add src/features/recommendations/stage-layout.ts src/features/recommendations/stage-layout.test.ts src/features/recommendations/RecommendationStage.tsx src/features/recommendations/RecommendationExperience.tsx
git commit -m "feat: add interactive recommendation stage"
```

---

### 任务 8：集成专属布局、推荐路由、导航与首页精选

**文件：**
- 创建：`src/layouts/RecommendationLayout.astro`
- 创建：`src/pages/recommendations/index.astro`
- 创建：`src/components/HomeRecommendations.astro`
- 修改：`src/components/Navigation.tsx`
- 修改：`src/components/Navigation.test.tsx`
- 修改：`src/pages/index.astro`
- 修改：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：先写导航和页面失败测试**

在 `Navigation.test.tsx` 的现有测试中追加：

```ts
expect(screen.getByRole('link', { name: '推荐' })).toHaveAttribute(
  'href',
  '/Atoms-H.github.io/recommendations/',
);
```

在 `tests/e2e/site.spec.ts` 追加：

```ts
test('推荐页提供分类、首批内容和安全外链', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/recommendations/');
  await expect(page.getByRole('heading', { name: '推荐', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '音乐' })).toBeVisible();
  await expect(page.getByRole('button', { name: '书籍' })).toBeVisible();
  await expect(page.getByRole('button', { name: '影视与动画' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '我表示理解', level: 2 })).toBeVisible();
  await expect(page.getByRole('link', { name: /查看作品详情/ })).toHaveAttribute('rel', /noreferrer/);
});

test('首页精选深链到对应推荐', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/');
  const link = page.getByRole('link', { name: /查看全部推荐/ });
  await expect(link).toHaveAttribute('href', '/Atoms-H.github.io/recommendations/');
  await page.goto('/Atoms-H.github.io/recommendations/#flipped');
  await expect(page.getByRole('heading', { name: '怦然心动' })).toBeVisible();
});
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
npx vitest run src/components/Navigation.test.tsx
npx playwright test tests/e2e/site.spec.ts --grep "推荐页|首页精选"
```

预期：Vitest 因缺少“推荐”链接失败；Playwright 因推荐路由 404 或缺少标题失败。

- [ ] **步骤 3：实现专属布局**

`RecommendationLayout.astro` 复用 `SiteHeader`、`SiteFooter` 并输出 `<body class="recommendation-theme">`。在布局内使用 `<style is:global>`，只覆盖 `.recommendation-theme` 后代：

```css
.recommendation-theme {
  --poster-paper: #f7f6f1;
  --poster-ink: #090909;
  --color-page: var(--poster-paper);
  --color-text: var(--poster-ink);
  --color-muted: #4a4a4a;
  --color-accent: var(--poster-ink);
  --color-accent-deep: var(--poster-ink);
  --color-surface: transparent;
  --color-surface-strong: #fff;
  --color-border: rgb(0 0 0 / 18%);
  --color-nav-active: rgb(0 0 0 / 7%);
  color-scheme: light;
  color: var(--poster-ink);
  background: var(--poster-paper);
}
.recommendation-theme .site-header {
  border-color: rgb(0 0 0 / 18%);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}
.recommendation-theme main { width: min(100%, 96rem); margin-top: 1.5rem; }
.recommendation-theme .site-footer { color: var(--poster-ink); }
```

不要修改 `BaseLayout.astro`。

- [ ] **步骤 4：实现推荐页路由**

`src/pages/recommendations/index.astro`：

```astro
---
import { getCollection } from 'astro:content';
import RecommendationExperience from '../../features/recommendations/RecommendationExperience';
import {
  getPublishedRecommendations,
  toRecommendationItem,
} from '../../features/recommendations/recommendation-content';
import RecommendationLayout from '../../layouts/RecommendationLayout.astro';

const entries = getPublishedRecommendations(await getCollection('recommendations'));
const items = entries.map((entry) =>
  toRecommendationItem(entry, import.meta.env.BASE_URL));
---

<RecommendationLayout title="推荐 | AtomsH4">
  <header class="recommendation-title">
    <p>Selected music, books & screens</p>
    <h1>推荐</h1>
  </header>
  <RecommendationExperience items={items} mode="catalog" client:load />
</RecommendationLayout>
```

页面样式放在该 Astro 文件的 scoped `<style>`，只负责标题与外层留白。

- [ ] **步骤 5：实现首页精选边界组件**

`HomeRecommendations.astro` 接收规范化后的三个 items，计算基础路径，并渲染：

```astro
<section class="home-recommendations" aria-labelledby="home-recommendations-title">
  <div class="section-heading">
    <p>Current rotation</p>
    <h2 id="home-recommendations-title">近期推荐</h2>
  </div>
  <RecommendationExperience
    items={items}
    mode="featured"
    allHref={joinBasePath(import.meta.env.BASE_URL, '/recommendations/')}
    client:visible
  />
</section>
```

首页组件只提供白底、黑色细边框和必要间距，不复制 Experience 内部布局。

- [ ] **步骤 6：修改首页数据流**

在 `src/pages/index.astro` 的并行 collection 加载中加入 `recommendations`；使用 `getFeaturedRecommendations(..., 3)` 和 `toRecommendationItem`；在精选项目之后、关于入口之前渲染 `HomeRecommendations`。

- [ ] **步骤 7：增加导航项**

在 `Navigation.tsx` 的 `items` 中，于“项目”和“关于”之间增加：

```ts
{ label: '推荐', pathname: '/recommendations/' },
```

- [ ] **步骤 8：运行目标测试验证通过**

运行：

```bash
npx vitest run src/components/Navigation.test.tsx
npm run build
npx playwright test tests/e2e/site.spec.ts --grep "推荐页|首页精选"
```

预期：PASS；构建产物包含 `dist/recommendations/index.html`，基础路径正确。

- [ ] **步骤 9：Commit**

```bash
git add src/layouts/RecommendationLayout.astro src/pages/recommendations/index.astro src/components/HomeRecommendations.astro src/components/Navigation.tsx src/components/Navigation.test.tsx src/pages/index.astro tests/e2e/site.spec.ts
git commit -m "feat: add recommendations page and homepage feature"
```

---

### 任务 9：补齐降级、移动端、键盘和运行时验证

**文件：**
- 修改：`src/features/recommendations/RecommendationExperience.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`
- 修改：`src/features/recommendations/RecommendationStage.tsx`
- 修改：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：编写浏览器级失败测试**

追加：

```ts
test('推荐页支持键盘循环切换和分类筛选', async ({ page }) => {
  await page.goto('/Atoms-H.github.io/recommendations/#wo-biao-shi-li-jie');
  await page.locator('[data-recommendation-experience]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('heading', { name: '怦然心动' })).toBeVisible();
  await page.getByRole('button', { name: '书籍' }).click();
  await expect(page.getByRole('heading', { name: '月亮与六便士' })).toBeVisible();
});

test('WebGL 不可用时保留二维推荐', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = () => null;
  });
  await page.goto('/Atoms-H.github.io/recommendations/');
  await expect(page.getByText('当前设备使用二维推荐视图。')).toBeVisible();
  await expect(page.getByRole('link', { name: /查看作品详情/ })).toBeVisible();
});

test('移动端推荐页不阻塞页面滚动并遵循减少动态效果', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/Atoms-H.github.io/recommendations/');
  await expect(page.locator('[data-recommendation-experience]')).toHaveAttribute(
    'data-reduced-motion',
    'true',
  );
  await expect(page.locator('body')).not.toHaveCSS('overflow-x', 'scroll');
  await page.mouse.wheel(0, 600);
  await expect(page.getByText(/图片来源|原创排版/).first()).toBeVisible();
});
```

- [ ] **步骤 2：运行新增测试并确认至少一个失败**

运行：

```bash
npx playwright test tests/e2e/site.spec.ts --grep "键盘循环|WebGL 不可用|移动端推荐页"
```

预期：FAIL，直到数据属性、降级提示和移动端细节补齐。

- [ ] **步骤 3：补齐交互与样式边界**

实现以下可观察契约：

- Experience 根节点 `tabIndex={0}`、`data-recommendation-experience` 和 `data-reduced-motion`。
- 活跃标题使用稳定的 `h2`；页面自身只有一个 `h1`“推荐”。测试选择器若出现层级冲突，以 `heading level: 2` 收紧。
- 状态区域使用 `aria-live="polite"`，只在作品切换后更新“当前推荐：标题”。
- 外部链接始终含 `target="_blank" rel="noreferrer"` 和“在新标签页打开”的隐藏文本。
- `touch-action: pan-y` 放在 Canvas 容器；PresentationControls 只在当前模型上接收拖动。
- 页面和舞台使用 `overflow: clip`，不能造成 body 横向滚动。
- 授权封面显示来源、许可与署名链接；生成封面显示“原创排版：AtomsH4”。
- WebGL `failed` 和 `unavailable` 使用相同二维视图，但 `failed` 的提示说明 3D 初始化失败。

- [ ] **步骤 4：执行一次真实拖动冒烟检查**

在 Playwright 测试中定位可见 Canvas，使用其 `boundingBox()` 在中心执行 `mouse.down()`、水平移动 80px、垂直移动 30px、`mouse.up()`；断言页面仍有 Canvas 且当前标题未意外切换。此测试验证事件链不抛错，不对 WebGL 像素做脆弱快照。

- [ ] **步骤 5：运行目标测试、类型检查和构建**

运行：

```bash
npx vitest run src/features/recommendations src/components/Navigation.test.tsx src/content.config.test.ts
npm run check
npm run build
npx playwright test tests/e2e/site.spec.ts --grep "推荐"
```

预期：全部 PASS。

- [ ] **步骤 6：Commit**

```bash
git add src/features/recommendations tests/e2e/site.spec.ts
git commit -m "test: harden recommendation interactions"
```

---

### 任务 10：全量验证、视觉检查和交付自审

**文件：**
- 可能修改：仅限前述文件中验证发现的缺陷

- [ ] **步骤 1：运行格式和差异检查**

运行：

```bash
git diff --check
git status --short
```

预期：没有空白错误；用户原有未跟踪文件仍未被加入提交。

- [ ] **步骤 2：运行完整单元测试和生产构建**

运行：

```bash
npm test
npm run build
```

预期：全部 PASS，Astro 内容集合和 React/Three 类型检查无错误。

- [ ] **步骤 3：运行完整浏览器测试**

运行：

```bash
npm run test:e2e
```

预期：现有博客、随笔、项目、404、移动端导航和新增推荐测试全部 PASS。

- [ ] **步骤 4：检查静态产物与远程图片边界**

运行：

```bash
test -f dist/recommendations/index.html
rg -n "src:\s+https?://" src/data/recommendations src/features/recommendations || true
find dist/_astro -maxdepth 1 -type f -print | sort
```

预期：推荐路由存在；除文档化的来源 URL 外，没有运行时远程封面；3D chunk 只被推荐相关页面引用，不进入普通文章页的初始 HTML。

- [ ] **步骤 5：人工视觉检查桌面与移动端**

运行：

```bash
npm run preview -- --host 127.0.0.1
```

检查：

1. 桌面端白底黑字、元数据细线、3–5 件交错物体和足够留白。
2. CD 内孔、厚度、金属反光和封面方向正确；书籍封面、书脊、纸张块方向正确。
3. 拖动当前物体有限旋转，松手复位；点击邻居切换，不支持缩放。
4. 390×844 下当前物体居中、邻居露边、页面可纵向滚动且无横向溢出。
5. 首页精选是独立白色海报区域，未改变其他首页区块。
6. 暗色系统偏好不会把推荐页强制变成暗色。

- [ ] **步骤 6：确认封面审计完整**

逐项对照十一份 Markdown 与 `docs/recommendation-cover-sources.md`：授权图片必须有本地文件、来源、许可、许可链接和署名；生成封面不得出现第三方图像 URL。

- [ ] **步骤 7：提交验证中产生的修正**

只有确实修改文件时运行：

```bash
git add src/features/recommendations src/layouts/RecommendationLayout.astro src/pages/recommendations/index.astro src/components/HomeRecommendations.astro src/components/Navigation.tsx src/components/Navigation.test.tsx src/pages/index.astro src/content.config.ts src/content.config.test.ts src/data/recommendations public/media/recommendations/back-in-black.svg docs/recommendation-cover-sources.md tests/e2e/site.spec.ts
git commit -m "fix: polish recommendation experience"
```

不得使用 `git add .`，避免加入用户已有未跟踪文件。

- [ ] **步骤 8：最终状态确认**

运行：

```bash
git log --oneline -10
git status --short
```

预期：实现提交清晰分层；只剩用户原有的未跟踪文件或明确说明的工作区状态。
