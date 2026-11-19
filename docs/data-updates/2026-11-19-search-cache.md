# 2026-11-19 站内搜索索引缓存修复

## 现象

AgentSEO 已部署成功，`https://ggeo.ai/en/tools/agentseo/` 与中文详情页均返回 200，但在站内搜索 `AgentSEO` 时用户端没有结果。

## 诊断

- 线上 `/assets/directory.json` 已包含 `agentseo`（113 条），真实浏览器打开 `https://ggeo.ai/en/search/?q=AgentSEO` 返回 1 条结果，说明数据和匹配逻辑正常。
- GitHub Pages 对 `/assets/directory.json` 返回 `cache-control: max-age=600`。搜索索引由浏览器 `fetch` 后在内存中复用，部署前访问过站点的浏览器可能继续使用旧索引，最多滞后 10 分钟。
- 这不是数据未发布或搜索匹配缺陷，而是静态托管缓存加客户端索引导致的部署后短暂不一致。

## 修复

`src/app.mjs` 的索引请求改为：

```js
fetch('/assets/directory.json', {cache: 'no-cache'})
```

浏览器每次加载搜索页都会按 ETag 重新验证索引；内容未变时仍可复用缓存，内容已变时立即取得新版本，不再等 10 分钟过期。

## 验证

- `npm run validate`、`npm run build`、`npm test` 全部通过。
- 部署后用真实浏览器访问 `https://ggeo.ai/en/search/?q=AgentSEO`，状态为 `1 tools · Results for “AgentSEO”`，结果卡片为 AgentSEO。
- 已存在的旧页面若仍持有旧索引，刷新一次即可；此修复保证后续内容更新无需等待 CDN 缓存过期。

## 变更文件

- `src/app.mjs`：索引请求增加 `cache: 'no-cache'`。
- `skills/ggeo-data-update/references/lessons.md`：新增 L-13。
- 未修改 `data/`、法律文案、测试或部署配置。
