# 推荐页画布拖动路由实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在同一推荐画布中实现“拖动空白横向浏览整组作品、拖动任意作品只旋转该作品”，并让 WebGL 与 CSS 降级行为一致。

**架构：** 新增无渲染依赖的拖动方向锁与吸附计算模块，两个舞台共同消费该纯函数。WebGL 使用作品后的透明射线命中面承接轨道拖动，作品事件阻止向后传播并进入独立旋转；`RecommendationExperience` 继续只拥有分类和 `activeId`，不承载逐帧动画。

**技术栈：** Astro 7、React 19、TypeScript、React Three Fiber、Three.js、Vitest、Testing Library、Playwright

---

## 文件结构

- 创建 `src/features/recommendations/canvas-drag.ts`：方向锁、速度、吸附步数和视觉重定位纯函数。
- 创建 `src/features/recommendations/canvas-drag.test.ts`：共享手势数学单元测试。
- 修改 `src/features/recommendations/recommendation-navigation.ts`：增加任意步数循环选择。
- 修改 `src/features/recommendations/recommendation-navigation.test.ts`：覆盖跨项与首尾循环。
- 修改 `src/features/recommendations/useDragRotation.ts`：隔离作品手势并抑制拖动后的误点击。
- 修改 `src/features/recommendations/RecommendationFallbackStage.tsx`：CSS 轨道平移及任意作品旋转。
- 修改 `src/features/recommendations/RecommendationFallbackStage.test.tsx`：验证 CSS 命中分流。
- 修改 `src/features/recommendations/RecommendationStage.tsx`：WebGL 背景命中面、连续轨道和作品旋转。
- 修改 `src/features/recommendations/RecommendationExperience.module.css`：轨道位移、抓取光标和回弹样式。
- 修改 `src/features/recommendations/RecommendationExperience.tsx`：更新交互提示。
- 修改 `src/features/recommendations/RecommendationExperience.test.tsx`：提示与舞台契约测试。
- 修改 `tests/e2e/site.spec.ts`：真实 Canvas、移动端与无 WebGL 回归。

---

### 任务 1：共享拖动判定与吸附数学

**文件：**
- 创建：`src/features/recommendations/canvas-drag.ts`
- 创建：`src/features/recommendations/canvas-drag.test.ts`

- [ ] **步骤 1：编写失败测试**

```ts
import { describe, expect, it } from 'vitest';
import { finishCanvasDrag, moveCanvasDrag, startCanvasDrag } from './canvas-drag';

describe('canvas drag routing', () => {
  it('keeps small movement pending and yields vertical motion to scrolling', () => {
    const start = startCanvasDrag(100, 100, 0);
    expect(moveCanvasDrag(start, 104, 105, 16).intent).toBe('pending');
    expect(moveCanvasDrag(start, 104, 128, 32).intent).toBe('scroll-y');
  });

  it('locks horizontal movement to canvas panning', () => {
    const moved = moveCanvasDrag(startCanvasDrag(120, 100, 0), 42, 106, 120);
    expect(moved.intent).toBe('pan-x');
    expect(moved.offsetX).toBe(-78);
  });

  it('projects inertia and preserves continuity after selection rebasing', () => {
    const moved = moveCanvasDrag(startCanvasDrag(100, 100, 0), 40, 102, 100);
    expect(finishCanvasDrag(moved, { itemCount: 4, spacingPx: 100, reducedMotion: false }).steps).toBe(2);
    expect(finishCanvasDrag(moved, { itemCount: 4, spacingPx: 100, reducedMotion: true })).toEqual({ steps: 1, rebasedOffsetX: 40 });
  });
});
```

- [ ] **步骤 2：运行测试验证红灯**

```bash
npx vitest run src/features/recommendations/canvas-drag.test.ts
```

预期：FAIL，`./canvas-drag` 不存在。

- [ ] **步骤 3：实现纯函数契约**

