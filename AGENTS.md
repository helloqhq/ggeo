# ggeo.ai 项目约定

- 全网发现、筛选并收录新 GEO 工具时，先使用 `skills/ggeo-site-collect/SKILL.md`；它复用数据更新 skill 的 JSON 约定并要求记录核验与暂缓原因。
- 修改工具资料、分类介绍、核验时间、广告或联盟配置时，先读取 `skills/ggeo-data-update/SKILL.md` 及其按需引用的数据约定。
- `docs/ggeo-ai-v3-PRD.md` 是产品依据；已确认的纯静态与邮件审核调整记录在 `docs/adr/0001-static-content-workflow.md`。使用 `GLOSSARY.md` 中的术语。
- 内容源在 `data/*.json`，模板和浏览器交互在 `src/`。`dist/` 为构建产物，不能直接编辑。运行时保持纯静态，不添加后端或数据库。
- 内容变更后运行 `npm run validate`、`npm run build`、`npm test`。浏览器受影响时，启动预览检查对应中英页面。测试中的本地 HTTP 检查需要允许回环网络监听。
