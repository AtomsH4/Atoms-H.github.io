# GitHub Pages 根路径迁移实现计划

**目标：** 将博客发布到 `https://atomsh4.github.io/blog/` 并兼容已有页面链接。

**架构：** 使用 GitHub 个人站点，旧仓库路径通过专用静态页面跳转；原有题解路径继续使用 Astro redirects。共享路径工具保持现有实现。发布范围仅包含迁移改动。

**技术栈：** Astro、Vitest、Playwright、GitHub Actions / Pages。

- [x] 在 `tests/e2e/pages-migration.spec.ts` 验证 `/blog/`、根路径资源和旧入口跳转；运行迁移测试，确认当前配置无法满足新地址。
- [x] 在 `astro.config.mjs` 将 `base` 改为 `/`，题解映射迁到 `config/note-redirects.mjs` 并改用 `/notes/.../`。在 `src/pages/Atoms-H.github.io/[...path].astro` 为六个顶层入口、已发布博客/笔记和原题解地址生成跳转页，保留查询参数和锚点并提供无 JavaScript 回退。
- [x] 更新 `src/components/SiteFooter.astro`、`src/pages/about.astro` 和已发布博客 Markdown 的旧站点路径；调整四个现有 E2E 文件到根路径；保留路径工具的子路径测试并补充根路径覆盖。
- [x] 运行 `npm test`、`npm run build`、`npm run test:e2e`，检查构建产物不存在指向旧前缀的正文或资源链接，审查 diff 并提交。
- [ ] 通过 GitHub API 重命名仓库为 `atomsh4.github.io`，更新 origin，推送迁移提交到 main；检查 Actions 和线上新地址、旧页面跳转及资源。
- [ ] 将迁移提交同步回原工作区，保留用户已有改动，必要时仅调整未发布内容的部署路径。
