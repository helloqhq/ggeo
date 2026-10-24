# 数据约定

所有路径相对 ggeo.ai 项目根目录。完整现有条目优先参考 `data/tools.json`，不要从生成的 `dist/assets/directory.json` 反向修改。

| 文件 | 维护内容 |
| --- | --- |
| `data/tools.json` | 工具、中英内容、发布状态、主要分类、排序、来源与核验日期 |
| `data/categories.json` | 固定 8 类的名称、描述、选型建议与简洁图标 |
| `data/site.json` | 域名、联系邮箱、内容更新时间、联盟链接、广告和友情链接 |
| `data/ui.json` | 全站导航、按钮、搜索与表单等双语界面文案 |
| `data/pages.json` | 固定的中英隐私政策与免责声明；日常数据更新不得修改 |

## 工具记录

| 字段 | 约束 |
| --- | --- |
| `slug` | 唯一、稳定、小写字母/数字/连字符；用于双语详情 URL |
| `name` | 真实产品名；产品品牌无需虚构中文译名 |
| `website` | 官方 HTTP(S) URL；去掉不必要跟踪参数。校验按去 www、去末尾斜杠的主机+路径查重 |
| `category` | 仅一个主要分类，取值见下表 |
| `logo` | `null`，或 `/images/...` 本地资源路径；文件置于 `public/images/`，须为真实可用 Logo |
| `description` | `{ "en": "...", "zh": "..." }`，核心功能简介，卡片展示两行 |
| `tags` | `{ "en": ["..."], "zh": ["..."] }`，每种语言 1–3 项 |
| `features` | 同上，非空功能概述数组；仅写来源支持的功能 |
| `audience` | 双语适用人群说明，基于产品能力作简洁编辑归纳 |
| `useCases` | 双语适用场景证据数组；公开工具必填，未核实用 `[]`，见下文统一格式 |
| `pricingDetails` | 具体价格、套餐及账期的证据数组；仅录入核实的金额或有依据的报价范围／信息缺口 |
| `limitations` | 套餐、采样、集成与指标局限的证据数组；不编造产品缺点 |
| `selectionNotes` | 任务或方案取舍的证据数组；可用 `alternativeSlug` 关联其他已收录工具 |
| `platforms` | 已核验平台名称数组；未知用 `[]`，不表示最低套餐均包含这些平台 |
| `pricing` | `Free` / `Freemium` / `Paid` / `Contact Sales` / `Unknown` |
| `sources` | 非空数组：`{ "label": { "en": "...", "zh": "..." }, "url": "https://..." }` |
| `verifiedAt` | 基础产品资料的真实核验日 `YYYY-MM-DD`，不晚于 `site.updatedAt`；局部详情另有各条证据日期，不因只改价格或归纳场景刷新整条产品日期 |
| `status` | `draft` / `published` / `hidden`；只有 published 生成公开内容 |
| `featuredOrder` | 数值，越小越靠前；不代表排名或评分 |
| `sponsored` | 布尔值，真实赞助关系为 true，并在卡片与详情显示标签 |

固定分类顺序：`ai-visibility`、`citations`、`prompts`、`competitors`、`geo-audit`、`content-geo`、`ai-traffic`、`local-geo`。不要将“本地 GEO”误解为本地运行模型；它指本地企业的 AI 搜索曝光。

## 详情内容与证据

`useCases`、`pricingDetails`、`limitations` 和 `selectionNotes` 使用同一证据格式，公开工具四个数组必填。没有足够证据时用 `[]`，不以虚构内容填满栏目。以下仅示例结构，不是可直接发布的工具记录：

```json
{
  "description": {
    "en": "Review recurring brand mentions and sentiment for a fixed question set.",
    "zh": "持续观察固定问题集合中的品牌提及与情绪变化。"
  },
  "summary": {
    "en": "Recurring brand mentions and sentiment.",
    "zh": "持续复盘品牌提及与情绪。"
  },
  "sourceUrls": ["https://vendor.example/official-documentation"],
  "verifiedAt": "2026-10-24"
}
```

