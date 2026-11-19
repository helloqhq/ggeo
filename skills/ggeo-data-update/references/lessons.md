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
- 修复／预防：不重复抓取同一 URL；直接 Read/Grep 返回末尾「Local page source」给出的完整本地源文件，按标题行号定位段落。注意临时文件约 7 天后可能清理，缺失时才重抓。
- 记录：首次 2026-11-17 · 最近 2026-11-18 · 命中 7 次 · [轮次记录](../../../docs/research/2026-11-18-geo-sites.md)

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
- 修复／预防：用 curl 带完整 Chrome UA 取原始 HTML，再用脚本剥离 script/style 提取可见文本与页脚链接；不重复 WebFetch 同一 URL。完整 HTML 落 /tmp 后分段 Grep/Read。第二轮用于搜极星、GEOBase、DeepSmith 等主体与法律页核验。
- 记录：首次 2026-11-17 · 最近 2026-11-18 · 命中 2 次 · [轮次记录](../../../docs/research/2026-11-17-geo-sites-02.md)

### L-08 法律页对 bot 403 时用 ego-browser 真实浏览器读取
- 症状：rankmonster.ai/privacy 与 /terms 对 curl 与 WebFetch 均 403，无法核验运营主体与法律页日期。
- 根因：厂商对爬虫拦截法律页，但真实浏览器可正常访问（非登录/付费墙）。
- 修复／预防：改用 ego-browser（ego lite）真实浏览器打开读取，属正常访问而非绕过；先 `ego-browser skill` 遵循指南。仍 403 或需人工验证则记缺口并暂缓，不绕过验证码/付费墙。JS 渲染的定价（Omnia、Sellm、TopCited、GEOBase）同样用 ego-browser 读取。第三轮 Honeyb、SEOcrawl、ZeroRank、Elmo、Guzu 的定价与法律页全部用 ego-browser 读取；返回超长时改读工具输出目录里已保存的 .output 文件，不重复执行同一脚本。Next.js 站点的 `/pricing/index.md` 之类的 agent markdown 入口也可能只返回标题，此时不要反复抓取同一 URL，直接用 ego-browser 读可见正文（AgentSEO 2026-11-19）。
- 记录：首次 2026-11-17 · 最近 2026-11-19 · 命中 4 次 · [轮次记录](../../../docs/research/2026-11-19-geo-sites.md)

### L-09 ego-browser 任务空间收尾用 finish({keep:[]})，keep 不接受 false
- 症状：`task.finish({keep:false})` 抛 TypeError（keep 须为 "all" 或非空标签数组）；脚本间 JS 变量不共享。
- 根因：ego lite API 约定 keep 为 "all" 或 Page 标签数组；任务空间/标签跨调用持久，但脚本变量不持久。
- 修复／预防：收尾先 `await page.close()` 再单独脚本 `await task.finish({keep:[]})`；跨调用用 `taskSpace(<spaceId>)` 恢复并 `(await task.pages())[0]` 取回标签；导航与测量拆成两次调用，evaluate 内不要触发 location.href 跳转。Page 没有 `getByText`/`goBack`，点击用 evaluate 内 `el.click()`；evaluate 回调不能引用 Node 变量，需作为第二参数传入；慢站 `page.goto` 超时但「navigation committed」时直接继续读取，不重开空间。第三轮 guzu.ai 首页 20 秒超时后同为 committed，继续读取成功；任务空间若在两次校验之间被回收，用同一目标名重新 `taskSpace()` 建空间即可，不要卡在旧 id 上重试。
- 记录：首次 2026-11-17 · 最近 2026-11-18 · 命中 3 次 · [轮次记录](../../../docs/research/2026-11-18-geo-sites.md)

### L-12 定价页默认展示年付折算价，需切到月付再读
- 症状：Honeyb 定价页默认勾选 Annual，卡片显示 $23/$63/$159「每月」并注明每年账单，直接读取会把年付折算价当成标准月价；切到 Monthly 后为 $29/$79/$199。SEOcrawl 定价页另有币种选择器，切换后金额随之变化。
- 根因：定价组件把折扣周期设为默认视图，折算月价与标准月价只差一个开关；币种选择器会改变显示金额而非套餐内容。
- 修复／预防：读取定价页时先确认当前计费周期与币种标签，必要时点击月付/年付或币种切换后再提取；记录标准月价、年付折算月价与实际年账单分别是什么，促销折扣单独注明期限与性质。切换后重新读取卡片文本，不复用切换前的数值。
- 记录：首次 2026-11-18 · 最近 2026-11-18 · 命中 1 次 · [轮次记录](../../../docs/research/2026-11-18-geo-sites.md)

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