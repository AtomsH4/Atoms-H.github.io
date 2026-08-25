# AtomsH4 清透弥散玻璃改版实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在保留现有内容、链接和打字动画的前提下，将主页从厚重像素 HUD 改为清透弥散渐变与毛玻璃风格，并用抽象玻璃像素矩阵替代头像。

**架构：** 继续使用单页纯 HTML、CSS 和现有原生 JavaScript。`index.html` 只负责语义内容与装饰矩阵结构，`styles.css` 统一管理玻璃视觉令牌、弥散背景、响应式布局和动效，`scripts/verify-site.js` 作为静态结构与运行时行为契约。

**技术栈：** HTML5、CSS3（radial-gradient、backdrop-filter、CSS Grid、媒体查询）、原生 JavaScript、Node.js 验证脚本、GitHub Pages。

---

## 文件结构

- 修改 `index.html`：更新页面元数据、简化首屏结构、删除玩家 HUD 与头像、加入装饰性玻璃像素矩阵。
- 修改 `styles.css`：重建全站视觉令牌、弥散背景、玻璃组件、首屏矩阵、卡片、按钮、响应式和减少动态效果样式。
- 修改 `scripts/verify-site.js`：删除头像/HUD 旧契约，新增玻璃矩阵、缓存版本、可访问性、响应式与玻璃样式契约；保留打字动画运行时测试。
- 保持 `script.js` 不变：继续提供现有打字循环。

### 任务 1：用失败测试锁定新首屏结构

**文件：**
- 修改：`scripts/verify-site.js:5-232`
- 测试：`scripts/verify-site.js`

- [ ] **步骤 1：删除头像文件契约，新增新结构的必需与禁止片段**

将 `avatarPath`、`expectFile(avatarPath, ...)`、`avatar` 读取和 PNG 签名检查删除。把 `requiredHtml` 中的 HUD 片段替换为：

```js
const requiredHtml = [
  '<!doctype html>',
  'lang="zh-CN"',
  '<link rel="stylesheet" href="styles.css?v=glass-v1">',
  '<script src="script.js" defer></script>',
  '<h1 id="hero-title">AtomsH4</h1>',
  'data-typewriter="Any sufficiently advanced technology is indistinguishable from magic."',
  'class="typewriter-text"',
  'class="typewriter-cursor"',
  'class="glass-pixel-matrix"',
  'aria-hidden="true"',
  'class="glass-pixel"',
  'id="quests"',
  'id="skills"',
  'id="projects"',
  'id="contact"',
  'https://github.com/AtomsH4',
  'https://www.cnblogs.com/atomsh',
  'https://github.com/AtomsH4/frontend-tools',
  'https://github.com/AtomsH4/CourseSelectionSystem',
  'https://github.com/AtomsH4/text-classification-cnn-rnn'
]

const forbiddenHtml = [
  'Gu JiaMing',
  'PLAYER DATA',
  'PROGRAMMER',
  'LV. ???',
  'aria-label="Experience"',
  'STATUS: CODING',
  'assets/avatar-pixel.png',
  'class="player-card"',
  'class="pixel-avatar"'
]
```

- [ ] **步骤 2：加入矩阵数量与装饰性语义断言**

```js
const glassMatrixTag = html.match(
  /<div\b[^>]*class="glass-pixel-matrix"[^>]*>/
)?.[0]

if (!glassMatrixTag?.includes('aria-hidden="true"')) {
  fail('glass pixel matrix should be hidden from assistive technology')
}

const glassPixels = [...html.matchAll(/class="glass-pixel"/g)]
if (glassPixels.length !== 20) {
  fail(`expected 20 glass pixels, found ${glassPixels.length}`)
}
```

- [ ] **步骤 3：替换旧 CSS 契约**

要求 CSS 包含以下选择器与声明：

```js
expectCssRule('.glass-pixel-matrix', [
  'grid-template-columns: repeat(5, 1fr)'
])

expectCssRule('.glass-pixel', [
  'backdrop-filter: blur(18px) saturate(145%)',
  'border-radius: 18px'
])

expectCssRule('.site-nav', [
  'backdrop-filter: blur(24px) saturate(135%)'
])

expectCssRule('.typewriter-quote', [
  'width: min(100%, 480px)',
  'min-height: 4.3em'
])
```

新增全局片段断言：

```js
for (const fragment of [
  '--glass-bg',
  '--glass-border',
  '--glass-shadow',
  '.glass-pixel-matrix',
  '.glass-pixel',
  '@supports not ((backdrop-filter: blur(1px))',
  '@media (max-width: 860px)',
  '@media (max-width: 520px)',
  '@media (prefers-reduced-motion: reduce)'
]) {
  if (!css.includes(fragment)) fail(`styles.css should include ${fragment}`)
}
```

- [ ] **步骤 4：运行验证，确认因新结构尚未实现而失败**

运行：

```bash
node scripts/verify-site.js
```

预期：FAIL，首个错误为缺少 `styles.css?v=glass-v1`、`.glass-pixel-matrix` 或 20 个 `.glass-pixel`，而不是语法错误。

