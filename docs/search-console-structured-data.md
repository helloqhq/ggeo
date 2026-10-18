# Search Console 旧域名出售页结构化数据排查

核验日期：2026-10-18（Asia/Shanghai）。

## 问题来源

用户提供的两封 Search Console 邮件分别报告：

| 报告 | 问题 | 严重程度 |
| --- | --- | --- |
| 产品摘要 | 未填写 `review`、`aggregateRating` | 非严重 |
| 商家信息 | 未填写 `image` | 严重 |
| 商家信息 | 未填写 `offers.shippingDetails`、`offers.hasMerchantReturnPolicy`，`brand` 对象类型无效 | 非严重 |

六个问题均指向唯一示例 `https://ggeo.ai/`，上次抓取日期为 **2026-10-13**。打开示例中的 Google 抓取 HTML，页面标题是 `ggeo.ai for sale | Spaceship.com`，描述为域名在 Spaceship 出售。这是当前目录上线之前的域名出售页，不是现有目录生成的商品标记。

## 当前线上状态

- 真实浏览器访问根地址后进入 `/en/`。英文、中文首页的 canonical 分别为 `https://ggeo.ai/en/`、`https://ggeo.ai/zh/`。
- 渲染后的首页 JSON-LD 只有 `WebSite`、`Organization`、`ItemList`；无 Microdata 或 RDFa 商品标记。当前详情页使用 `BreadcrumbList`。
- 当前模板不输出 `Product`、`Offer`、评价或评分，无需为历史出售页补图片、配送或退货政策。
- 根页面、`/en/`、`/zh/` 的线上原始 HTML 均返回 HTTP 200，且与本次本地构建逐字节一致；根页面包含立即进入 `/en/` 的 meta refresh。

Google 的[商家信息规则](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing#guidelines)要求页面能直接购买商品，跳转第三方官网的目录不符合条件。[产品摘要规则](https://developers.google.com/search/docs/appearance/structured-data/product-snippet#product)说明，只有 `offers` 而没有评价或评分时可产生非严重警告。[通用规则](https://developers.google.com/search/docs/appearance/structured-data/sd-policies#content)禁止虚假评价或与可见内容无关的标记。后续只有具备真实、可见且符合规则的数据时才应重新考虑商品或软件富媒体标记。

## 防止复发

在 `tests/site.test.mjs` 增加全站构建产物回归检查，递归核对 JSON-LD 类型及字段，并检查商品、报价或评价的 Microdata/RDFa 类型，防止目录重新输出不支持的商品和评价信息。

`npm run validate`、`npm run build`、`npm test` 均通过：36 个工具、8 类、104 个 HTML 页面、14 项测试。测试中的 HTTP 服务使用回环监听。中英首页本地浏览器检查通过，结构化数据类型正确，无横向溢出。

## Google 验证

已于 2026-10-18 在六个问题详情中分别提交“验证修正情况”，并逐项确认显示“验证已开始”，开始日期均为 2026/10/18：

| 报告 | 字段 | 提交后的状态 |
| --- | --- | --- |
| 商家信息 | `image` | 验证已开始 |
| 商家信息 | `offers.hasMerchantReturnPolicy` | 验证已开始 |
| 商家信息 | `offers.shippingDetails` | 验证已开始 |
| 商家信息 | `brand` | 验证已开始 |
| 产品摘要 | `aggregateRating` | 验证已开始 |
| 产品摘要 | `review` | 验证已开始 |

[商家信息报告](https://search.google.com/search-console/r/merchant-listings?resource_id=sc-domain%3Aggeo.ai)、[产品摘要报告](https://search.google.com/search-console/r/product?resource_id=sc-domain%3Aggeo.ai)。

提交受理与最终通过是不同状态；仍需等待 Google 完成重新抓取并更新报告。报告总览的旧计数也可能继续保留。本次线上模板已经正确，因此源码只增加回归测试与排查记录；按用户后续授权提交并发布，使防回归检查进入发布流程，页面内容保持一致。
