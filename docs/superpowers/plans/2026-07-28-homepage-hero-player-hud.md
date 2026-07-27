# 首页 Hero 与玩家 HUD 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 删除首页 Hero 中的个人姓名和两段介绍，将右侧状态卡改为像素游戏玩家 HUD，并为英文名句增加无障碍的单句打字循环。

**架构：** 保留现有纯静态单页结构，用语义化 HTML 和现有 CSS 变量重组 Hero；新增一份无依赖的 `script.js` 负责打字状态机。现有 Node 校验脚本先定义静态契约，再验证最终 HTML、CSS、JavaScript 和 PNG 资源。

**技术栈：** HTML5、CSS3、原生 JavaScript、Node.js 静态校验脚本、GitHub Pages

---

## 文件结构

- 修改 `index.html`：更新页面描述、Hero 文案、玩家 HUD 语义结构，并加载打字脚本。
- 修改 `styles.css`：删除旧状态窗口和悬浮标签样式，新增 HUD、头像裁剪、打字光标和减少动态效果样式。
- 创建 `script.js`：实现输入、停留、删除、重启四阶段的单句循环。
- 修改 `scripts/verify-site.js`：用明确的必需与禁止片段验证新 Hero、HUD、脚本、响应式规则和原有页面内容。

### 任务 1：用静态契约驱动 Hero 与玩家 HUD 改版

**文件：**
- 修改：`scripts/verify-site.js:32-72`
- 修改：`index.html:6-12`
- 修改：`index.html:28-89`
- 修改：`styles.css:104-340`
- 修改：`styles.css:568-635`

- [ ] **步骤 1：先修改校验脚本，定义新 Hero 与 HUD 的失败契约**

在 `scripts/verify-site.js` 中将 `requiredHtml`、旧 CSS 检查块替换为以下内容，并添加 `forbiddenHtml`：

```js
const requiredHtml = [
  '<!doctype html>',
  'lang="zh-CN"',
  '<h1 id="hero-title">AtomsH4</h1>',
  'What I cannot create, I do not understand.',
  'KEEP CODING',
  'KEEP PLAYING',
  'PLAYER DATA',
  'PROGRAMMER',
  'LV. ???',
  'aria-valuenow="72"',
  '72%',
  'STATUS: CODING',
  'HP ▰▰▰▰▰',
  'id="quests"',
  'id="skills"',
  'id="projects"',
  'id="contact"',
  'assets/avatar-pixel.png',
  'https://github.com/AtomsH4',
  'https://www.cnblogs.com/atomsh',
  'https://github.com/AtomsH4/frontend-tools',
  'https://github.com/AtomsH4/CourseSelectionSystem',
  'https://github.com/AtomsH4/text-classification-cnn-rnn'
]

const forbiddenHtml = [
  'Gu JiaMing',
  'hero-subtitle',
  'hero-description',
  'status-window',
  'status-grid',
  'float-chip'
]

for (const fragment of requiredHtml) {
  if (!html.includes(fragment)) {
    fail(`index.html should include ${fragment}`)
  }
}

for (const fragment of forbiddenHtml) {
  if (html.includes(fragment)) {
    fail(`index.html should not include ${fragment}`)
  }
}

const projectCards = [...html.matchAll(/data-project="/g)]
if (projectCards.length < 5) {
  fail(`expected at least 5 project cards, found ${projectCards.length}`)
}

for (const fragment of [
  '--pink',
  '--cyan',
  '.hero',
  '.typewriter-quote',
  '.player-card',
  '.player-data',
  '.xp-track',
  '.portrait-frame',
  'overflow: hidden',
  'image-rendering: pixelated',
  '@media (max-width: 860px)'
]) {
  if (!css.includes(fragment)) {
    fail(`styles.css should include ${fragment}`)
  }
}
```

- [ ] **步骤 2：运行校验并确认它因旧页面结构失败**

运行：

```bash
node scripts/verify-site.js
```

预期：退出码非零，首个错误包含：

```text
index.html should include <h1 id="hero-title">AtomsH4</h1>
```

- [ ] **步骤 3：替换页面描述和完整 Hero**