实现并导出 `CanvasDragIntent`、`CanvasDragState`、`CanvasDragResult`、`startCanvasDrag`、`moveCanvasDrag` 与 `finishCanvasDrag`。方向锁阈值为 8px；横向位移大于纵向位移时进入 `pan-x`，否则进入 `scroll-y`；速度单位为 px/ms；非减少动态模式按 160ms 预测惯性；吸附步数限制在 `-(itemCount - 1)` 到 `itemCount - 1`；返回 `rebasedOffsetX = offsetX + steps * spacingPx` 保持切换前后视觉连续。

- [ ] **步骤 4：运行测试验证绿灯**

```bash
npx vitest run src/features/recommendations/canvas-drag.test.ts
```

预期：3 个测试 PASS。

- [ ] **步骤 5：Commit**

```bash
git add src/features/recommendations/canvas-drag.ts src/features/recommendations/canvas-drag.test.ts
git commit -m "feat: add canvas drag gesture math"
```

---

### 任务 2：任意步数循环选择

**文件：**
- 修改：`src/features/recommendations/recommendation-navigation.ts`
- 修改：`src/features/recommendations/recommendation-navigation.test.ts`

- [ ] **步骤 1：编写失败测试**

```ts
it('resolves arbitrary wrapped offsets from the active item', () => {
  expect(getRecommendationIdAtOffset(items, 'item-1', 2)).toBe('item-3');
  expect(getRecommendationIdAtOffset(items, 'item-3', 2)).toBe('item-2');
  expect(getRecommendationIdAtOffset(items, 'missing', -1)).toBe('item-3');
  expect(getRecommendationIdAtOffset([], null, 1)).toBeNull();
});
```

- [ ] **步骤 2：运行测试验证红灯**

```bash
npx vitest run src/features/recommendations/recommendation-navigation.test.ts
```

预期：FAIL，新函数未导出。

- [ ] **步骤 3：实现并复用循环选择**

```ts
export const getRecommendationIdAtOffset = (
  items: RecommendationItem[],
  activeId: string | null,
  offset: number,
): string | null => {
  if (items.length === 0) return null;
  const requestedIndex = items.findIndex((item) => item.id === activeId);
  const activeIndex = requestedIndex === -1 ? 0 : requestedIndex;
  const nextIndex = ((activeIndex + offset) % items.length + items.length) % items.length;
  return items[nextIndex]?.id ?? null;
};
```

让 `getAdjacentRecommendationId` 在少于两个项目时继续返回 `null`，其余情况调用 `getRecommendationIdAtOffset`。

- [ ] **步骤 4：运行相关测试并 Commit**

```bash
npx vitest run src/features/recommendations/recommendation-navigation.test.ts src/features/recommendations/RecommendationExperience.test.tsx
git add src/features/recommendations/recommendation-navigation.ts src/features/recommendations/recommendation-navigation.test.ts
git commit -m "feat: resolve multi-step recommendation navigation"
```

预期：全部 PASS 后提交。

---

### 任务 3：CSS 舞台命中分流

**文件：**
- 修改：`src/features/recommendations/useDragRotation.ts`
- 修改：`src/features/recommendations/RecommendationFallbackStage.tsx`
- 修改：`src/features/recommendations/RecommendationFallbackStage.test.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`

- [ ] **步骤 1：编写背景拖动与邻居旋转红灯测试**

把测试数据扩展到至少三个项目，验证：从 `recommendation-fallback-stage` 背景由 x=260 拖到 x=40 后 `onSelect` 收到下一项；从邻居按钮开始拖动时该按钮 `data-dragging=true`、stage `data-panning=false`，释放后的 click 不调用 `onSelect`；邻居短点击仍能选择。

- [ ] **步骤 2：运行测试验证红灯**

```bash
npx vitest run src/features/recommendations/RecommendationFallbackStage.test.tsx
```

预期：背景没有平移状态，邻居没有旋转处理器且会误触选择。

- [ ] **步骤 3：隔离作品旋转手势**

