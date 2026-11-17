# 2026-11-17 最旧批次复核与 Unknown 定价核验

## 任务范围与授权

用户指令「更新本网站数据」，按 `skills/ggeo-data-update/SKILL.md` 执行。默认范围：复核 verifiedAt 为 2026-10-18 的最旧批次 9 个工具，外加 2 个 `pricing: "Unknown"` 工具，共 11 个。仅完成源数据更新与构建；未提交、未推送、未部署、未发送邮件，运营配置（广告／联盟／友链）与法律文案未改动。

## 更新清单（11 个，均为 published，无新增／隐藏）

| slug | 主要变更 |
| --- | --- |
| geoly | 平台 6→4（ChatGPT、Gemini、Google AI Mode、Google AI Overviews）；录入公开月付价 Basic $49／Grow $149／Advanced $399／Plus $999、Enterprise 定制、年付首年九折；限制改写：各档平台子集（1/2/4/4）、Copilot 2026-11 停测（历史至 2026-10-11）、Perplexity/Claude/Grok 需定制、试用仅限 Basic/Grow 三天免绑卡。基础日期刷新为 2026-11-17 |
| bing-webmaster-ai-performance | 新增 2026-06 公告四项预览功能（Intents、Topics、Citation Share、Compare）与 2026-10 Topics Portfolio（Beta）；新增功能条、场景条、限制条（近似值、数据不足隐藏、品牌词误报、引用份额非流量份额）及两条官方博客来源。基础日期刷新为 2026-11-17 |
| waikay | 新增 Level 4 $449.95/月/220 积分；免费入口明细（3 不续充积分＝1 品牌总览＋1 主题报告与行动建议＋最多 20 次浏览器模式追踪）。仅更新对应证据日期 |
| goodie | 定价改写为月付／年付切换（年付送两个月），年付视图 Core $295/月、Pro $999/月；Core 7 天试用后 $295/月可随时取消，Pro/Enterprise 需演示；限制具体化（Core 5 模型/50 次 MCP 优化，Pro 8/100，Claude 与 14 模型仅 Enterprise）。月付金额仅见于 JSON-LD，未录入 |
| analyze-ai | 复核确认无变化（Growth $99、Pro $250 等），仅刷新 pricingDetails 与 limitations 证据日期 |
| evertune | 确认 Starter $60/月、Pro $800/月年付；补充 Starter 限 5 模型、Ads Agent 费率 10%（前 7 天免费）/8%；限制改写为 Starter 5 模型上限、全模型与 Content Agent 在 Pro/Enterprise。Pro 月付 $1,000 仅见于页面脚本，未录入 |
| birdeye-ai-search | 帮助文档（2026-09-04 更新）确认平台启用设置不变；限制补充趋势线需三个月数据。定价页 403 无法复核，pricingDetails 保留 2026-10-24 |
| botify | 方案文档（2026-06-12 更新）确认五档 Essential/Accelerate/Growth/Pro/Enterprise、无公开金额；新增限制条：Accelerate 多功能只读、SpeedWorkers 仅 Pro/Enterprise 可选且 Bing（含 AI 爬虫）需加购、数据保留按档区分 |
| conductor-monitoring | 定价页已公开配额：Essentials 10 万页/3 站点/500 关键词含免费试用，Growth 50 万页 24/7/5 站点/5,000 关键词/年 2,500 AI Search 积分，Enterprise 任意规模/10+ 站点；金额仍询价。限制同步具体化 |
| airops | 平台补充 Perplexity、Claude、Microsoft Copilot、Grok（官方定价页 Pro/Enterprise 对比表品牌标识；Google 系标识含义不明未录入）；定价录入 Solo 35,000 任务/月（仅 ChatGPT 洞察、单用户）、Pro 100,000 任务/月（10+ 引擎、不限席位）、超额 $0.025/任务、14 天试用；无固定基础价，保持 Unknown；限制注明 FAQ 沿用旧方案名 Scale/Agency。基础日期刷新为 2026-11-17 |
| sitebulb-labs | 首页＋文档＋FAQ 复核：50 项检查、本地运行；FAQ 确认新兴检查默认关闭、未检测到显示 N/A 而非失败；文档与 FAQ 均无定价表述，保持 Unknown。基础日期刷新为 2026-11-17 |

`data/site.json` `updatedAt` 2026-11-16 → 2026-11-17。法律两页及其测试指纹未触碰。

## 验证、构建、测试与预览

- `npm run validate`：通过（94 工具、8 分类）。
- `npm run build`：通过（220 页）。
- `npm test`：22/22 通过（含法律页冻结指纹）。
- 预览浏览器检查：geoly 中/英、bing 中文、airops 英文、conductor 中文，价格、限制、平台、来源编号与「最近核验 2026-11-17」渲染正常，对比表正常。
- `git diff` 复核：仅 11 个目标工具与 site.updatedAt 变化；AGENTS.md 的既有未提交改动未触碰。

## 失败与阻碍

1. Birdeye 定价页 https://birdeye.com/pricing/ 返回 403，无法复核金额。处理：改用记录内官方帮助文档复核平台与限制事实；pricingDetails 保留原日期与「定制询价」表述。已解决（信息缺口如实保留）。
2. 子代理不可用（general-purpose 被禁用、claude 类型不存在），全部核验在主会话完成。已解决。
3. WebFetch 输出多次在 50,000 UTF-16 单位处截断且混入 CSS/JS。处理：改读工具保存的完整本地页面源文件（Read/Grep 定位段落），不重复抓取。已解决。
4. Playwright 共享浏览器中截图一度截到其他会话的标签页（U途工具）。处理：列出标签页并新开专用标签页后重截。已解决。另确认英文详情路径为 `/en/tools/<slug>/`，根路径 `/tools/` 为 404。

## 经验库增删改

新增 L-01（WebFetch 截断→读本地保存源）、L-02（官方定价页 403→记录内帮助文档备用入口并保留旧证据日期）、L-03（共享浏览器截图前先核对标签页）、L-04（子代理不可用时主会话直接核验）。无删除。

## 规则修订建议

无。本轮未发现规则歧义或错误；JSON-LD 金额需可见文本交叉核对的既有约定在 Goodie/Evertune 两处直接生效。