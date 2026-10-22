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

### Cookie 偏好功能（2026-10-18）

- 功能源码提交：`5784487`；[发布工作流](https://github.com/helloqhq/ggeo/actions/runs/39071398652) 已 completed / success，build 和 deploy 均成功。本地与 CI 的数据校验、构建和 13 项测试全部通过。
- 已核对线上中英首页、两种语言隐私政策、`analytics.mjs`、`cookie-consent.mjs` 和 `styles.css`，均与本地构建逐字节一致。
- 全新浏览器访问中文首页：横幅可用，无 Google 标签或统计请求。接受全部后初始化一次 GA4，产生 Google 标签和统计请求及 `_ga` Cookie；转到英文页面后保留同意。
- 英文页脚重新打开 Cookie 设置并选择仅必要：页面刷新，GA 停用标志开启，无 Google 标签、统计请求或可访问的 GA Cookie；转回中文后仍保持拒绝。未发现浏览器脚本错误。

### 第二轮目录数据（2026-10-18）

- 用户在数据维护完成后明确授权发布。生产源码提交：`72412ba34e1cb1483776baafa9e3fe2bd0e43cf4`；[发布工作流](https://github.com/helloqhq/ggeo/actions/runs/39107365029) 已 completed / success，build 与 deploy 均成功，CI 的校验、构建与测试步骤通过。
- 公开工具由 26 个增至 36 个，仍为固定 8 类，生成 104 个 HTML 页面。新增 10 个工具、26 条官方来源，并补充 Yext Scout 与 AirOps 资料；具体名单、核验与暂缓原因见[本轮研究记录](research/2026-10-18-geo-sites-02.md)。
- HTTPS 线上中英首页、12 个新增或更新工具的中英详情、全部八类中英分类、`assets/directory.json`、`sitemap.xml` 与 `robots.txt` 共 45 个地址均成功读取，内容与本地本次构建逐字节一致。正常 URL 核验，无需绕过缓存。
- 未知地址仍返回真实 HTTP 404。浏览器线上中文搜索 `GEOly` 与英文搜索 `Waikay` 可找到本次新增工具；中文 GEOly 详情的价格、核验日期与官方来源正确，无横向溢出。
- 未修改域名、DNS、统计或商业配置。此部署记录随后以文档提交保存，使用 `[skip ci]` 避免重复发布相同静态产物。

### 第三轮目录数据（2026-10-21）

- 用户在数据维护完成后授权提交与发布。生产源码提交：`fe7af80662f4dbaca86f43dfbf16f76807f778a1`；[发布工作流](https://github.com/helloqhq/ggeo/actions/runs/39608008489) 已 completed / success，build 与 deploy 均成功，CI 数据校验、构建和测试步骤通过。本地 14 项测试通过。
- 公开工具由 36 个增至 45 个，固定 8 类，生成 122 个 HTML 页面。新增 9 个工具，复核 Yext Scout、Profound 与 AirOps；来源、平台与计费边界详见[本轮研究记录](research/2026-10-21-geo-sites.md)。该研究记录中的“未提交、推送或部署”描述数据维护阶段，本节记录其后按用户授权完成的发布。
- 线上中英首页、12 个新增或复核工具的中英详情、全部八类中英分类、`assets/directory.json`、`sitemap.xml` 和 `robots.txt`，共 45 个地址最终均返回 HTTP 200，SHA-256 与本地构建一致。首次核对时，部署前已打开的英文首页仍命中浏览器旧缓存；以原 URL 重新加载后及再次普通读取均匹配新构建。未修改缓存或托管配置。
- 线上目录包含 45 个工具；真实浏览器中文搜索 `MicoSeek` 和英文搜索 `Searchable` 均出现新增卡片。未知地址仍返回 HTTP 404。未修改域名、DNS、统计或商业配置。
- 此部署记录随后以 `[skip ci]` 文档提交保存，避免重复发布相同静态产物。

### 隐私政策与免责声明修订（2026-10-21）

- 用户在修订完成后明确授权提交发布。生产源码提交：`41201c2baf15640987a76fd9a3e03a1a5c4ceaf3`；[发布工作流](https://github.com/helloqhq/ggeo/actions/runs/39613141653) 已 completed / success，build 与 deploy 均成功，CI 数据校验、构建和测试步骤通过；本地 17 项测试通过。
- 发布了中英文隐私政策与免责声明，包括目录角色、信息处理、Cookie 与撤回、邮件推荐、境外服务、权利请求、外链和商业披露及依法不能免除的责任。两页独立版本日期均为 2026-10-21。后续日常数据更新不得改写的规则、内容指纹测试与维护说明同时进入仓库。
- HTTPS 线上四个中英法律页面、中英首页及 `assets/directory.json` 共 7 个地址均返回 HTTP 200，SHA-256 与本地本次构建一致。真实浏览器确认新版正文、版本日期和对应中英切换；选择仅必要后没有 Google 统计请求，无浏览器脚本错误。
- 仍为 45 个公开工具、8 个分类、122 个 HTML 页面。未修改域名、DNS、统计或商业配置。修订阶段的说明见[法律文案维护](legal-content.md)。此发布记录以 `[skip ci]` 文档提交保存，避免重复部署相同静态产物。

### 第四轮目录数据（2026-10-22）

- 用户在数据维护与本地验收完成后明确授权提交和发布。生产源码提交：`0def931bd2d472dff72b7d3b574266f3c734e61e`；[发布工作流](https://github.com/helloqhq/ggeo/actions/runs/39705138689) 的 build 与 deploy 均 completed / success，CI 数据校验、构建、测试步骤全部成功；本地 17 项测试通过。
- 新增 10 个工具、更新 13 个已有条目，公开工具由 45 增至 55，固定 8 类，生成 142 个 HTML 页面。核验日期为 2026-10-22，官方来源与暂缓项见[本轮研究记录](research/2026-10-22-geo-sites.md)。研究记录中的“未提交、推送或部署”描述数据维护阶段，本节记录用户随后授权的发布。
- HTTPS 线上中英首页、23 个新增或更新工具的中英详情、全部八类中英分类、四个中英法律页面，以及 `assets/directory.json`、`sitemap.xml`、`robots.txt`，共 71 个地址均返回 HTTP 200，SHA-256 与本地构建一致。线上搜索数据含 55 个工具，其中本轮 23 条记录的核验日为 2026-10-22；未知地址返回真实 HTTP 404，正文与生成的 404 页面一致。
- 本地实际浏览器检查的 84 个中英页面全部通过，另抽查两种语言的移动端长标题。发布后按用户新偏好尝试 ego-browser，应用提示首次设置尚未完成；该额外线上浏览器抽查未执行，也未绕过首次设置。线上验收以上述 HTTPS 内容比对为准，没有将本地浏览器结果表述为线上浏览器实测。
- 法律页正文、来源、独立日期与测试指纹未改动，线上四个法律页与本地一致。未修改域名、DNS、统计或商业配置。此发布记录另以 `[skip ci]` 文档提交保存，避免重复部署相同静态产物。

### 发布流程

修改 JSON 或源码后提交并推送 `main`。工作流检查不通过时不会部署新站；修复数据或代码后再推送。查看 Actions 成功状态和站点实际内容，不能仅以 git push 成功判定已上线。

GitHub Pages 不读取 Cloudflare Pages/Netlify 的 `_redirects` 与 `_headers`。当前依靠静态目录索引、根页英文跳转、页面自身 noindex 元数据和 GitHub 原生 404；未知路由不能配置 SPA 首页回退。

配置依据：[GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)、[GitHub Pages 自定义工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
