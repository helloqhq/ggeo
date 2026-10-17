# Google 统计配置

配置日期：2026-10-18（Asia/Shanghai）。

## Google Analytics 4

- 媒体资源：`ggeo.ai`，ID `559436463`，账号 `24942913`。
- [管理与报告入口](https://analytics.google.com/analytics/web/#/a24942913p559436463/reports/intelligenthome)。
- 数据流：`ggeo.ai Web`，网址 `https://ggeo.ai`，数据流 ID `16149976731`。
- 衡量 ID：`G-XTJ8ZHP8TT`，在 `data/site.json` 的 `googleAnalyticsId` 中维护。
- 报告时区：中国时间（UTC+08:00）；币种：人民币。
- 增强型衡量：页面浏览、滚动、出站点击、网站搜索、文件下载；关闭自动表单互动与视频互动。
- `src/analytics.mjs` 设置广告存储、广告用户数据和广告个性化为 denied，并关闭 Google 信号与广告个性化信号。统计模块只在生产主机名加载 Google 代码，本地与预览域名不发送统计，根目录跳转不重复发送页面浏览。
- 页面和查询词会进入统计；不采集推荐表单内容。中英隐私政策已同步说明数据用途与 Cookie。

## Search Console

- 资源：`sc-domain:ggeo.ai`，覆盖整个域名。
- [Search Console 入口](https://search.google.com/search-console?resource_id=sc-domain%3Aggeo.ai)。
- 已在 Cloudflare 添加根域名 TXT：`google-site-verification=cEVXAcxbNv3ccBq7zQfVvWlsJuttR6rBywx4tQ-zqyM`，TTL Auto，Google 已确认所有权验证成功。保留该记录以维持验证，原 DNS 记录保留。
- 已提交 `https://ggeo.ai/sitemap.xml`，Google 显示“已成功提交站点地图”。提交不代表已完成收录，搜索表现与索引数据需等待 Google 处理。

## 验证

- `npm run validate`、`npm run build`、`npm test` 检查数据、全部静态页面及 HTTP 行为。
- 统计测试覆盖生产域名加载、本地与预览域名禁用、根目录跳转排除、单次配置及广告信号限制。
- 英文首页与中文隐私页浏览器预览正常，本地页面没有 Google 统计请求。

Google 代码实现依据：[页面浏览衡量](https://developers.google.com/analytics/devguides/collection/ga4/views)、[隐私控制](https://developers.google.com/tag-platform/security/guides/privacy)。
