# 经验库

维护规则见[自修复与自优化流程](self-improvement.md#经验库维护)。本库记录数据校验、构建、测试、抓取与工具链的过程经验，两类轮次共用；检索策略与信源线索记在[发现经验库](../../ggeo-site-collect/references/discovery-lessons.md)。每轮开始通读全部条目，收尾时新增、合并、修正与清理。条目格式：

```markdown
### L-<编号> <简短标题>
- 症状：
- 根因：
- 修复／预防：
- 记录：首次 YYYY-MM-DD · 最近 YYYY-MM-DD · 命中 N 次 · [轮次记录](../../../docs/data-updates/YYYY-MM-DD-主题.md)
```

## 条目

### L-01 WebFetch 截断或混入样式时改读本地保存源
- 症状：WebFetch 返回在 50,000 UTF-16 单位处截断，或正文被大段 CSS/JS 污染，关键定价表、FAQ 不在返回内容里。
- 根因：工具对可读化输出设上限；营销页内联样式脚本体积大，挤占正文配额。
- 修复／预防：不重复抓取同一 URL；直接 Read/Grep 返回末尾「Local page source」给出的完整本地源文件，按标题行号定位段落。注意临时文件约 7 天后可能清理，缺失时才重抓。第五轮多个产品、定价与法律页再次出现截断，按此读取本地完整源后完成核验。
- 记录：首次 2026-11-17 · 最近 2026-11-25 · 命中 8 次 · [轮次记录](../../../docs/research/2026-11-25-geo-sites.md)

### L-02 官方定价页 403 时用记录内帮助文档备用入口
- 症状：工具 sources 中的定价页返回 403（如 birdeye.com/pricing/），金额无法复核。
- 根因：厂商对爬虫拦截定价页，但帮助文档域名通常可访问。
- 修复／预防：改用同一记录 sources 里已有的官方帮助/支持文章复核可验证事实；无法复核的 pricingDetails 条目保留原日期与缺口表述，不刷新、不编造金额。
- 记录：首次 2026-11-17 · 最近 2026-11-17 · 命中 1 次 · [轮次记录](../../../docs/data-updates/2026-11-17-batch-reverify.md)

### L-03 共享浏览器截图前先核对标签页
- 症状：Playwright 导航返回目标页标题，但截图内容是完全无关的其他站点页面。
- 根因：MCP 浏览器被多个会话共享，当前选中标签页可能被其他会话切换。
- 修复／预防：截图异常时先 browser_tabs list 核对当前标签页；用 browser_tabs new 新开专用标签页再导航截图，不占用他人标签页。
- 记录：首次 2026-11-17 · 最近 2026-11-17 · 命中 1 次 · [轮次记录](../../../docs/data-updates/2026-11-17-batch-reverify.md)

### L-04 子代理不可用时直接在主会话核验
- 症状：Agent 委派报 general-purpose 被 disallowedTools 禁用、claude 类型不存在（可用类型为空）。
- 根因：会话配置未开放任何子代理类型。
- 修复／预防：首次失败即确认本会话无可用子代理，改为主会话串行 WebFetch＋本地源文件阅读；不再反复尝试委派。
- 记录：首次 2026-11-17 · 最近 2026-11-17 · 命中 2 次 · [轮次记录](../../../docs/data-updates/2026-11-17-batch-reverify.md)

### L-05 推送瞬时网络失败改用 HTTP/1.1 重试
- 症状：`git push origin main` 报 `Recv failure: Operation timed out`、`Empty reply from server` 或 HTTP2 framing 错误，或长时间挂起无输出；仓库与权限实际正常。
- 根因：到 GitHub 的网络链路瞬时故障（HTTP/2 连接不稳定），非数据或权限问题；第九、十、十一轮发布阶段均出现。
- 修复／预防：失败后用 `git -c http.version=HTTP/1.1 push origin main` 重试；同轮后续推送可直接用 HTTP/1.1（第十一轮文档推送一次成功）。输出中 `credential-manager 不是一个 git 命令` 警告与成败无关，以出现 `<旧>..<新> main -> main` 行判定成功。重试两次仍失败则停止并报告，不盲目循环。
- 记录：首次 2026-11-16 · 最近 2026-11-17 · 命中 3 次 · [轮次记录](../../../docs/data-updates/2026-11-17-batch-reverify.md)

### L-06 定价页 JSON-LD 与可见正文冲突时以可见正文为准
- 症状：MaxAEO 定价页 JSON-LD offers 为 15/119/319，而页面可见定价文本为 $19/$149/$399，两者不一致。
- 根因：厂商结构化数据未随调价更新（陈旧），可见正文才是当前实际售价。
- 修复／预防：金额以可见正文为准记录，JSON-LD 仅作旁证；冲突时在搜集记录写明「以可见文本为准」。不据陈旧 JSON-LD 编造或推算金额。
- 记录：首次 2026-11-17 · 最近 2026-11-17 · 命中 1 次 · [轮次记录](../../../docs/research/2026-11-17-geo-sites.md)

### L-07 WebFetch 正文不全时改用 curl 完整 Chrome UA 取原始 HTML
- 症状：snezzi.com 对 bot 返回精简 markdown 摘要（定价/主体不全）；readability 会剥掉页脚导致法律页链接漏检；短 "Mozilla/5.0" UA 仍被拦。
- 根因：站点按 UA/Accept 向爬虫提供 markdown 或精简内容；可读化提取丢弃页脚等结构。
- 修复／预防：用 curl 带完整 Chrome UA 取原始 HTML，再用脚本剥离 script/style 提取可见文本与页脚链接；不重复 WebFetch 同一 URL。完整 HTML 落 /tmp 后分段 Grep/Read。第二轮用于搜极星、GEOBase、DeepSmith 等主体与法律页核验；第四轮 genmark.ai、llmpulse.ai、cognizo.ai 对 WebFetch 返回 fetch failed，curl 后成功。
- 记录：首次 2026-11-17 · 最近 2026-11-23 · 命中 3 次 · [轮次记录](../../../docs/research/2026-11-23-geo-sites.md)

### L-08 法律页对 bot 403 时用 ego-browser 真实浏览器读取
- 症状：rankmonster.ai/privacy 与 /terms 对 curl 与 WebFetch 均 403，无法核验运营主体与法律页日期。
- 根因：厂商对爬虫拦截法律页，但真实浏览器可正常访问（非登录/付费墙）。
- 修复／预防：改用 ego-browser（ego lite）真实浏览器打开读取，属正常访问而非绕过；先 `ego-browser skill` 遵循指南。仍 403 或需人工验证则记缺口并暂缓，不绕过验证码/付费墙。JS 渲染的定价（Omnia、Sellm、TopCited、GEOBase）同样用 ego-browser 读取。第三轮 Honeyb、SEOcrawl、ZeroRank、Elmo、Guzu 的定价与法律页全部用 ego-browser 读取；返回超长时改读工具输出目录里已保存的 .output 文件，不重复执行同一脚本。Next.js 站点的 `/pricing/index.md` 之类的 agent markdown 入口也可能只返回标题，此时不要反复抓取同一 URL，直接用 ego-browser 读可见正文（AgentSEO 2026-11-19）。
- 记录：首次 2026-11-17 · 最近 2026-11-19 · 命中 4 次 · [轮次记录](../../../docs/research/2026-11-19-geo-sites.md)

### L-09 ego-browser 任务空间收尾用 finish({keep:[]})，keep 不接受 false
- 症状：`task.finish({keep:false})` 抛 TypeError（keep 须为 "all" 或非空标签数组）；脚本间 JS 变量不共享。
- 根因：ego lite API 约定 keep 为 "all" 或 Page 标签数组；任务空间/标签跨调用持久，但脚本变量不持久。
- 修复／预防：收尾先 `await page.close()` 再单独脚本 `await task.finish({keep:[]})`；跨调用用 `taskSpace(<spaceId>)` 恢复并 `(await task.pages())[0]` 取回标签；导航与测量拆成两次调用，evaluate 内不要触发 location.href 跳转。Page 没有 `getByText`/`goBack`，点击用 evaluate 内 `el.click()`；evaluate 回调不能引用 Node 变量，需作为第二参数传入；慢站 `page.goto` 超时但「navigation committed」时直接继续读取，不重开空间。第三轮 guzu.ai 首页 20 秒超时后同为 committed，继续读取成功；任务空间若在两次校验之间被回收，用同一目标名重新 `taskSpace()` 建空间即可，不要卡在旧 id 上重试。Gmail 等 SPA 的 `goto` 与 `reload` 等待 load 均会超时，重载超时后标题已更新、snapshot 即可读到邮件正文，不必反复重试导航。Gmail 的「View entire message」会在受管弹窗中打开独立文档，原页面的 `waitForFunction` 可能超时；直接检查 `task.page("p2")` 的标题与正文即可，读完关闭该弹窗。
- 记录：首次 2026-11-17 · 最近 2026-11-24 · 命中 5 次 · [轮次记录](../../../docs/research/2026-11-24-geo-sites.md)

### L-12 定价页默认展示年付折算价，需切到月付再读
- 症状：Honeyb 定价页默认勾选 Annual，卡片显示 $23/$63/$159「每月」并注明每年账单，直接读取会把年付折算价当成标准月价；切到 Monthly 后为 $29/$79/$199。SEOcrawl 定价页另有币种选择器，切换后金额随之变化。
- 根因：定价组件把折扣周期设为默认视图，折算月价与标准月价只差一个开关；币种选择器会改变显示金额而非套餐内容。
- 修复／预防：读取定价页时先确认当前计费周期与币种标签，必要时点击月付/年付或币种切换后再提取；记录标准月价、年付折算月价与实际年账单分别是什么，促销折扣单独注明期限与性质。切换后重新读取卡片文本，不复用切换前的数值。注意反向陷阱（Geoptie 2026-11-23）：静态 HTML 显示的价格与页面上「Pay annually」标注不一定同属一个计费周期，选中态是 JS 组件状态，先在真实浏览器确认当前勾选的是月付还是年付再取数。
- 记录：首次 2026-11-18 · 最近 2026-11-23 · 命中 2 次 · [轮次记录](../../../docs/research/2026-11-23-geo-sites.md)

### L-13 新工具部署后站内搜索受索引缓存影响
- 症状：详情页已返回 200，线上 `/assets/directory.json` 已含新条目，但用户搜索新工具名暂时无结果；过几分钟自行恢复。
- 根因：搜索在浏览器端读取 `/assets/directory.json`，GitHub Pages 对该文件返回 `cache-control: max-age=600`；部署前访问过的浏览器或已打开的页面继续使用旧索引。
- 修复／预防：索引请求使用 `fetch(..., {cache: 'no-cache'})`，按 ETag 每次重新验证；部署后核验搜索时用真实浏览器或 `cache: no-store` 请求，不把缓存滞后误判为数据或匹配缺陷。已打开的旧页面刷新一次即可。
- 记录：首次 2026-11-19 · 最近 2026-11-19 · 命中 1 次 · [轮次记录](../../../docs/data-updates/2026-11-19-search-cache.md)

### L-10 法律页存在性以读到的条款正文判定
- 症状：Sellm 的 /terms、/privacy 对 curl 返回 200，但真实浏览器渲染为 404；GEOBase 法律页在浏览器报客户端 500，curl 的服务端 HTML 却含完整协议正文。
- 根因：SPA 对任意路径返回同一外壳（状态码不代表页面存在）；部分站点 SSR 正常而客户端水合出错。
- 修复／预防：不以 HTTP 状态码判断法律页；curl 正文与浏览器渲染互为备用，任一方读到实际条款文本（标题、版本/日期、主体名）才记为存在；两者都读不到才记缺口。
- 记录：首次 2026-11-18 · 最近 2026-11-18 · 命中 2 次 · [轮次记录](../../../docs/research/2026-11-17-geo-sites-02.md)

### L-11 核验跨过午夜时同步推进 site.updatedAt
- 症状：GEOBase 于 2026-11-18 核验，`npm run validate` 报 `verifiedAt: cannot exceed site.updatedAt`（site 仍为 2026-11-17）。
- 根因：校验器要求 `site.updatedAt` 不早于任何公开工具的核验日；会话日期在轮次中途变化。
- 修复／预防：`verifiedAt` 按实际读取官方页的日期记录，同轮把 `data/site.json` 的 `updatedAt` 推进到最大核验日；不改 `data/pages.json` 法律页日期（法律页测试会验证其不随动）。
- 记录：首次 2026-11-18 · 最近 2026-11-18 · 命中 1 次 · [轮次记录](../../../docs/research/2026-11-17-geo-sites-02.md)

### L-14 selectionNotes 每条渲染一张对比表，保持 1 条
- 症状：新条目写 2 条 selectionNotes（一条带 alternativeSlug、一条不带），详情页出现两张对比表，第二条回退选中同分类 featuredOrder 最小的工具，与第一张表对比对象相同，内容重复。
- 根因：`src/templates.mjs` 对 `selectionNotes` 的每个元素各渲染一张对比表；无 `alternativeSlug` 时回退取同分类三项对比资料齐全的第一个工具。既有 113 条数据均为 1 条 selectionNotes，多条没有先例。
- 修复／预防：默认每条工具只写 1 条 selectionNotes，把多个取舍角度合并进同一条 description（可含 alternativeSlug）；若未来确需多条，先确认每条的对比对象不同且各有双方官方证据，并在预览中检查表格数量。
- 记录：首次 2026-11-21 · 最近 2026-11-21 · 命中 1 次 · [轮次记录](../../../docs/data-updates/2026-11-21-checkaivisibility-submission.md)

### L-15 机械查重前置于收录决定，不靠记忆筛选候选
- 症状：搜集轮 5 个计划新增候选中 3 个（Geoptie、Trakkr、AIclicks）已完成官网核验后才发现早已收录，Conductor 靠临场印象排除；大量核验工作浪费，新增数从 8 修正为 5。
- 根因：候选筛选阶段靠记忆判断「像不像新工具」，全量 `normalizeWebsite` 机械比对没有在「决定收录」节点执行；厂商榜单文章（D-07）带来的熟悉名字尤其容易被误判为新工具。
- 修复／预防：把机械查重作为收录决定的强制门槛——任何候选写「可收录」结论前，先用 node 脚本把候选域名/名称与 `data/tools.json` 全表归一比对（hostname 去 www + pathname，加产品名与 slug 双向 grep）；榜单文章提到的新名字在打开官网核验前先过查重。发现已收录时不新增，若官网资料已有变化（如 Geoptie 新出公开月付档）记为下轮数据更新建议，不在发现轮顺手改动既有条目。第五轮 6 个拟新增候选均在深入录入前完成全量查重，结果为 `hits: []`。
- 记录：首次 2026-11-23 · 最近 2026-11-25 · 命中 2 次 · [轮次记录](../../../docs/research/2026-11-25-geo-sites.md)

### L-16 新增双语批次补扫繁体与中英混排
- 症状：结构校验通过后，新工具中文正文仍出现「內容」等繁体／混排用字，英文与中文的事实范围需人工对齐。
- 根因：校验器只检查双语字段存在与证据结构，不判断文字脚本质量；批量录入时容易保留模型生成中的繁体字或整段英文短语。
- 修复／预防：只对本轮新增记录扫描中文字段的繁体专用字与中英文相邻片段，再人工复核命中；不要机械替换「据／查／款」等简繁通用字。修正文案不刷新事实核验日，随后重跑 validate、build、test。
- 记录：首次 2026-11-25 · 最近 2026-11-25 · 命中 1 次 · [轮次记录](../../../docs/research/2026-11-25-geo-sites.md)

### L-17 摘要需与完整描述和官方配额逐项对齐
- 症状：结构校验与双语检查通过后，独立复核仍发现摘要遗漏加税、一次性计费、站点／竞品／内容产出配额，或把不同数据保留规则合并成一句。
- 根因：摘要为压缩文案，批量录入时只保留价格与部分功能；校验器证明字段和来源齐全，但不判断摘要是否覆盖完整描述中的选型关键事实。
- 修复／预防：对新增或更新的 `pricingDetails`、`limitations` 逐条比较 description 与 summary，保留账期、税费、关键配额、加购和未知状态；审计建议也必须回到官方源核实，未公布次数写“未公布”，不补推测数字。修正后重跑 validate、build、test，并检查中英比较表。
- 记录：首次 2026-11-25 · 最近 2026-11-25 · 命中 1 次 · [轮次记录](../../../docs/research/2026-11-25-geo-sites.md)