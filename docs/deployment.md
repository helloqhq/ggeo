# GitHub Pages 部署记录

日期：2026-10-18（Asia/Shanghai）。用户明确授权推送 GitHub、发布网站并将 Cloudflare 管理的 ggeo.ai 指向 GitHub Pages。

## 发布配置

- 仓库：<https://github.com/helloqhq/ggeo>，公开仓库，默认分支 `main`。
- 发布来源：GitHub Actions。工作流 `.github/workflows/pages.yml` 使用 Node.js 24，先校验数据、构建、测试，再上传 `dist/` 并发布。
- 已确认成功的首个部署：<https://github.com/helloqhq/ggeo/actions/runs/39062990066>，源码提交 `d576f51`。
- 自定义域名：`ggeo.ai`。在改 DNS 前已先保存到 GitHub Pages 设置。GitHub 的域名 DNS 检查已成功。
- 构建产物包含 `CNAME` 与 `.nojekyll`。GitHub Actions 部署仍以仓库 Pages 的自定义域名设置为准，不能仅靠修改 CNAME 文件变更绑定。

## Cloudflare DNS

| 类型 | 名称 | 内容 | 代理 | TTL |
| --- | --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only | Auto |
| A | `@` | `185.199.109.153` | DNS only | Auto |
| A | `@` | `185.199.110.153` | DNS only | Auto |
| A | `@` | `185.199.111.153` | DNS only | Auto |
| CNAME | `www` | `helloqhq.github.io` | DNS only | Auto |

原有 TXT 验证记录保持不变。Cloudflare DNS-over-HTTPS 已返回全部四条 A 记录；Google DNS-over-HTTPS 已返回 www 的正确 CNAME。

原配置供必要时人工回退参考：根域名 A 为 `52.40.42.113` 与 `44.232.173.249`，均 Proxied；www 的 CNAME 为 `ggeo.ai`，Proxied。需要回退时应确认当时目标服务仍可用，并同步处理 Pages 的自定义域名绑定。

## 线上核验

- 英文 `/en/`、中文 `/zh/` 均返回 HTTP 200，正文与本地构建逐字节一致。
- `/assets/app.mjs` 返回 HTTP 200，MIME 为 `text/javascript; charset=utf-8`，内容与构建一致。
- 未知地址返回真正的 HTTP 404，正文与生成的 `404.html` 一致。
- GitHub 已签发有效 HTTPS 证书，`https://ggeo.ai/en/` 返回 200；已在 Pages 设置启用 Enforce HTTPS，刷新设置页后仍为勾选状态。新 HTTP 路径返回 301 到同路径 HTTPS；`https://www.ggeo.ai/en/` 返回 301 到 `https://ggeo.ai/en/`。旧 HTTP 页面可能在原有 600 秒边缘缓存过期前短暂返回之前的 200 响应。
- HTTPS 线上中文搜索“引用”返回 10 条结果，并显示所属分类。sitemap.xml 与 robots.txt 均返回 HTTPS 200，未知页面返回 HTTPS 404。

## 后续发布

修改 JSON 或源码后提交并推送 `main`。工作流检查不通过时不会部署新站；修复数据或代码后再推送。查看 Actions 成功状态和站点实际内容，不能仅以 git push 成功判定已上线。

GitHub Pages 不读取 Cloudflare Pages/Netlify 的 `_redirects` 与 `_headers`。当前依靠静态目录索引、根页英文跳转、页面自身 noindex 元数据和 GitHub 原生 404；未知路由不能配置 SPA 首页回退。

配置依据：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
