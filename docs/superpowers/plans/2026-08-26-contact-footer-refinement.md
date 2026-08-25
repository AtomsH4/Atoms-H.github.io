# Contact 页脚优化实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 Contact 区域优化为单层横向玻璃页脚，并把右侧外链改为紧凑玻璃胶囊。

**架构：** 保留 `section.contact-section` 作为唯一的大型玻璃表面，内部使用透明的 `.contact-intro` 顶部信息行和 `.contact-links` 底部链接行。现有静态验证脚本先定义结构与样式契约，再修改 HTML/CSS 使其通过。

**技术栈：** 静态 HTML、CSS、Node.js 验证脚本、GitHub Pages

---

## 文件结构

- 修改 `scripts/verify-site.js`：增加 Contact 单层结构与链接胶囊的回归契约。
- 修改 `index.html`：简化 Contact 文案和内部结构，保留三个既有链接目标。
- 修改 `styles.css`：移除内部面板样式，建立横向页脚与响应式胶囊链接。

### 任务 1：定义 Contact 单层玻璃契约

**文件：**
- 修改：`scripts/verify-site.js`

- [ ] **步骤 1：加入失败的结构检查**

在 HTML 验证部分加入以下要求：

```js
for (const fragment of [
  'class="contact-intro"',
  'Available for thoughtful digital quests.',
  '<span>GitHub</span><span>AtomsH4 ↗</span>',
  '<span>Cnblogs</span><span>atomsh ↗</span>',
  '<span>GitHub Pages</span><span>Visit ↗</span>'
]) {
  if (!html.includes(fragment)) {
    fail(`index.html should include ${fragment}`)
  }
}
```

并加入 CSS 契约：

```js
expectCssRule('.contact-section', [
  'grid-template-columns: 1fr'
])

expectCssRule('.contact-intro', [
  'display: flex',
  'justify-content: space-between',
  'background: transparent',
  'box-shadow: none'
])

expectCssRule('.contact-links', [
  'flex-wrap: wrap',
  'background: transparent',
  'box-shadow: none'
])

expectCssRule('.contact-links a', [
  'border-radius: 999px',
  'background: rgba(255, 255, 255, 0.5)'
])

expectCssRule('.contact-links a:hover,\n.contact-links a:focus-visible', [
  'transform: translateY(-2px)'
])
```

- [ ] **步骤 2：运行验证并确认红灯**

运行：

```bash
node scripts/verify-site.js
```

预期：FAIL，首先报告缺少 `class="contact-intro"`。

- [ ] **步骤 3：提交验证契约**

```bash
git add scripts/verify-site.js
git commit -m "test: define single-layer contact footer contract"
```

### 任务 2：实现横向玻璃页脚

**文件：**
- 修改：`index.html`
- 修改：`styles.css`

- [ ] **步骤 1：简化 Contact 标记**

将 Contact 内部替换为：

```html
<div class="contact-intro">
  <div>
    <h2 id="contact-title">Connect</h2>
    <p>Available for thoughtful digital quests.</p>
  </div>
  <p class="contact-identity"><span>guest@atomsh4</span> /profile</p>
</div>

<div class="contact-links" aria-label="Contact links">
  <a href="https://github.com/AtomsH4"><span>GitHub</span><span>AtomsH4 ↗</span></a>
  <a href="https://www.cnblogs.com/atomsh"><span>Cnblogs</span><span>atomsh ↗</span></a>
  <a href="https://atomsh4.github.io/Atoms-H.github.io/"><span>GitHub Pages</span><span>Visit ↗</span></a>
</div>
```

- [ ] **步骤 2：建立单层 CSS 布局**

将 `.contact-section` 设为单列，内部 `.contact-intro` 与 `.contact-links` 清除背景、边框、阴影和滤镜。`.contact-intro` 让左侧标题文案与右侧身份信息横向对齐；`.contact-links` 在下一行使用横向可换行胶囊：

```css
.contact-intro,
.contact-links {
  border: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.contact-links a {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 10px 15px;
  border: 1px solid var(--glass-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 22px rgba(73, 76, 124, 0.08);
}
```

悬停与键盘焦点使用 `transform: translateY(-2px)`；在 `860px` 以下把 Contact 改为单列，在 `520px` 以下让链接占满可用宽度。

- [ ] **步骤 3：运行验证并确认绿灯**

运行：

```bash
node --check script.js
node scripts/verify-site.js
git diff --check
```

预期：`Site verification passed`，其余命令退出码为 0。

- [ ] **步骤 4：提交实现**

```bash
git add index.html styles.css
git commit -m "feat: refine contact into glass footer"
```

### 任务 3：合并、推送与部署确认

**文件：**
- 不新增或修改源文件。

- [ ] **步骤 1：在提交后重新验证**

```bash
node --check script.js
node scripts/verify-site.js
git diff --check
git status --short --branch
```

预期：验证通过，工作区干净。

- [ ] **步骤 2：快进合并并推送**

```bash
git switch main
git merge --ff-only codex/contact-footer-refinement
git branch -d codex/contact-footer-refinement
git push origin main
```

预期：无冲突、无强制推送，远程 `main` 更新成功。

- [ ] **步骤 3：确认 Pages 部署与线上内容**

```bash
gh run list --limit 3
curl -fsSL "https://atomsh4.github.io/Atoms-H.github.io/?verify=contact-footer" | rg 'contact-intro|Available for thoughtful digital quests'
```

预期：Pages 工作流成功，线上 HTML 包含新 Contact 结构与文案。