将 `index.html` 中的描述改为：

```html
<meta
  name="description"
  content="AtomsH4 的像素风个人主页，展示 AI、Web、Agents、全栈开发和产品设计经历。"
>
```

用以下代码替换 `section#top`：

```html
<section id="top" class="hero" aria-labelledby="hero-title">
  <div class="hero-copy">
    <div class="badge-row" aria-label="Profile motto">
      <span class="pixel-badge"><span class="status-dot"></span>KEEP CODING</span>
      <span class="pixel-badge"><span class="status-dot status-dot-cyan"></span>KEEP PLAYING</span>
    </div>

    <h1 id="hero-title">AtomsH4</h1>
    <p class="typewriter-quote">What I cannot create, I do not understand.</p>

    <div class="hero-actions" aria-label="Primary links">
      <a class="pixel-button pixel-button-primary" href="#projects">Start Quest</a>
      <a class="pixel-button pixel-button-secondary" href="https://github.com/AtomsH4">GitHub</a>
    </div>
  </div>

  <aside class="player-card" aria-label="Pixel player data">
    <div class="player-title"><span aria-hidden="true">◆</span>PLAYER DATA</div>

    <div class="player-data">
      <div class="player-class">
        <span class="class-icon" aria-hidden="true">&gt;_</span>
        <span><small>CLASS</small>PROGRAMMER</span>
      </div>
      <span class="player-level">LV. ???</span>

      <div class="xp-row">
        <span>EXP</span>
        <span
          class="xp-track"
          role="progressbar"
          aria-label="Experience"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="72"
        >
          <span class="xp-fill"></span>
        </span>
        <span>72%</span>
      </div>
    </div>

    <div class="portrait-stage">
      <span class="frame-corner frame-corner-top" aria-hidden="true"></span>
      <div class="portrait-frame">
        <img
          class="pixel-avatar"
          src="assets/avatar-pixel.png"
          alt="原创粉发像素角色头像"
          width="150"
          height="148"
        >
      </div>
      <span class="frame-corner frame-corner-bottom" aria-hidden="true"></span>
    </div>

    <div class="player-footer">
      <span>STATUS: CODING</span>
      <span>HP ▰▰▰▰▰</span>
    </div>
  </aside>
</section>
```

- [ ] **步骤 4：替换 Hero 与状态卡样式**

保留 `.hero`、`.badge-row`、`.pixel-badge`、按钮规则，将旧的 `h1 span`、`.hero-subtitle`、`.hero-description`、`.avatar-card`、`.status-window`、`.window-bar`、`.status-grid`、`.avatar-stage`、`.float-chip` 和三个 `.chip-*` 规则删除，并加入：

