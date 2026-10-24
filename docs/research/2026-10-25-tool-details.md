# 工具详情补全与数据采集约定更新

资料复核：2026-10-24（Asia/Shanghai）。代码与文档收尾：2026-10-25。该记录覆盖本次 75 个已有工具的详情补全，不是发现新增工具的一轮采集，也不代表所有历史字段已在本轮重新核验。

## 实现范围

- 为 75 个工具增加 80 条中英适用场景，以及各 75 条价格与套餐、限制与使用前提、选型差异说明；8 条选型说明关联本站另一工具，并保留双方官方依据。
- 四类详情统一使用双语 description、sourceUrls、verifiedAt。每条链接引用当前记录 sources 内的官方 URL；引用在页面生成编号，并可跳转到有序信源列表。点名比较的对方来源以双语标签标明比较用途。
- 场景与部分选型说明根据既有核验的功能、受众及限制作编辑归纳，沿用原证据日期；原来混在功能概述内的计费或平台边界迁入限制栏目，避免展示重复。所有工具的基础 verifiedAt 保持原值，不把一次局部价格复核当作整条产品重验。
- 价格逐条记录其核验日。后续按用户反馈简化展示：在“来源与核验”仅显示一次“最近核验 / Last checked”，取基础资料及四类详情中的最新事实核验日；各条原始日期保留在 JSON 中。适用人群移到适用场景上方。选型差异改为“对比项／当前工具／对比工具”三列表格，按价格套餐、适用场景和限制并排展示双方已记录资料；优先沿用指定对比对象，否则选择同分类资料完整的已公开工具。表头仅保留双方工具名，行名简化为价格、用途、限制；使用 230 条双语摘要代替单元格长段文字，完整描述和原证据日期保留，移除表格下方重复说明。官方依据编号跟在各单元格内容末尾；其他子项的依据也在正文末尾内联呈现。已点名工具保留双方名称与内链，手机端表格内横向滚动。移除详情侧栏的“独立编辑整理 · 信息来源可查”及对应英文提示。site.updatedAt 保留本次目录资料更新的 10 月 24 日，10 月 25 日为验证与文档收尾；法律页的正文、来源、日期及内容指纹没有修改。
- 静态 HTML 直接包含详情；站内搜索匹配四类详情的中英描述，不索引信源 URL。没有证据的数组允许留空，页面不生成空栏目。

## 来源与核验边界