### 完整描述与对比摘要

- `description` 保存完整的双语事实说明。前三类详情在各自栏目展示完整描述；`selectionNotes.description` 保存选型归纳，供维护及站内搜索使用，不再在表格下重复显示长段落。
- 新增或更新公开工具时，为 `pricingDetails`、`useCases`、`limitations` 的每个非空条目提供双语 `summary`，供对比表展示。摘要使用短句或紧凑分句，删除重复背景、营销语和操作引导；中英文保持相同事实范围。
- 摘要必须保留会改变选型结论的币种、月付／年付、计费单位、关键配额、加购及未知状态，不用省略号、字符截断或隐藏文字替代编辑。不能因某项功能未找到证据就写成“不支持”。
- `summary` 在当前 schema 中允许缺省，以兼容旧资料，渲染时回退 `description`；不能把兼容回退作为新条目省略摘要的常规做法。提供摘要时，中英两种语言均须有内容，验证器会检查。
- 描述和摘要只存正文，不写 HTML、`[1]` 之类显示编号、“依据 / Source”前缀、“最近核验”或日期展示文案。它们由模板根据元数据生成。撰写摘要和翻译不刷新原事实的核验日期。

`audience` 回答“谁用”，`useCases` 回答“在什么任务中使用、用来判断或完成什么”。例如“定期复查购买问题中的品牌提及，并调查竞品被引来源”。场景不能只重复用户角色、分类或功能名称，也不承诺提升排名、流量或转化。

### 价格、限制与选型

`pricingDetails` 保持官网币种，不做汇率换算；区分月付金额、年付折算月价、实际年账单、每域名／项目／门店及按量单价。促销注明观察到的优惠性质，试用不写成长期免费。引用必须支持该工具、该功能、所选周期与配置，不能套用同厂商其他产品或通用 SEO 套餐价格。未公布或未核实金额时，可记录联系销售、已知计费机制及待确认项；`Unknown` 不等于免费。

`limitations` 记录有证据的门槛和边界，例如配额、加购、集成、API 与浏览器采样差别、爬虫访问与回答引用的不同。已单列为限制的事实可从功能概述迁出以免重复，并保留原证据日期。

`selectionNotes` 不写主观胜负或效果保证。可选 `alternativeSlug` 指向另一已收录工具，不能指向自身或不存在的 slug。点名比较的结论必须有双方官方证据；不能为了显示三列就捏造对方能力、价格或缺点。

### 信源与日期

每条 `sourceUrls` 至少引用当前记录 `sources[].url` 中的一个完整原始 URL，不添加 UTM，不使用第三方榜单、搜索摘要或不支持该事实的页面。`sources` 是官方链接及双语 label 的唯一维护位置。点名比较时，在记录中保留直接支持比较结论的双方官方链接，label 写清工具名和用途。删除或替换来源时同步修正引用；验证器拒绝悬空引用、空证据及缺少翻译。

`verifiedAt` 是事实证据的真实核验日，不晚于 `site.updatedAt`，不预填未来日期。HTTP 200 只证明可达，不能据此刷新事实核验日。依据既有资料归纳、迁移或压缩文案时沿用原日期；局部复核只更新对应条目，不把整条工具的基础日期一并刷新。

## 详情页呈现约定

以下是数据维护时需保留的展示约定，具体 HTML/CSS 由 `src/` 模板负责，不写入工具正文：