- [ ] **步骤 5：提交测试契约**

```bash
git add scripts/verify-site.js
git commit -m "test: define diffused glass homepage contract"
```

### 任务 2：替换首屏 HUD 为毛玻璃像素矩阵

**文件：**
- 修改：`index.html:6-96`
- 测试：`scripts/verify-site.js`

- [ ] **步骤 1：更新元数据与样式版本**

```html
<meta
  name="description"
  content="AtomsH4 的清透玻璃风个人主页，展示 AI、Web、Agents、全栈开发和产品设计经历。"
>
<title>AtomsH4 | Creative Developer</title>
<link rel="stylesheet" href="styles.css?v=glass-v1">
```

- [ ] **步骤 2：把两个厚重像素徽章合并为轻量身份标签**

```html
<div class="badge-row" aria-label="Profile focus">
  <span class="glass-badge"><span class="status-dot" aria-hidden="true"></span>Creative Developer</span>
  <span class="glass-badge">AI · Web · Product</span>
</div>
```

- [ ] **步骤 3：保留标题、打字动画和链接，更新按钮类名**

```html
<div class="hero-actions" aria-label="Primary links">
  <a class="glass-button glass-button-primary" href="#projects">Explore work</a>
  <a class="glass-button glass-button-secondary" href="https://github.com/AtomsH4">GitHub</a>
</div>
```

- [ ] **步骤 4：删除整个 `<aside class="player-card">`，加入 20 单元装饰矩阵**

```html
<div class="hero-visual" aria-hidden="true">
  <div class="diffused-orb diffused-orb-cyan"></div>
  <div class="diffused-orb diffused-orb-violet"></div>
  <div class="glass-pixel-matrix">
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
    <span class="glass-pixel"></span>
  </div>
</div>
```

- [ ] **步骤 5：运行验证，确认 HTML 契约通过但 CSS 契约仍失败**

运行：

```bash
node scripts/verify-site.js
```

预期：FAIL，错误指向缺少玻璃 CSS 令牌、`.glass-pixel` 或玻璃导航声明。

- [ ] **步骤 6：提交首屏结构**

```bash
git add index.html
git commit -m "feat: replace player HUD with glass pixel artwork"
```

### 任务 3：重建全站清透玻璃视觉系统

**文件：**
- 修改：`styles.css:1-683`
- 测试：`scripts/verify-site.js`

- [ ] **步骤 1：替换根视觉令牌与全页弥散背景**

使用以下令牌作为全站唯一颜色与玻璃层次来源：

```css
:root {
  --page-bg: #eef1f9;
  --ink: #292b46;
  --muted: #6d7088;
  --accent: #655ee8;
  --accent-deep: #2b2d4b;
  --cyan: #75ddff;
  --violet: #9b87ff;
  --pink: #efbaf2;
  --glass-bg: rgba(255, 255, 255, 0.46);
  --glass-bg-strong: rgba(255, 255, 255, 0.66);
  --glass-border: rgba(255, 255, 255, 0.82);
  --glass-shadow: 0 24px 70px rgba(76, 78, 128, 0.12);
  --soft-shadow: 0 14px 38px rgba(80, 82, 130, 0.08);
  --radius-lg: 30px;
  --radius-md: 22px;
  --mono: "Courier New", ui-monospace, SFMono-Regular, Menlo, monospace;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at 8% 8%, rgba(117, 221, 255, 0.33), transparent 32%),
    radial-gradient(circle at 88% 18%, rgba(155, 135, 255, 0.28), transparent 34%),
    radial-gradient(circle at 72% 82%, rgba(239, 186, 242, 0.26), transparent 32%),
    var(--page-bg);
  color: var(--ink);
}
```

- [ ] **步骤 2：把导航、标签和按钮改成轻量玻璃组件**

关键声明必须为：

```css
.site-nav {
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: var(--soft-shadow);
  backdrop-filter: blur(24px) saturate(135%);
}

.glass-badge,
.glass-button-secondary {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(18px);
}

.glass-button-primary {
  background: var(--accent-deep);
  color: #fff;
}
```

按钮和导航 hover 使用 `transform: translateY(-2px)` 与柔和阴影，不再使用像素式右下偏移。

- [ ] **步骤 3：实现首屏排版与毛玻璃矩阵**

```css
.hero {
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: clamp(36px, 6vw, 82px);
  min-height: 680px;
}

h1 {
  background: linear-gradient(90deg, #292b46 8%, #7169de 92%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-visual {
  position: relative;
  display: grid;
  min-height: 430px;
  place-items: center;
}

.glass-pixel-matrix {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 350px);
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  padding: 18px;
  transform: rotate(-3deg);
}

.glass-pixel {
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(255,255,255,.70), rgba(255,255,255,.18));
  box-shadow:
    inset 2px 2px 4px rgba(255,255,255,.88),
    inset -2px -2px 6px rgba(104,118,205,.08),
    0 10px 26px rgba(85,82,155,.09);
  backdrop-filter: blur(18px) saturate(145%);
}
```

