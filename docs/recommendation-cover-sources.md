# 推荐封面来源审计

推荐页只远程引用权威来源的作品图，不把第三方位图保存进仓库。公开可访问不等于图片已进入公共领域；远程引用仍应保留来源链接，并接受上游 CDN 变动或下线的风险。页面加载失败时使用本站生成的彩色排版封面，不从搜索结果或其他镜像补图。

| Slug | Provider | 来源页 | CORS 检查 | 引用决定 |
| --- | --- | --- | --- | --- |
| `wo-biao-shi-li-jie` | Cover Art Archive | [MusicBrainz release group](https://musicbrainz.org/release-group/695dd59f-d70e-4960-b5fc-e6864eaa2e81) | 支持 | 远程引用发行组封面 |
| `leave-the-door-open` | Cover Art Archive | [MusicBrainz release group](https://musicbrainz.org/release-group/b2518ad1-3d54-4a8a-badb-959893da24d0) | 支持 | 远程引用发行组封面 |
| `gei-zi-ji-de-qing-shu` | Cover Art Archive | [MusicBrainz release group](https://musicbrainz.org/release-group/fe9bf6c3-dbe7-3170-baf4-ebe31d2b40d7) | 支持 | 远程引用发行组封面 |
| `back-in-black` | Cover Art Archive | [MusicBrainz release group](https://musicbrainz.org/release-group/d3bc1a64-7561-3787-b680-0003aa50f8f1) | 支持 | 远程引用发行组封面；删除旧本地 SVG |
| `the-moon-and-sixpence` | Standard Ebooks | [Standard Ebooks repository](https://github.com/standardebooks/w-somerset-maugham_the-moon-and-sixpence) | 支持 | 远程引用官方仓库源封面图 |
| `flowers-for-algernon` | Open Library Covers | [Open Library work](https://openlibrary.org/works/OL515754W) | 支持 | 远程引用封面仓库图片 |
| `to-live` | Open Library Covers | [Open Library work](https://openlibrary.org/works/OL15861449W) | 支持 | 远程引用封面仓库图片 |
| `hospital-playlist` | Netflix | [Netflix title](https://www.netflix.com/title/81239224) | 支持 | 远程引用官方作品页图像 |
| `dear-you` | YouTube | [CMC Pictures 官方预告片](https://www.youtube.com/watch?v=kDPgu6Hxgaw) | 支持 | 远程引用官方预告片缩略图 |
| `neon-genesis-evangelion` | Netflix | [Netflix title](https://www.netflix.com/title/81033445) | 支持 | 远程引用官方作品页图像 |
| `flipped` | Netflix | [Netflix title](https://www.netflix.com/title/70130442) | 支持 | 远程引用官方作品页图像 |

## 使用边界

- Cover Art Archive 图片可公开访问并由 MusicBrainz 社区维护，但原始封面作品不因此进入公共领域。
- Open Library 建议公开页面直接使用 Covers API URL，并链接回相应作品页；本页遵循该引用方式。
- Standard Ebooks 仓库声明源文本与艺术作品在美国属于公共领域，项目贡献以 CC0 方式提供；本页仍远程引用并保留来源，不将这一声明扩展为全球所有地区均无版权风险。
- Netflix 与 YouTube 图片来自官方作品页或官方预告片，仅作作品识别的远程引用，并显示来源入口。
- 仓库不保存这些第三方位图，也不把其公开可见状态描述为授权许可。
- 上游图片、URL 或 CORS 策略可能变化；页面必须保留生成封面作为可用性降级，而不是自动改用未经审计的镜像。