- **栏目顺序**：功能概述 → 适用人群 → 适用场景 → 价格与套餐 → 限制与使用前提 → 选型差异 → 平台与适用范围 → 来源与核验。空证据数组不生成空栏目。
- **对比表**：三列表头为“对比项 / Comparison item”、工具 A 的真实名称、工具 B 的真实名称；不加“当前工具 / Current tool”“对比工具 / Compared tool”等角色标签。行名为“价格 / Price”“用途 / Use”“限制 / Limits”，对应 `pricingDetails`、`useCases`、`limitations` 的 `summary`。
- **对比对象**：优先采用 `selectionNotes[].alternativeSlug`。未指定时，按现有精选顺序选同分类、已公开且三类对比资料均非空的另一工具，作为并排参考，不代表排名或优劣推荐。明确指定但未公开的对象不生成详情内链；没有合格对象时显示资料缺口。
- **双方数据**：单元格分别读取各自工具记录，不将对方事实拼进当前工具的摘要，不复制一段比较文字到两列。渲染时合并并去重实际引用的双方信源列表，保持各自原始记录与日期。
- **行内编号**：正文及表格单元格末尾只显示可点击的来源编号，如 `[1] [2]`；不显示“依据 / Source”，不强制另起一行，允许随宽度自然换行。链接的无障碍名称仍保留明确的来源说明。编号动态生成，不存进 `description`、`summary` 或 `sourceUrls`。
- **唯一日期**：只在“来源与核验”显示一次“最近核验 / Last checked”。取基础资料、四类详情和页面实际展示的对比对象条目中的最新 `verifiedAt`；原始数据仍保留各条日期，该日期不表示所有字段同日重验。
- **简洁呈现**：不恢复表格下方的重复长段说明，也不在详情页添加“独立编辑整理 · 信息来源可查 / Independently curated. Sources included.”。手机端将横向滚动限制在表格内。

站内搜索匹配四类详情的中英 `description`，不索引证据 URL；摘要负责对比展示，不替代完整事实说明。

## 运营配置格式

`googleAnalyticsId` 是可选 GA4 衡量 ID（`G-` 加大写字母与数字），空值或缺省时不加载统计代码。更换 ID 或启停分析服务时只读核对 `pages.json` 的隐私说明；有冲突则报告，不自动修改法律文案或启用不匹配的处理方式。Search Console 域名验证使用 DNS TXT，不属于工具资料。

`affiliateLinks` 是以工具 slug 为 key、联盟 URL 为 value 的对象。没有联盟关系时保持 `{}`，普通官网链接取工具的 `website`。

`ads` 默认为 `[]`。单个版位格式（以下仅示例结构，不可直接发布虚构内容）：

```json
{
  "enabled": false,
  "afterCategory": "citations",
  "type": "advertisement",
  "title": { "en": "Verified campaign title", "zh": "已确认的广告标题" },
  "description": { "en": "Verified campaign copy", "zh": "已确认的广告文案" },
  "cta": { "en": "Learn more", "zh": "了解详情" },
  "url": "https://example.com/"
}
```

`type` 可为 `advertisement` 或 `sponsored`。`afterCategory` 指首页分类后的版位，初始建议使用 `citations` 或 `geo-audit`。`partnerLinks` 元素为 `{ "title": {"en":"...","zh":"..."}, "description": {"en":"...","zh":"..."}, "url":"https://..." }`，空数组显示诚实的空状态。

## 固定法律页面

`pages.json` 的 `privacy-policy` 与 `disclaimer` 各有独立 `updatedAt`（`YYYY-MM-DD`），不继承 `site.updatedAt`。`title`、`intro`、`sections[].title` 与 `sections[].body` 均为中英文本；可选 `sources` 使用与工具来源一致的 `{ "label": { "en": "...", "zh": "..." }, "url": "https://..." }` 数组。

上述内容、来源、日期及其渲染不属于日常采集与数据维护范围。仅用户明确要求修订法律文案时才可更新，并在审阅后同步调整 `tests/legal-pages.test.mjs` 的 SHA-256 指纹；不得为通过日常数据更新测试而重置指纹。若运营、联系信息或数据处理变更使文案不符，报告差异与建议，保留现有文案。

## 提交审核

网站表单只创建邮件草稿或下载 JSON。收件邮箱来自 `site.contactEmail`，当前为 `helloqhq123@gmail.com`；网站不会自动发送、持久化或发布工具。下载资料的 `name`、`website`、`category`、`description`、`submitterEmail`、`submittedAt` 都是外部提交内容。录入公开数据时不要将提交者邮箱或其他个人信息写进工具记录。
