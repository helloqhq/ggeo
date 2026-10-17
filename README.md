# ggeo.ai

深色、双语、SEO 优先的 GEO 工具目录。纯静态运行，无后端、数据库或前端框架运行时；Node.js 在构建时将 JSON 和模板组合成完整 HTML。运行与构建不需要安装第三方依赖。

## 本地运行

需要 Node.js 22 或更新版本：

```sh
npm run dev
```

访问 `http://127.0.0.1:4321/en/`。中文入口 `/zh/`；修改 `data/`、`src/` 或 `public/` 会自动重新构建，浏览器手动刷新即可。可通过 `PORT=端口号 npm run dev` 更换端口。

生产构建与本地预览：

```sh
npm run validate
npm run build
npm test
npm run preview
```

输出目录为 `dist/`。初版包含 16 个真实工具、8 类目录、64 个静态 HTML 文件（含默认入口与 404）。工具资料均标记官方来源和核验日；未做实际使用测试，未确认的收费模式标记 Unknown。详情中的平台列表是官方资料支持的部分平台，实际可用性和套餐限制以厂商为准。

## 文件结构

```text
data/                    JSON 内容与运营配置
src/templates.mjs        首页、分类、详情、搜索及辅助页模板
src/components.mjs       服务端与搜索共享的卡片、图标及转义函数
src/app.mjs              浏览器搜索、分类状态、邮件草稿与 JSON 下载
src/analytics.mjs        生产域名的 Google Analytics 4 加载
src/styles.css           深色视觉、响应式、焦点与减少动态效果适配
scripts/                 数据校验、静态构建、本地开发/预览服务器
tests/                   内容约束、静态内链、SEO 与 HTTP 行为检查
public/                  favicon、静态托管配置、可选图片
skills/ggeo-data-update/  可复用的数据更新 skill
skills/ggeo-site-collect/ 全网发现、筛选与双语收录新 GEO 工具的 skill
docs/                    PRD、原型、决策与验收记录
```

`data/tools.json` 独立维护所有工具资料；`categories.json` 维护分类描述和选型建议；`ui.json` 维护界面翻译；`pages.json` 维护法务说明；`site.json` 维护邮箱、域名、联盟、广告和友情链接。生成文件不作为数据编辑入口。

## 通过 agent 更新数据

直接向 agent 提供仓库内 skill 路径，例如：

> 使用 `skills/ggeo-data-update/SKILL.md`，核验并更新 Peec AI 的资料，保留稳定 slug，完成中英内容，运行校验、构建与测试。

或：

> 使用 `skills/ggeo-data-update/SKILL.md` 审核这份工具推荐 JSON；先核验来源与重复官网，将待我决定的工具保留为 draft。

发现并收录新工具时：

> 使用 `skills/ggeo-site-collect/SKILL.md`，全网搜集并添加最多 10 个与本站主题契合、通过相关性与合法合规风险筛选的 GEO 工具，完成官网查重、官方来源核验、中英 JSON 录入及验证，报告暂缓原因。

仅研究时可明确要求“只搜集候选，不修改目录”。搜集 skill 默认将合格新工具写入 `data/tools.json`，不批量添加友情链接；核验不足的站点留在搜集记录。每轮记录保存在 `docs/research/`，以日期命名。

两个 skill 作为项目内可移植交付物保存在 `skills/`，尚未复制到个人全局技能目录；根目录 `AGENTS.md` 会引导本项目的相应任务。搜集 skill 复用数据更新 skill 的字段约定，需要保留二者的同级目录结构。

公开工具记录必须完成双语、有真实官方来源和核验日。`draft` 与 `hidden` 不生成工具页面、卡片、搜索记录或 sitemap 项；删除已发布 slug 会使原 URL 返回 404，确需迁移时应增加托管平台的 301 规则。

## 工具提交与商业配置

提交表单校验必填项、URL、描述长度和已公开官网重复情况，并有蜜罐字段。提交按钮在访客的邮件客户端准备草稿，收件人为 `helloqhq123@gmail.com`，访客需要自行发送。另可下载待审 JSON 后邮件发送。页面不会声称已收到邮件，也不自动发布工具；浏览器校验不替代人工审核或服务端反垃圾。

广告、联盟链接和友情链接默认关闭或为空。编辑 `data/site.json` 配置后构建生效；联盟链接在详情页自动披露并附 sponsored 属性，赞助卡片显示明确标签。启用商业关系前，需同步更新法务说明中“初版未启用”的表述。

## Google Analytics 与 Search Console

`data/site.json` 的 `googleAnalyticsId` 配置本站 GA4 衡量 ID，当前为 `G-XTJ8ZHP8TT`。共用模板会为所有中英页面加载统计模块，仅当浏览器主机名等于 `site.url` 的生产主机名时才加载 Google 代码；本地预览、其他预览域名和根目录跳转不计入统计。清空或移除此字段可关闭代码加载。

GA4 数据流 `ggeo.ai Web` 收集页面浏览、滚动、出站点击、站内搜索及文件下载；已关闭自动表单与视频互动事件。代码关闭 Google 信号和广告个性化，隐私政策已同步说明 Cookie 和数据用途。搜索词及来源网址可能进入统计，请勿在搜索框中输入敏感资料。

Search Console 使用 `sc-domain:ggeo.ai` 域名资源，通过 Cloudflare 根域名 TXT 记录验证所有权。验证依赖 DNS，无需在页面重复添加验证标签；请保留该 TXT 记录。站点地图为 `https://ggeo.ai/sitemap.xml`。Google 管理端配置与上线检查见 [Google 统计配置记录](docs/google-analytics.md)。

## 静态部署

生产仓库为 [helloqhq/ggeo](https://github.com/helloqhq/ggeo)，站点域名为 [ggeo.ai](https://ggeo.ai/)。`.github/workflows/pages.yml` 会在每次推送到 `main` 后依次执行数据校验、静态构建与测试，并将 `dist/` 发布到 GitHub Pages；也可从 Actions 手动运行。Pages 设置使用 GitHub Actions 来源，并绑定 `ggeo.ai`；`public/CNAME` 和 `.nojekyll` 会复制至静态产物。DNS 配置及上线核验见 [部署记录](docs/deployment.md)。

将 `dist/` 作为静态站点根目录发布，使用目录索引路由，支持 `/en/tools/peec-ai/` 这类地址。默认生产域名配置为 `https://ggeo.ai`；改域名时修改 `data/site.json` 的 `url` 后重新构建 canonical、hreflang、sitemap 和 robots。

- Cloudflare Pages / Netlify：构建命令 `npm run build`，发布目录 `dist`；随构建附带 `_redirects` 和 `_headers`。使用平台默认静态 404 行为，不设置 SPA 全路径回退。
- Nginx：`index index.html;`，配置 `location / { try_files $uri $uri/ =404; }` 及 `error_page 404 /404.html;`，根路径可 301 到 `/en/`。
- 其他平台：为未知地址返回 `404.html` 与 HTTP 404；不能把所有地址重写为首页并返回 200。

本地服务器已验证真正的 HTTP 404、根路径跳转、目录尾斜杠跳转与模块 MIME 类型；最终部署平台的状态码和规则需在上线后复查。生产环境已发布至 GitHub Pages，自定义域名与 HTTPS 状态以部署记录为准。
