# 首页 Hero 与玩家状态卡改版设计

## 背景

当前首页 Hero 左侧显示 `Gu JiaMing` 与 `AtomsH4` 两级标题，并使用两段偏介绍性质的中文文案。右侧是桌面窗口样式的 `Player Status` 面板、静态像素头像和三枚悬浮信息标签。

本次改版只调整首屏 Hero，不重构后续 Quest、Skill、Project 和 Contact 区块。站点继续使用纯 HTML、CSS 和少量原生 JavaScript，不增加框架、第三方字体或运行时依赖。

## 已确认目标

1. 删除 Hero 左侧可见的 `Gu JiaMing`，只保留 `AtomsH4` 作为主标题。
2. 删除主标题下现有的两段中文介绍。
3. 使用英文名句 `What I cannot create, I do not understand.` 作为唯一文案，不显示引号、作者或出处。
4. 引文使用 `Courier New` 优先的等宽字体栈，并实现单句打字循环。
5. 保留现有静态粉发像素头像，不制作头像动画。
6. 通过裁剪容器放大并居中头像主体，使人物在右侧卡片中更集中。
7. 将 `Player Status` 改造成更接近像素游戏角色面板的 `PLAYER DATA` HUD。
8. 保留站点现有的粉、青、黄、薄荷绿配色、粗像素边框、硬阴影和响应式布局。

## Hero 左侧

Hero 左侧保留现有两枚 `KEEP CODING`、`KEEP PLAYING` 徽章、主操作按钮和 GitHub 按钮。

主标题只显示：

```text
AtomsH4
```

主标题下方只显示：

```text
What I cannot create, I do not understand.
```

引文不添加引号、署名、出处或其他解释。字体栈为：

```css
"Courier New", Courier, monospace
```

引文应预留稳定的最小高度，避免逐字输入和删除时导致按钮或右侧卡片上下跳动。

## 打字循环

页面加载后，引文执行以下循环：

1. 以约 `70ms` 每字符的速度逐字输入。
2. 完整显示后停留约 `1800ms`。
3. 以约 `35ms` 每字符的速度逐字删除。
4. 删除完成后停留约 `450ms`，重新开始输入。

文字末尾显示粉色像素块光标，并以阶梯式透明度变化模拟闪烁。

渐进增强与无障碍要求：

- HTML 初始内容包含完整引文，JavaScript 可用时才切换为逐字动画，避免脚本失败时出现空白。
- 动画文字对辅助技术暴露稳定的完整句子，动态字符和光标不产生重复播报。
- 当系统设置 `prefers-reduced-motion: reduce` 时，不执行输入、删除或光标闪烁，直接显示完整引文。
- 动画不依赖网络、第三方库或计时服务。

## 右侧 PLAYER DATA HUD

右侧卡片继续使用现有 Hero 双栏中的同一位置和宽度，但内部结构改为：

1. 深色标题条：`PLAYER DATA`。
2. 角色信息区：
   - `CLASS`
   - `PROGRAMMER`
   - `LV. ???`
3. 经验区：
   - 标签 `EXP`
   - 像素分段进度条
   - 数值 `72%`
4. 头像展示区：
   - 使用现有 `assets/avatar-pixel.png`
   - 使用正方形裁剪框与 `overflow: hidden`
   - 放大图像并微调位置，使粉发角色主体水平、垂直居中
   - 保持 `image-rendering: pixelated`
5. 底部状态条：
   - `STATUS: CODING`
   - `HP ▰▰▰▰▰`

旧的桌面窗口圆点、`Playing / Learning / Mode / Style` 四宫格和 `AI Agent +12 / Figma +8 / TS / React` 悬浮标签全部移除。

## 响应式行为

- 桌面端继续使用现有左右双栏 Hero。
- `860px` 以下继续切换为单栏，左侧内容在上、PLAYER DATA HUD 在下。
- 小屏幕上引文允许自然换行，打字光标跟随文字末尾，不产生横向滚动。
- 头像裁剪框随卡片宽度缩放，并保持正方形比例。
- HUD 字段在窄屏上仍保持可读，不隐藏角色、等级或经验信息。

## 元数据与内容一致性

页面描述中不再使用 `Gu JiaMing`，统一以 `AtomsH4` 表述站点身份。导航品牌、页面标题和现有仓库链接保持不变。

## 实现边界

本次修改限于：

- `index.html`
- `styles.css`
- 新增一份小型原生 JavaScript 文件，用于打字循环
- `scripts/verify-site.js`
- 必要的仓库忽略规则和设计/计划文档

不修改后续内容区块的文案、项目列表、链接、导航结构、部署方式或 Jekyll 配置。不新增图片、字体文件、外部 CDN、构建工具或包管理配置。

## 验证

自动验证应覆盖：

- Hero 中不再出现 `Gu JiaMing`。
- Hero 中存在 `AtomsH4` 和完整英文引文。
- 页面加载打字脚本。
- HUD 中存在 `PLAYER DATA`、`PROGRAMMER`、`LV. ???`、`EXP` 和 `72%`。
- 头像仍使用有效 PNG，且样式包含像素渲染、裁剪和居中规则。
- CSS 保留现有 `860px` 响应式断点，并包含减少动态效果规则。
- 页面仍包含原有 Quest、Skill、Project、Contact 区块与主要外链。

实施后运行仓库现有的 `node scripts/verify-site.js`。本次是局部静态页面修改，不需要运行全局测试套件。