```css
h1 {
  margin: 0;
  color: var(--pink);
  font-size: clamp(48px, 7.6vw, 92px);
  font-weight: 950;
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.typewriter-quote {
  min-height: 4.3em;
  max-width: 660px;
  margin: 0;
  color: #353040;
  font-family: "Courier New", Courier, monospace;
  font-size: clamp(19px, 2.25vw, 27px);
  font-weight: 800;
  line-height: 1.48;
}

.player-card {
  overflow: hidden;
  border: 4px solid var(--line);
  background: var(--panel);
  box-shadow: 10px 10px 0 rgba(29, 36, 51, 0.16);
}

.player-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-bottom: 4px solid var(--line);
  background: var(--line);
  color: #fff;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.player-title span {
  color: var(--pink);
}

.player-data {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px 18px;
  padding: 14px;
  border-bottom: 4px solid var(--line);
  background: #fffafd;
  font-family: var(--mono);
  font-size: 12px;
  font-weight: 900;
}

.player-class {
  display: flex;
  align-items: center;
  gap: 10px;
}

.player-class small {
  display: block;
  color: var(--muted);
  font-size: 10px;
}

.class-icon {
  display: inline-grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 3px solid var(--line);
  background: var(--cyan);
}

.player-level {
  display: grid;
  place-items: center;
  padding: 0 9px;
  border: 3px solid var(--line);
  background: var(--yellow);
}

.xp-row {
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: auto 1fr auto;
  gap: 8px;
  align-items: center;
}

.xp-track {
  height: 18px;
  padding: 2px;
  border: 3px solid var(--line);
  background: #f2edf4;
}

.xp-fill {
  display: block;
  width: 72%;
  height: 100%;
  background: repeating-linear-gradient(
    90deg,
    var(--pink) 0 10px,
    #ffb7cf 10px 14px
  );
}

.portrait-stage {
  position: relative;
  display: grid;
  min-height: 330px;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(rgba(29, 36, 51, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(29, 36, 51, 0.06) 1px, transparent 1px),
    linear-gradient(180deg, #fff 0%, #fff0f6 100%);
  background-size: 18px 18px, 18px 18px, auto;
}

.portrait-frame {
  display: grid;
  width: min(68%, 250px);
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border: 4px solid var(--line);
  background: #fff;
  box-shadow: 10px 10px 0 rgba(29, 36, 51, 0.14);
}

.pixel-avatar {
  width: 132%;
  max-width: none;
  height: auto;
  image-rendering: pixelated;
  transform: translate(3%, 1%);
}

.frame-corner {
  position: absolute;
  width: 30px;
  height: 30px;
}

.frame-corner-top {
  top: 20px;
  left: 20px;
  border-top: 4px solid var(--line);
  border-left: 4px solid var(--line);
}

.frame-corner-bottom {
  right: 20px;
  bottom: 20px;
  border-right: 4px solid var(--line);
  border-bottom: 4px solid var(--line);
}

.player-footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-top: 4px solid var(--line);
  background: var(--mint);
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 900;
}
```

将响应式规则中的 `.avatar-card` 改为 `.player-card`，并用以下移动端规则替换旧状态窗口、头像舞台和悬浮标签规则：

```css
@media (max-width: 860px) {
  .player-card {
    min-height: 0;
  }
}

@media (max-width: 520px) {
  .player-data {
    gap: 10px;
    padding: 10px;
  }

  .portrait-stage {
    min-height: 280px;
  }

  .portrait-frame {
    width: min(72%, 220px);
  }

  .player-footer {
    font-size: 10px;
  }
}
```

- [ ] **步骤 5：运行静态校验并确认通过**

运行：

```bash
node scripts/verify-site.js
```

预期：

```text
Site verification passed
```

- [ ] **步骤 6：提交静态 Hero 与 HUD**

```bash
git add index.html styles.css scripts/verify-site.js
git commit -m "feat: redesign homepage hero player HUD"
```

### 任务 2：用失败契约驱动单句打字循环

**文件：**
- 创建：`script.js`
- 修改：`scripts/verify-site.js:4-30`
- 修改：`scripts/verify-site.js:32-85`
- 修改：`index.html:10-12`
- 修改：`index.html:35-38`
- 修改：`styles.css` 的 `.typewriter-quote` 后方与文件末尾

- [ ] **步骤 1：先让校验脚本要求打字脚本和减少动态效果规则**

在路径声明中加入：

```js
const scriptPath = path.join(root, 'script.js')
```

在文件存在检查中加入：

```js
expectFile(scriptPath, 'typewriter script')
```

在读取资源处加入：

```js
const script = fs.readFileSync(scriptPath, 'utf8')
```

在 `requiredHtml` 中加入：

```js
'<script src="script.js" defer></script>',
'data-typewriter="What I cannot create, I do not understand."',
'class="typewriter-text"',
'class="typewriter-cursor"'
```

在 CSS 检查数组中加入：

```js
'.typewriter-cursor',
'@media (prefers-reduced-motion: reduce)'
```

在 PNG 签名检查之前加入：

```js
for (const fragment of [
  'What I cannot create, I do not understand.',
  "window.matchMedia('(prefers-reduced-motion: reduce)')",
  'window.setTimeout(tick, 70)',
  'window.setTimeout(tick, 1800)',
  'window.setTimeout(tick, 35)',
  'window.setTimeout(tick, 450)'
]) {
  if (!script.includes(fragment)) {
    fail(`script.js should include ${fragment}`)
  }
}
```