10 月 24 日对原有 172 个来源执行公开 HTTP 读取：169 个 HTTP 200、1 个 403、2 个传输失败。HTTP 成功只用于可达性记录，不能据此给未读正文的事实刷新日期。正式写入的具体报价使用官方可读正文；Peec、Rankshift、LLM Pulse 的动态金额还通过 ego-browser 渲染核对。另从官方文档的实际链接读取并补充 [Surfer 当前定价](https://surferseo.com/pricing/) 和 [Plausible 浏览量定价](https://plausible.io/#pricing)。没有注册、购买、提交第三方表单或启用外部集成。

- Peec 首页初次 HTTP/2 读取失败，但定价页可读，并在浏览器核对月付 $95 / $245 / $495 及额度。基础资料和其他历史字段未因这次价格复核刷新。
- [Yext 帮助页](https://help.yext.com/hc/en-us/articles/37152756031643-What-is-Scout) 返回 403，未绕过；价格说明使用可读的官方 FAQ，按门店、合同和方案报价，不补固定金额。
- [Adobe 产品页](https://business.adobe.com/products/llm-optimizer.html) 本轮传输失败；保留原基础证据日期，未发布新金额。企业报价与技术流程说明沿用既有记录。
- SE Ranking 定价显示地区化 ¥ 金额，页面未清晰标注结算币种；不推定人民币／美元，也不把 AI Search 加购与 Core / Growth 组合方案混为同一报价。
- LLM Pulse 在浏览器选择 EUR、月付及每周追踪，核对 €49 / €99 / €299；其他币种有近似显示，不能自行换算或把每日追踪配置当作相同报价。
- 保留 AirOps 与 Sitebulb Labs 的 Unknown 价格模式。AirOps 公开 FAQ 的 Solo 超额任务单价不是完整订阅价；Sitebulb 未明确公开计费，不能推定免费。
- Bing、GEOly、觅恒、Adobe、AccuLLM、Local Dominator、Sitebulb 的部分价格说明沿用既有证据或明确当前金额缺口；不把“已有付费模式”写成已核实的固定报价，不将通用关键词套餐价当作 AccuLLM 价格。
- 对无公开固定金额的企业工具，只记录联系销售与需确认范围；不猜价格，也不因联系销售就认定所有功能均包含。

## 价格观察索引

下表为详情第一段摘要，完整账期、额度及引用保存在 data/tools.json。金额是各条标注日期的官方页面观察，不是长期价格保证。

| 工具 | 价格说明摘要 | 条目证据日期 | 官方依据 |
| --- | --- | --- | --- |
| Peec AI | 品牌月付方案：Starter 为 $95/月，含 50 个提示词和 1 个项目；Pro 为 $245/月，含 150 个提示词和 2 个项目；Advanced 为 $495/月，含 350 个提示词和 5 个项目。 | 2026-10-24 | [来源 1](https://peec.ai/pricing) |
| Profound | 公开方案包括七天试用和定制报价的 Enterprise；未公布固定企业月费，需按监测范围及 AI Marketer 积分要求获取报价。 | 2026-10-24 | [来源 1](https://www.tryprofound.com/pricing) |
| OtterlyAI | Lite、Standard、Premium 的月付价格分别为 $29、$189、$489，含 15、100、400 个搜索提示词。 | 2026-10-24 | [来源 1](https://otterly.ai/pricing) |
| AthenaHQ | Starter 标价 $295/月，含 3,600 积分。 | 2026-10-24 | [来源 1](https://athenahq.ai/plans) |
| Promptmonitor | Starter、Growth、Pro 月付分别为 $39、$79、$149，套餐卡分别列出 25、50、150 个监测提示词。 | 2026-10-24 | [来源 1](https://promptmonitor.io/pricing) |
| ZipTie | 按提示词、引擎及刷新频率组合计费。 | 2026-10-24 | [来源 1](https://ziptie.ai/pricing/) |
| Rankscale | Pro 标价 $99/月，含 1,200 积分；Pro+ 为 $229/月，含 3,000 积分。 | 2026-10-24 | [来源 1](https://rankscale.ai/pricing) |
| LLMrefs | All in One 页面显示 $79/月并标注限时优惠，另有七天试用。 | 2026-10-24 | [来源 1](https://llmrefs.com/) |
| Scrunch | 官方 FAQ 列出品牌 Core 为 $250/月，Agency Core 为 $500/月；Enterprise 与 Agency Enterprise 定制报价。 | 2026-10-24 | [来源 1](https://scrunch.com/faqs/what-is-the-pricing-for-scrunch-plans) |
| Geoptie | 套餐卡列出 Starter $49/月、Professional $99/月、Enterprise $399/月，分别含 15、100、400 个提示词。 | 2026-10-24 | [来源 1](https://geoptie.com/pricing) |
| Writesonic | 年付显示 Starter 折算 $79/月、Basic $199/月、Growth $399/月，均为按年结算的月度折算价。 | 2026-10-24 | [来源 1](https://writesonic.com/pricing) |
| Surfer | 年付方案中，AI Search Analytics 折算 82 美元/月、Standard 99 美元/月、Pro 182 美元/月。 | 2026-10-24 | [来源 1](https://surferseo.com/pricing/) |
| Plausible Analytics | 页面所示每月不超过 10,000 次浏览的档位中，Starter、Growth、Business 分别显示 $9、$14、$19/月。 | 2026-10-24 | [来源 1](https://plausible.io/#pricing) |
| Ahrefs Web Analytics | 官方帮助页列出每个项目每月 100 万事件的免费额度；付费扩容为 500 万事件 99 美元/月、2,000 万 299 美元/月、1 亿 999 美元/月，地区币种显示可能不同。 | 2026-10-24 | [来源 1](https://help.ahrefs.com/en/articles/10247870-about-ahrefs-web-analytics) |
| Local Falcon | Starter、Basic、Pro、Premium 月付分别为 $24.99、$49.99、$99.99、$199.99，含 7,500、15,150、31,250、63,150 积分。 | 2026-10-24 | [来源 1](https://www.localfalcon.com/pricing) |
| Yext Scout | Scout 可单独购买或与其他 Yext 服务组合。 | 2026-10-24 | [来源 1](https://www.yext.com/knowledge-center/yext-faq) |
| Semrush AI Visibility Toolkit | Base 标价每域名折算 $99/月，按年结算；含 25 个自定义提示词的每日追踪及 1 个域名的品牌表现分析。 | 2026-10-24 | [来源 1](https://www.semrush.com/pricing/ai/) |
| SE Ranking AI Search Toolkit | 当前订阅页将 Core、Growth 组合方案与含 200 个提示词的 AI Search 加购项分开。 | 2026-10-24 | [来源 1](https://seranking.com/subscription.html) |
| Promptwatch | 月付定价显示 Essential $95、Professional $245、Business $579，分别含 1、2、5 个项目；提示词额度及账户范围随套餐变化。 | 2026-10-24 | [来源 1](https://promptwatch.com/pricing) |
| Ahrefs Brand Radar | 官方产品页显示 Custom Prompts 从 €47/月起，AI Visibility Index 从 €179/月起；另说明付费 Ahrefs Lite 及以上方案包含 Custom Prompts。 | 2026-10-24 | [来源 1](https://ahrefs.com/brand-radar) |
| HubSpot AI Search Grader | AI Search Grader 是免费的一次性品牌诊断。 | 2026-10-24 | [来源 1](https://www.hubspot.com/ai-search-grader) |
| AirOps | 定价 FAQ 说明按任务用量计费，Solo 超额任务为每次 $0.025。 | 2026-10-24 | [来源 1](https://www.airops.com/pricing) |
| Frase | Starter 月付 $49，年付折算 $39/月；Professional 月付 $129，年付折算 $103/月；Scale 月付 $299，年付折算 $239/月。 | 2026-10-24 | [来源 1](https://www.frase.io/pricing) |
| Cloudflare AI Crawl Control | AI Crawl Control 可用于 Cloudflare 免费方案下的代理域名；Enterprise Bot Management 提供额外识别和分析能力。 | 2026-10-24 | [来源 1](https://developers.cloudflare.com/ai-crawl-control/)、[来源 2](https://developers.cloudflare.com/ai-crawl-control/get-started/) |
| BrightLocal Local AI Visibility | 1 个门店时，Track 月付 41 美元，或年付 369 美元（页面折算约 31 美元/月）；Manage 月付 54 美元，Grow 月付 65 美元。 | 2026-10-24 | [来源 1](https://www.brightlocal.com/pricing/) |
| Bing Webmaster Tools AI Performance | 作为 Bing Webmaster Tools 功能免费提供；公开报表范围是 Microsoft AI 引用，而不是独立商业监测订阅。 | 2026-10-18 | [来源 1](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/) |
| querying.ai | Basic 为 20 美元/月，含 8,000 积分；Pro 为 200 美元、170,000 积分；Scale 为 500 美元、480,000 积分；Max 为 1,000 美元、100 万积分。 | 2026-10-24 | [来源 1](https://querying.ai/zh/pricing) |
| Waikay | Level 1 为 $24.95/月、8 积分；Level 2 为 $69.95、30 积分；Level 3 为 $199.95、90 积分。 | 2026-10-24 | [来源 1](https://waikay.io/how-credits-are-used-on-waikay/)、[来源 2](https://waikay.io/free/) |
| Goodie | 定价页标注年付，Core 显示折算 $295/月，含 110 个提示词和 5 个核心模型；Pro 为 $999/月，含 250 个提示词和 8 个模型。 | 2026-10-24 | [来源 1](https://higoodie.com/pricing/) |
| Analyze AI | Growth 为 $99/月，含每日 25 个监测提示词和 3 个引擎；Pro 为 $250/月，含每日 35 个提示词和 4 个引擎。 | 2026-10-24 | [来源 1](https://www.tryanalyze.ai/pricing) |
| Evertune | Starter 显示 $60/月、5,000 提示词积分；Pro 显示按年结算折算 $800/月、100,000 积分。 | 2026-10-24 | [来源 1](https://www.evertune.ai/pricing) |
| Birdeye AI Search | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://birdeye.com/pricing/) |
| Botify | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://support.botify.com/en/articles/9108632-botify-subscription-plans) |
| Conductor Monitoring | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://www.conductor.com/pricing/) |
| GEOly | 已记录为付费监测，但未从保留的官方资料中核实当前固定金额；需向厂商确认提示词数量、引擎和账期。 | 2026-10-18 | [来源 1](https://www.geoly.ai/zh) |
| Brandlight | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://brandlight.ai/platform/ai-visibility) |
| Searchable | 年付显示 Pro 折算 $125/月、Scale $400/月、Enterprise $999/月。 | 2026-10-24 | [来源 1](https://www.searchable.com/pricing) |
| Knowatoa | Starter 为 59 美元/月，Growth 为 199 美元/月，Enterprise 定制报价。 | 2026-10-24 | [来源 1](https://knowatoa.com/pricing) |
| Gauge | Growth 为 $599/月，含每日 600 个提示词及 3 个核心平台；Enterprise 定制报价，监测、内容、席位及支持范围按约定调整。 | 2026-10-24 | [来源 1](https://www.withgauge.com/pricing/) |
| Rank Prompt | 年付显示 Starter 约 $39/月，实际年账单 $470；Pro 约 $71/月，年账单 $855。 | 2026-10-24 | [来源 1](https://rankprompt.com/pricing/) |
| Adobe Brand Visibility | 企业价格需联系销售。 | 2026-10-21 | [来源 1](https://business.adobe.com/products/llm-optimizer.html) |
| Amplitude AI Visibility | Amplitude 各方案均包含 AI Visibility，包括 Free，但容量取决于方案。 | 2026-10-24 | [来源 1](https://www.amplitude.com/docs/amplitude-ai/ai-visibility)、[来源 2](https://www.amplitude.com/pricing) |
| Microsoft Clarity AI Visibility | Microsoft 官方将 Clarity 说明为永久免费服务；受支持的服务器或 CDN 日志采集仍可能产生基础设施服务商费用。 | 2026-10-24 | [来源 1](https://learn.microsoft.com/en-us/clarity/ai-visibility/bot-activity-overview)、[来源 2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/about-clarity) |
| 觅恒 MicoSeek | 已公布条款说明检测消耗积分。 | 2026-10-24 | [来源 1](https://www.micoseek.com/terms) |
| Rank.ai | Starter 月付 $49，年付折算 $39/月，含 5 个 AI 问题；Growth 月付 $129，年付折算 $99/月，含 25 个问题。 | 2026-10-24 | [来源 1](https://www.rank.ai/pricing) |
| Clearscope | Essentials 为 $129/月，含 50 个追踪查询；Business 为 $399/月，含 300 个查询。 | 2026-10-24 | [来源 1](https://www.clearscope.io/pricing/) |
| Known Agents | Free 为 $0/月、1 个项目；Startup 为 $29/月、3 个项目；Growth 为 $299/月、10 个项目。 | 2026-10-24 | [来源 1](https://knownagents.com/pricing) |
| Local Dominator AI Tracker | AI Tracker 使用按积分计量的付费方案，并提供限时试用。 | 2026-10-22 | [来源 1](https://localdominator.co/pricing/) |
| Gumshoe | Starter 每项目 $99/月，Pro 每项目 $299/月；项目按品牌加业务方向划分。 | 2026-10-24 | [来源 1](https://gumshoe.ai/pricing/) |
| Rankability | Starter、Agency、Agency Pro 月付分别为 97、297、497 美元，含每月 20、80、160 个内容项目。 | 2026-10-24 | [来源 1](https://www.rankability.com/pricing/) |
| Similarweb AI Search Intelligence | AEO Intelligence 月付 $129，或年付折算 $99/月；含 1 个用户、150 个监测提示词及 3 个月历史。 | 2026-10-24 | [来源 1](https://www.similarweb.com/packages/ai-search/) |
| Qwairy | 欧元显示 Starter 月付 €79，或年付 €790（页面折算约 €65/月）；Growth 月付 €199，或年付 €1,990。 | 2026-10-24 | [来源 1](https://www.qwairy.co/pricing) |
| Cairrot | Starter 为 $39/月，含 15 个提示词和 2 个模型；Pro 为 $99/月，含 40 个提示词和 5 个模型；Enterprise 为 $299/月，含 100 个提示词。 | 2026-10-24 | [来源 1](https://cairrot.com/pricing/) |
| Rankshift | 欧元年付显示 Starter 折算 €69/月、Professional €159/月、Business €359/月，分别含 9,500、22,000、53,000 积分；这些金额要求按年结算。 | 2026-10-24 | [来源 1](https://www.rankshift.ai/pricing/) |
| seoClarity Clarity ArcAI | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://www.seoclarity.net/ai-seo/pricing) |
| LLM Pulse | 选择欧元、月付和每周追踪时，Starter 为 €49/月、50 个提示词；Growth €99、150 个；Scale €299、450 个。 | 2026-10-24 | [来源 1](https://llmpulse.ai/pricing) |
| AccuRanker AccuLLM | 需要付费订阅。 | 2026-10-24 | [来源 1](https://www.accuranker.com/pricing/) |
| Nightwatch AI Tracking | 欧元年付显示 Starter 折算 €79/月（€948/年）、Professional €159/月（€1,908/年）、Agency €399/月（€4,788/年），AI 提示词上限分别为 50、150、500。 | 2026-10-24 | [来源 1](https://nightwatch.io/pricing/) |
| Matomo AI Traffic Analytics | AI 分析功能包含在付费 Matomo Cloud 中，或作为 On-Premise 附加项购买。 | 2026-10-24 | [来源 1](https://matomo.org/features/ai-traffic-analytics/)、[来源 2](https://matomo.org/pricing/) |
| Siteimprove Analytics | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://www.siteimprove.com/legal/master-subscription-agreement/) |
| Sitebulb Labs | 公开文档未明确计费模式或当前金额；将该扩展视为免费服务前，应向 Sitebulb 确认可用范围与价格。 | 2026-10-24 | [来源 1](https://labs.sitebulb.com/docs/) |
| Mangools AI Search Watcher | 官方指南列出持续免费方案，含 5 个监测提示词和 1 个 monitor，按周更新。 | 2026-10-24 | [来源 1](https://mangools.com/blog/ai-search-watcher-guide/) |
| SISTRIX AI Visibility | SISTRIX Start 为 €119/月另加税，Plus €239、Professional €419、Premium €799。 | 2026-10-24 | [来源 1](https://www.sistrix.com/ai/)、[来源 2](https://www.sistrix.com/pricing/) |
| Cognizo | Growth 为 $499/月，Pro 为 $999/月，Enterprise 定制报价。 | 2026-10-24 | [来源 1](https://www.cognizo.ai/pricing) |
| Geolix.ai | 看板月付方案分别为 119、239、479 美元，含 5,000、10,000、30,000 积分；额外引擎每个每月加 29 美元。 | 2026-10-24 | [来源 1](https://geolix.ai/zh/product) |
| Lumar AI Visibility | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://www.lumar.io/pricing/) |
| AIclicks | 定价页列出 $59、$189、$499 的自助月度方案及企业定制报价。 | 2026-10-24 | [来源 1](https://aiclicks.io/pricing) |
| Dageno | 公开显示 Starter $49/月，旁列原价 $89；Growth $199/月，Scale $410/月。 | 2026-10-24 | [来源 1](https://www.dageno.ai/pricing) |
| Radarkit Local Radar | 套件 Lite、Growth、Pro 月付分别为 $29、$79、$139。 | 2026-10-24 | [来源 1](https://radarkit.ai/pricing) |
| Keyword.com AI Visibility | 独立 AI Visibility 从 $9.80/月起，或年付 $94（页面折算 $7.83/月）。 | 2026-10-24 | [来源 1](https://keyword.com/pricing/) |
| Ahrefs Bot Analytics | Ahrefs 说明 Bot Analytics 在测试期内包含于付费 Ahrefs 方案，不额外收费；仍需考虑 Ahrefs 订阅及外部日志基础设施费用。 | 2026-10-24 | [来源 1](https://ahrefs.com/bot-analytics) |
| HubSpot AEO | 独立 AEO 标价 $50/月，无需另购 HubSpot 订阅；也包含在符合条件的 Marketing Hub 方案中。 | 2026-10-24 | [来源 1](https://www.hubspot.com/products/aeo) |
| Oncrawl AI Search Lens | 费用通过销售协议或定制方案确定。 | 2026-10-24 | [来源 1](https://www.oncrawl.com/tos/) |
| ProRankTracker AI Visibility | AI 专用定价页列出 Starter $99/月、500 个提示词计量单位，Pro $149/月、1,000 个。 | 2026-10-24 | [来源 1](https://proranktracker.com/ai_plans_and_pricing) |
| Search Atlas LLM Visibility | Growth 月付 $199，包含 LLM Visibility；Pro 月付 $399。 | 2026-10-24 | [来源 1](https://searchatlas.com/pricing/) |

## 维护与回归

数据维护和站点采集技能、统一数据约定、候选核验卡、PRD 已同步。采集需要记录具体金额与币种／账期、限制／集成、用途与选型依据，逐条保留日期和官方 URL；无来源、缺翻译、悬空引用、非法日期和无效比较对象会被校验拒绝。

源码验证、构建及 22 项测试通过；覆盖全部生成页的结构、语言、内链与法律文案指纹，以及详情静态呈现、证据日期、比较内链、无证据拒绝、隐藏工具不生成比较死链和详情搜索。10 月 25 日通过 ego-browser 检查 Peec AI 英文桌面与中文手机页面；四类详情、统一核验日期、有序信源和同语言比较链接正确，价格信源编号可跳至对应来源且目标进入视口。中文“购买问题”搜索找到 Peec AI，英文“0.025”搜索找到 AirOps。另抽查 Cloudflare 中文、Semrush 英文与 Sitebulb Labs 中文手机详情，均无横向溢出。预览截图保存在忽略目录 artifacts/tool-details-en-desktop.png 与 artifacts/tool-details-zh-mobile.png，不进入公开站点。原浏览器工作区在环境更新后已消失，用户明确授权重建，最终检查工作区已关闭。

本次仅更新源数据、页面、技能、文档及构建，尚未提交、推送或部署。
