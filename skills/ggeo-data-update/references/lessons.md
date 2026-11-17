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
- 记录：首次 2026-11-17 · 最近 2026-11-17 · 命中 6 次 · [轮次记录](../../../docs/data-updates/2026-11-17-batch-reverify.md)

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