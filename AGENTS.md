# ggeo.ai 项目约定

## 结构与构建管线
- 双语（en/zh）、SEO 优先的 GEO 工具目录：Node 在构建时把 `data/*.json` 与模板组合成完整 HTML。运行时保持纯静态，不添加后端或数据库；构建与运行零第三方依赖，不要引入 npm 依赖。需要 Node ≥ 22。
- 内容源在 `data/*.json`（`site.json` 管域名、邮箱、联盟、广告和友情链接；`categories.json`、`tools.json`、`ui.json` 界面翻译、`pages.json` 法务文案），模板和浏览器交互在 `src/`（`templates.mjs` 渲染、`components.mjs` 服务端与搜索共享、`app.mjs` 浏览器行为、`analytics.mjs` GA4）。生成文件不作为数据编辑入口。
- `scripts/build.mjs` 为 en/zh 生成全部页面、sitemap.xml、robots.txt 和 404，输出到 `dist/`；`dist/` 为构建产物，不能直接编辑。`scripts/serve.mjs` 仅是本地 dev/preview 服务器，不是生产组件。

## 常用命令
- `npm run dev`：先构建再启动本地服务（默认 127.0.0.1:4321，可用 `PORT=` 更改），修改 `data/`、`src/` 或 `public/` 会自动重建。
- `npm run preview`：只服务已有 `dist/`，需先 `npm run build`。
- 内容变更后运行 `npm run validate`、`npm run build`、`npm test`。浏览器受影响时，启动预览检查对应中英页面。测试中的本地 HTTP 检查需要允许回环网络监听。

## 数据约定
- 所有内容字段必须提供中英双语。校验强制 8 个固定分类 slug 及顺序（ai-visibility、citations、prompts、competitors、geo-audit、content-geo、ai-traffic、local-geo），不因新增工具改动分类体系。
- 已有工具 slug 保持稳定；未完成核验或翻译用 `draft`，隐藏用 `hidden`，两者不进入详情页、首页、搜索索引与 sitemap。首页按 `featuredOrder` 升序，新条目从现有最大值后递增。
- 日期一律 YYYY-MM-DD；`site.url` 不带尾斜杠。

## 工作流 skill 与文档
- 全网发现、筛选并收录新 GEO 工具时，先使用 `skills/ggeo-site-collect/SKILL.md`；它复用数据更新 skill 的 JSON 约定并要求记录核验与暂缓原因，每轮搜集记录保存为 `docs/research/YYYY-MM-DD-geo-sites.md`。每轮收尾执行自修复与自优化复盘：维护发现经验库与共享经验库，规则修订只提建议、经用户确认后实施。该流程不创建广告、联盟或友链关系，也不自行提交、推送或部署。
- 修改工具资料、分类介绍、核验时间、广告或联盟配置时，先读取 `skills/ggeo-data-update/SKILL.md` 及其按需引用的数据约定。
- `docs/ggeo-ai-v3-PRD.md` 是产品依据；已确认的纯静态与邮件审核调整记录在 `docs/adr/0001-static-content-workflow.md`。使用 `GLOSSARY.md` 中的术语。

## 固定法律文案
- 隐私政策（隐私协议）与免责声明为独立维护的固定法律文案。后续工具采集、资料更新、翻译、核验日期、排序及广告／联盟配置更新，不得修改 `data/pages.json` 中这两页的中英文内容、来源链接和 `updatedAt`，也不得通过模板或界面文案间接改写；法律页日期不得跟随 `site.updatedAt`。只有用户明确要求修订法律文案时才可修改，并同步更新 `tests/legal-pages.test.mjs` 的内容指纹。发现运营或数据处理变更与现有文案冲突时，报告差异及建议，不擅自改写文案或启用不匹配的处理方式。
