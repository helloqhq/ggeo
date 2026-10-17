# Google 统计配置

配置日期：2026-10-18（Asia/Shanghai）。

## Google Analytics 4

- 媒体资源：`ggeo.ai`，ID `559436463`，账号 `24942913`。
- [管理与报告入口](https://analytics.google.com/analytics/web/#/a24942913p559436463/reports/intelligenthome)。
- 数据流：`ggeo.ai Web`，网址 `https://ggeo.ai`，数据流 ID `16149976731`。
- 衡量 ID：`G-XTJ8ZHP8TT`，在 `data/site.json` 的 `googleAnalyticsId` 中维护。
- 报告时区：中国时间（UTC+08:00）；币种：人民币。
- 增强型衡量：页面浏览、滚动、出站点击、网站搜索、文件下载；关闭自动表单互动与视频互动。
- `src/analytics.mjs` 在访客主动同意访问分析后，才在生产主机名加载 Google 代码。未选择或拒绝时不加载 Google 代码，也不发送无 Cookie 统计请求。本地与预览域名不发送统计，根目录跳转不重复发送页面浏览。
- 分析存储默认 denied，同意后更新为 granted；广告存储、广告用户数据和广告个性化始终为 denied，Google 信号与广告个性化信号保持关闭。“接受全部”只接受本站当前提供的访问分析。
- `src/cookie-consent.mjs` 保存 180 天的偏好，并在中英页面共享；撤回时先设置 GA 停用标志、清理可访问的第一方 GA Cookie，再刷新页面。详见 [Cookie 偏好功能](cookie-preferences.md)。
- 页面和查询词会进入统计；不采集推荐表单内容。中英隐私政策已同步说明数据用途与 Cookie。

## Search Console

- 资源：`sc-domain:ggeo.ai`，覆盖整个域名。
- [Search Console 入口](https://search.google.com/search-console?resource_id=sc-domain%3Aggeo.ai)。
- 已在 Cloudflare 添加根域名 TXT：`google-site-verification=cEVXAcxbNv3ccBq7zQfVvWlsJuttR6rBywx4tQ-zqyM`，TTL Auto，Google 已确认所有权验证成功。保留该记录以维持验证，原 DNS 记录保留。
- 已提交 `https://ggeo.ai/sitemap.xml`。列表最初短暂显示“无法抓取”，随后详情显示“已成功处理站点地图”，发现 60 个网页。成功处理不代表已完成收录，搜索表现与索引数据需等待 Google 处理。
- 已将域名资源关联到 GA4 的 `ggeo.ai Web` 数据流，Google 显示“链接已创建”，关联日期为 2026-10-18。

## 验证

- `npm run validate`、`npm run build`、`npm test` 检查数据、全部静态页面及 HTTP 行为。
- 统计测试覆盖同意前阻断、生产域名同意后加载、本地与预览域名禁用、根目录跳转排除、单次配置、广告信号限制及撤回停用。偏好测试覆盖拒绝、自定义、关闭不保存、180 天到期、跨页记忆、跨标签页撤回及存储不可用。
- 英文首页与中文隐私页浏览器预览正常，本地页面没有 Google 统计请求。
- Cookie 设置功能加入前，生产提交 `ab79543` 已经由 [GitHub Pages 工作流](https://github.com/helloqhq/ggeo/actions/runs/39064735800) 成功部署。该版本的中英 `page_view` 请求曾获 HTTP 204 响应，确认当时 Google 已接收事件。
- Cookie 设置功能已于 2026-10-18 随提交 `5784487` 发布，[GitHub Pages 工作流](https://github.com/helloqhq/ggeo/actions/runs/39071398652) 成功。线上已验证同意前零 Google 请求、接受后加载一次 GA4、跨语言共享及撤回后刷新并清理 GA Cookie。详见 [Cookie 偏好功能](cookie-preferences.md) 和 [部署记录](deployment.md)。

Google 代码实现依据：[页面浏览衡量](https://developers.google.com/analytics/devguides/collection/ga4/views)、[隐私控制](https://developers.google.com/tag-platform/security/guides/privacy)。