在 `useDragRotation` 中让 `onPointerDown` 调用 `stopPropagation()`，记录起点和 `didDrag` ref；超过 4px 后标记为拖动。返回 `consumeDraggedClick()` 供 click handler 消费。所有可见作品都绑定 pointer handlers 并应用各自 rotation；只有未拖动的非 active 作品 click 才调用 `onSelect`。

- [ ] **步骤 4：增加 CSS 轨道状态**

`RecommendationFallbackStage` 根节点保存一个 `CanvasDragState` ref 和 `{ dragging, offsetX }` 状态。根节点 pointer handlers 使用共享纯函数；释放时按舞台宽度计算 `spacingPx`，再调用 `getRecommendationIdAtOffset`。增加包裹所有 `PhysicalObject` 的 `cssTrack`，通过 `--track-x` 平移。切换 N 项时先使用 `rebasedOffsetX`，再在下一帧回弹到 0；减少动态效果时直接归零。

- [ ] **步骤 5：增加轨道 CSS**

```css
.cssStage { cursor: grab; }
.cssStage[data-panning='true'] { cursor: grabbing; }
.cssTrack {
  position: absolute;
  inset: 0;
  transform: translate3d(var(--track-x, 0), 0, 0);
  transition: transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
  transform-style: preserve-3d;
}
.cssTrack[data-panning='true'],
.cssStage[data-reduced-motion='true'] .cssTrack { transition: none; }
```

- [ ] **步骤 6：运行测试并 Commit**

```bash
npx vitest run src/features/recommendations/RecommendationFallbackStage.test.tsx src/features/recommendations/drag-rotation.test.ts
git add src/features/recommendations/useDragRotation.ts src/features/recommendations/RecommendationFallbackStage.tsx src/features/recommendations/RecommendationFallbackStage.test.tsx src/features/recommendations/RecommendationExperience.module.css
git commit -m "feat: route css stage pan and object rotation"
```

预期：全部 PASS 后提交。

---

### 任务 4：WebGL 单画布射线分流

**文件：**
- 修改：`src/features/recommendations/RecommendationStage.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.module.css`
- 修改：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：先写 Canvas 空白拖动红灯 E2E**

新用例进入推荐页，记录 level 2 heading，在 Canvas 顶部空白处从 50% 宽拖到 28% 宽，断言标题变化。

- [ ] **步骤 2：运行用例验证红灯**

```bash
npx playwright test tests/e2e/site.spec.ts --grep "Canvas 空白"
```

预期：FAIL，标题不变化。

- [ ] **步骤 3：让所有作品独立旋转**

把 `ActivePresentation` 改为 `ObjectPresentation`，每个 `StageModel` 都使用它。作品 `pointerdown` 必须 `event.stopPropagation()` 并捕获 pointer；move/up/cancel/lost capture 同样阻止到达背景。保持有限角度与松手复位，模型 click 仍负责未拖动的邻居选择。

- [ ] **步骤 4：增加 `CanvasTrack` 和背景命中面**

新增本地组件契约：

```ts
type CanvasTrackProps = {
  children: ReactNode;
  items: RecommendationItem[];
  activeId: string;
  compact: boolean;
  reducedMotion: boolean;
  onSelect: (id: string) => void;
};
```

用 `viewport.width / size.width` 把像素位移换算为世界坐标；桌面间距 2.4、紧凑间距 2.45。作品后方添加透明、可 raycast、`depthWrite={false}` 的 plane；plane 使用共享拖动函数并只修改统一 track group 的 x。释放后通过任意步数导航选择目标，以 `currentOffset + steps * spacingWorld` 重定位，再由 `useFrame` 阻尼回 0。只在拖动或回弹期间 `invalidate()`；减少动态效果时立即归零。

```tsx
<mesh position={[0, 0, -2]} {...backgroundPointerHandlers}>
  <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5]} />
  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
</mesh>
```

- [ ] **步骤 5：暴露测试状态与光标**