- [ ] **步骤 2：运行校验并确认脚本缺失**

运行：

```bash
node scripts/verify-site.js
```

预期：退出码非零，错误包含：

```text
typewriter script is missing: script.js
```

- [ ] **步骤 3：在 HTML 中加载脚本并标记渐进增强内容**

在样式表标签之后加入：

```html
<script src="script.js" defer></script>
```

将静态引文段落替换为：

```html
<p
  class="typewriter-quote"
  data-typewriter="What I cannot create, I do not understand."
  aria-label="What I cannot create, I do not understand."
>
  <span class="typewriter-text" aria-hidden="true">What I cannot create, I do not understand.</span><span class="typewriter-cursor" aria-hidden="true"></span>
</p>
```

- [ ] **步骤 4：实现光标与减少动态效果样式**

紧跟 `.typewriter-quote` 加入：

```css
.typewriter-cursor {
  display: inline-block;
  width: 0.7ch;
  height: 1.05em;
  margin-left: 0.12em;
  background: var(--pink);
  transform: translateY(0.16em);
  animation: cursor-blink 0.72s steps(1, end) infinite;
}

@keyframes cursor-blink {
  50% {
    opacity: 0;
  }
}
```

在文件末尾加入：

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .typewriter-cursor {
    animation: none;
  }
}
```

- [ ] **步骤 5：创建最小打字状态机**

创建 `script.js`：

```js
const typewriter = document.querySelector('[data-typewriter]')

if (typewriter) {
  const text = typewriter.dataset.typewriter
  const output = typewriter.querySelector('.typewriter-text')
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (output && text && !reducedMotion.matches) {
    let index = 0
    let deleting = false

    output.textContent = ''

    const tick = () => {
      output.textContent = text.slice(0, index)

      if (!deleting && index < text.length) {
        index += 1
        window.setTimeout(tick, 70)
        return
      }

      if (!deleting) {
        deleting = true
        window.setTimeout(tick, 1800)
        return
      }

      if (index > 0) {
        index -= 1
        window.setTimeout(tick, 35)
        return
      }

      deleting = false
      window.setTimeout(tick, 450)
    }

    tick()
  }
}
```

- [ ] **步骤 6：检查脚本语法并运行站点校验**

运行：

```bash
node --check script.js
node scripts/verify-site.js
```

预期两条命令退出码均为 `0`，第二条输出：

```text
Site verification passed
```

- [ ] **步骤 7：提交打字循环**

```bash
git add index.html styles.css script.js scripts/verify-site.js
git commit -m "feat: add looping typewriter quote"
```

### 任务 3：执行最终定向验证

**文件：**
- 验证：`index.html`
- 验证：`styles.css`
- 验证：`script.js`
- 验证：`scripts/verify-site.js`

- [ ] **步骤 1：运行所有适用于本仓库的定向检查**

```bash
node --check script.js
node scripts/verify-site.js
git diff --check origin/main...HEAD
```

预期：

- `node --check script.js` 无输出并退出 `0`。
- `node scripts/verify-site.js` 输出 `Site verification passed`。
- `git diff --check origin/main...HEAD` 无输出并退出 `0`。

- [ ] **步骤 2：确认改动范围没有扩散到后续页面内容或部署配置**

运行：

```bash
git diff --stat origin/main...HEAD
git diff --name-only origin/main...HEAD
```

预期文件列表只包含：

```text
.gitignore
docs/superpowers/plans/2026-07-28-homepage-hero-player-hud.md
docs/superpowers/specs/2026-07-27-homepage-hero-player-hud-design.md
index.html
script.js
scripts/verify-site.js
styles.css
```

本次改动是局部静态页面变更，仓库没有包管理配置或全局测试套件，因此不运行与风险不匹配的全局验证。

- [ ] **步骤 3：检查提交与工作区状态**

```bash
git log --oneline -3
git status --short --branch
```

预期最近提交依次包含：

```text
feat: add looping typewriter quote
feat: redesign homepage hero player HUD
docs: add homepage hero player HUD implementation plan
```

工作区应无未提交文件。
