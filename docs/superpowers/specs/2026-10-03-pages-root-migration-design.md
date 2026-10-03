# GitHub Pages 根路径迁移

用户已确认将 `AtomsH4/Atoms-H.github.io` 重命名为 `AtomsH4/atomsh4.github.io`，博客目标地址为 `https://atomsh4.github.io/blog/`。

采用 GitHub 个人主页站点，不绑定自定义域名。只删除 Astro 的子路径配置无法改变 GitHub 的托管位置；自定义域名需要额外的域名和 DNS 配置，因此本次采用仓库重命名。

沿用 `BASE_URL` 和 `joinBasePath`。`joinBasePath` 已支持根路径，无需修改共享逻辑。更新现有文章、图片、站外主页链接及端到端测试中的部署路径。保留通用路径工具对子路径部署的测试覆盖。

旧入口、博客正文和笔记正文由 `src/pages/Atoms-H.github.io/[...path].astro` 生成静态跳转页；原先从博客迁入笔记的七篇题解直接转到新的笔记地址。题解映射集中在 `config/note-redirects.mjs`，供原有 Astro redirects 与迁移页面共用。

实测 Astro 原生 meta refresh 会丢失查询参数和推荐作品锚点，因此迁移页面使用 `location.replace` 保留 `search` 与 `hash`，目标路径保持末尾斜杠。禁用 JavaScript 时使用 noscript meta refresh 和可点击链接继续访问对应页面；此回退只保留路径。无需修改共享路由工具或构建流程。

在隔离工作区中实施和发布，不提交现有工作区尚未发布的文章、项目或测试改动。完成后同步迁移提交回原工作区并保留这些改动。

验证包括单元测试、Astro 检查与构建、完整端到端测试、新旧地址访问及文章图片加载。只有本地验证通过后才重命名远程仓库、推送迁移提交、检查 Actions 部署和线上页面。