背景拖动期间在 canvas 设置 `data-track-panning="true"`，结束后设置为 `false`；保留 ready 属性。Canvas 默认 `cursor: grab`，拖动时 `grabbing`。

- [ ] **步骤 6：运行定向验证并 Commit**

```bash
npx playwright test tests/e2e/site.spec.ts --grep "Canvas 空白|Canvas 支持真实拖动"
npm test
npm run check
git add src/features/recommendations/RecommendationStage.tsx src/features/recommendations/RecommendationExperience.module.css tests/e2e/site.spec.ts
git commit -m "feat: pan recommendation canvas behind 3d objects"
```

预期：背景拖动切换标题；作品中心拖动改变 Canvas 截图但标题不变；其余测试通过。

---

### 任务 5：提示、移动端与 CSS 降级 E2E

**文件：**
- 修改：`src/features/recommendations/RecommendationExperience.tsx`
- 修改：`src/features/recommendations/RecommendationExperience.test.tsx`
- 修改：`tests/e2e/site.spec.ts`

- [ ] **步骤 1：先写提示红灯测试**

```ts
expect(screen.getByText(/拖动画布浏览 · 拖动作品旋转/)).toBeVisible();
```

运行 `npx vitest run src/features/recommendations/RecommendationExperience.test.tsx`，预期 FAIL，仍显示英文旋转提示。

- [ ] **步骤 2：更新提示**

```tsx
{String(activePosition).padStart(2, '0')} /{' '}
{String(filteredItems.length).padStart(2, '0')} · 拖动画布浏览 · 拖动作品旋转
```

- [ ] **步骤 3：补齐四类浏览器行为**

在 `tests/e2e/site.spec.ts` 覆盖：桌面 Canvas 空白拖动会更新标题、hash 和序号；桌面作品拖动只改变截图；390×844 横向空白拖动切换而纵向滚动继续生效；禁用 WebGL 后 CSS 背景拖动切换、CSS 作品拖动只旋转。等待明确标题或 `data-track-panning="false"`，不使用任意长 sleep 掩盖竞态。

- [ ] **步骤 4：运行测试并 Commit**

```bash
npx playwright test tests/e2e/site.spec.ts --grep "推荐页"
npx vitest run src/features/recommendations/RecommendationExperience.test.tsx src/features/recommendations/RecommendationFallbackStage.test.tsx
git add src/features/recommendations/RecommendationExperience.tsx src/features/recommendations/RecommendationExperience.test.tsx tests/e2e/site.spec.ts
git commit -m "test: cover canvas pan and object rotation routing"
```

预期：全部 PASS 后提交。

---

### 任务 6：完整验证与视觉验收

**文件：**
- 可能修改：仅限前述任务发现真实缺陷的推荐页文件及其测试

- [ ] **步骤 1：运行完整验证**

```bash
npm test
npm run check
npm run build
npm run test:e2e
git diff --check
```

预期：全部 exit 0；Astro check 0 errors；Vitest 与 Playwright 全部 PASS。

- [ ] **步骤 2：启动生产预览**

```bash
npm run preview -- --host 127.0.0.1
```

- [ ] **步骤 3：桌面验收（1440×900）**

确认空白拖动时整组作品同步横移、大幅拖动可跨项、释放吸附并更新左上信息；从任意作品表面拖动只旋转该作品；箭头、短点击和方向键仍工作。

- [ ] **步骤 4：移动端和无 WebGL 验收（390×844）**

确认横向空白拖动切换、纵向页面滚动不被阻断、作品拖动不误切换、无横向溢出；减少动态效果时无惯性。

- [ ] **步骤 5：若发现缺陷，先写最小失败测试再集中修正**

只运行对应 Vitest 与 E2E grep 验证单一缺陷；无缺陷时不创建空提交。

- [ ] **步骤 6：最终状态**

```bash
git status --short --branch
git log --oneline -12
```

预期：工作树干净，提交按手势数学、循环导航、CSS 路由、WebGL 路由和 E2E 分层。