用 `:nth-child()` 将外围单元透明度降低到 `0.4`–`0.62`，中部少数单元保持 `1`，颜色由 `.diffused-orb-*` 下层弥散光穿透形成。

- [ ] **步骤 4：统一经历、技能、项目和联系区的玻璃卡片**

将 `.quest-card`、`.info-card`、`.project-card`、`.terminal-card`、`.contact-links a` 共享以下基础：

```css
.quest-card,
.info-card,
.project-card,
.terminal-card,
.contact-links a {
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  background: var(--glass-bg);
  box-shadow: var(--soft-shadow), inset 0 1px 0 rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(20px) saturate(125%);
}
```

删除所有 `3px`/`4px` 黑边框、硬偏移阴影、黄色按钮底和深色终端整块底色。项目类型与技能标签改为半透明胶囊。联系主面板使用 `var(--glass-bg-strong)`，保持正文可读。

- [ ] **步骤 5：实现兼容回退、响应式和减少动态效果**

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .site-nav,
  .glass-badge,
  .glass-button-secondary,
  .glass-pixel,
  .quest-card,
  .info-card,
  .project-card,
  .terminal-card,
  .contact-links a {
    background: rgba(255, 255, 255, 0.9);
  }
}

@media (max-width: 860px) {
  .hero { grid-template-columns: 1fr; min-height: auto; }
  .hero-visual { min-height: 360px; }
  .quest-list, .card-grid, .project-grid, .contact-section { grid-template-columns: 1fr; }
}

@media (max-width: 520px) {
  .site-nav { border-radius: 24px; }
  .glass-pixel-matrix { width: min(100%, 285px); gap: 7px; padding: 12px; }
  .glass-pixel { border-radius: 13px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .typewriter-cursor, .diffused-orb { animation: none; }
  .glass-button, .project-card, .contact-links a { transition: none; }
}
```

- [ ] **步骤 6：运行定向验证**

运行：

```bash
node --check script.js
node scripts/verify-site.js
git diff --check
```

预期：三条命令退出码均为 `0`，验证脚本输出 `Site verification passed`。

- [ ] **步骤 7：提交视觉系统**

```bash
git add styles.css scripts/verify-site.js
git commit -m "feat: redesign portfolio with diffused glass styling"
```

### 任务 4：完成合并前验证与发布

**文件：**
- 验证：`index.html`
- 验证：`styles.css`
- 验证：`script.js`
- 验证：`scripts/verify-site.js`

- [ ] **步骤 1：确认变更范围**

运行：

```bash
git status --short
git diff main...HEAD --stat
git diff main...HEAD -- index.html styles.css scripts/verify-site.js
```

预期：产品代码只修改 `index.html`、`styles.css`、`scripts/verify-site.js`；`script.js` 无变化；另包含已批准的规格和计划文档。

- [ ] **步骤 2：运行完整定向验证**

```bash
node --check script.js
node scripts/verify-site.js
git diff --check main...HEAD
```

预期：全部退出码为 `0`，验证脚本输出 `Site verification passed`。

- [ ] **步骤 3：确认旧视觉契约已经移除**

```bash
rg -n "PLAYER DATA|LV\. \?\?\?|pixel-avatar|portrait-frame|xp-track|border: [34]px solid var\(--line\)|box-shadow: [0-9]+px [0-9]+px 0" index.html styles.css scripts/verify-site.js
```

预期：无匹配。

- [ ] **步骤 4：确认新视觉契约存在**

```bash
rg -n "glass-pixel-matrix|glass-pixel|backdrop-filter|radial-gradient|styles\.css\?v=glass-v1" index.html styles.css scripts/verify-site.js
```

预期：三份文件均有对应新契约，且 `index.html` 中 `.glass-pixel` 恰好 20 个。

- [ ] **步骤 5：合并并在 `main` 上重新验证**

```bash
git switch main
git pull --ff-only origin main
git merge --ff-only codex/diffused-glass-redesign
node --check script.js
node scripts/verify-site.js
git diff --check
```

预期：快进合并成功，验证全部通过。

- [ ] **步骤 6：推送并等待 GitHub Pages**

```bash
git push origin main
gh run list --repo AtomsH4/Atoms-H.github.io --limit 3
pages_run_id=$(gh run list --repo AtomsH4/Atoms-H.github.io --workflow pages-build-deployment --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch "$pages_run_id" --repo AtomsH4/Atoms-H.github.io --exit-status
```

预期：Pages 构建与部署任务完成且结论为 `success`。不得使用任何 force push 参数。

- [ ] **步骤 7：验证线上版本和仓库同步状态**

```bash
curl -fsSL 'https://atomsh4.github.io/Atoms-H.github.io/?v=glass-v1' | rg 'styles\.css\?v=glass-v1|glass-pixel-matrix'
curl -fsSL 'https://atomsh4.github.io/Atoms-H.github.io/styles.css?v=glass-v1' | rg 'backdrop-filter|glass-pixel|radial-gradient'
git status --short --branch
git rev-parse HEAD
git rev-parse origin/main
```

预期：线上 HTML 和 CSS 包含新玻璃视觉标识；本地 `main` 与 `origin/main` 提交一致且工作区干净。
