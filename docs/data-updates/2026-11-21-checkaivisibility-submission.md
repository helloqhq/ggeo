# 2026-11-21 收录邮件提交的 CheckAIVisibility

## 来信

友链标签下的工具收录申请（非友链互换）：Kai Bennett（hello@checkaivisibility.app，CheckAIVisibility 作者）于 2026-11-20 来信申请收录 checkaivisibility.app，按提交审核处理，未新增友情链接。用户授权收录并按来信语言（英文）回复。

## 核验

来源均为官网可见正文（抓取于 2026-11-21，WebFetch 抓取时间戳为 UTC 2026-11-20T16:22/16:23Z）：

- `https://checkaivisibility.app/`：产品定位（免费 AI 可见性检查）、免费检查限额（每网络每天 3 次）、完整报告 $9 一次性、官方 API、不测 Perplexity／Google AI Overviews／消费端应用、得分公式、报告章节与行动建议。
- `https://checkaivisibility.app/pricing/`：免费 $0（5 题 OpenAI 联网、每题 1 次、报告链接保留 90 天）与完整报告 $9 一次性（15 题 × 2 次，OpenAI／Claude 联网 + Gemini 模型知识，共 90 回答，30 天后一次复查，Stripe 结算）。首页与定价页 JSON-LD offers 与可见正文一致。

## 录入

- `data/tools.json` 新增 `checkaivisibility`（published，ai-visibility，Freemium，featuredOrder 114，verifiedAt 2026-11-21，sponsored false，logo null）。
- `platforms` 按目录惯例记为 ChatGPT／Claude／Gemini；API 与消费端应用差异写入 `limitations`。
- `selectionNotes` 1 条，`alternativeSlug` 指向 peec-ai（一次性审计 vs 订阅制监控），并新增 peec.ai 官方页作为比较依据来源。
- `data/site.json` 的 `updatedAt` 推进到 2026-11-21；法律文案与 `data/pages.json` 未改动。

## 验证

- `npm run validate`（114 tools）、`npm run build`（260 页）、`npm test`（22 通过）全部通过。
- 预览检查中英详情页：栏目顺序、对比表（CheckAIVisibility vs Peec AI，真实工具名表头）、行内来源编号、唯一核验日期 2026-11-21 均符合详情呈现约定。
- `dist/assets/directory.json` 与 sitemap.xml 均含新条目；`/en/search/?q=CheckAIVisibility` 与中文搜索「可见性检查」均能命中。

## 过程修正

- 初稿写了 2 条 `selectionNotes`，模板为每条笔记各渲染一张对比表，第二条无 `alternativeSlug` 时回退选中同分类第一名的 peec-ai，出现两张对比对象相同的表；既有 113 条数据均为 1 条 selectionNotes，遂合并为 1 条后重建。

## 变更文件

- `data/tools.json`：新增 checkaivisibility 条目。
- `data/site.json`：`updatedAt` → 2026-11-21。
- `skills/ggeo-data-update/references/lessons.md`：L-09 命中记录更新（Gmail 重载超时），新增 L-14（selectionNotes 条数与对比表渲染）。
