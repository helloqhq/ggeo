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
| `platforms` | 已核验平台名称数组；未知用 `[]`，不表示最低套餐均包含这些平台 |
| `pricing` | `Free` / `Freemium` / `Paid` / `Contact Sales` / `Unknown` |
| `sources` | 非空数组：`{ "label": { "en": "...", "zh": "..." }, "url": "https://..." }` |
| `verifiedAt` | `YYYY-MM-DD`，真实核验日，不晚于 `site.updatedAt` |
| `status` | `draft` / `published` / `hidden`；只有 published 生成公开内容 |
| `featuredOrder` | 数值，越小越靠前；不代表排名或评分 |
| `sponsored` | 布尔值，真实赞助关系为 true，并在卡片与详情显示标签 |

固定分类顺序：`ai-visibility`、`citations`、`prompts`、`competitors`、`geo-audit`、`content-geo`、`ai-traffic`、`local-geo`。不要将“本地 GEO”误解为本地运行模型；它指本地企业的 AI 搜索曝光。

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
