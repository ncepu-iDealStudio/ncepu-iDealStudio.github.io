---
title: 配置 Web 应用访问限流
weight: 12
icon: gauge
translationKey: tutorial-rate-limit
summary: 用 servers_limit 限制请求速率与包体大小
---

# 配置 Web 应用访问限流

## 1 为何要配置访问限流

访问限流通过控制单位时间内到达 Web 服务器的请求数量，保护服务器资源、确保服务持续可用、提高用户体验并防御恶意攻击：

- **保护服务器资源**：避免请求过多导致过载，保护 CPU、内存、带宽不被耗尽；
- **提高服务质量**：高并发下依然能提供稳定快速的响应；
- **防止恶意攻击**：在一定程度上防御 DDoS 之类靠海量请求拖垮服务器的手法；
- **维护公平性**：防止个别用户或程序占用过多资源；
- **控制成本**：按使用量付费的云服务可避免突发流量带来费用激增；
- **优化用户体验**：避免流量高峰时响应缓慢或服务不可用。

## 2 站点访问限流配置

限流配置位于 `http` 节点下的 `servers_limit`：

```json
{
  "http": {
    "include": "mime.types",
    "servers_limit": {
      "limit": 1000000,
      "burst": 5000000,
      "max_body_size": 1048576,
      "max_header_size": 4096
    },
    "server": [
      {
        "listen": 7000,
        "server_name": "localhost",
        "location": [
          {
            "url": "/api1",
            "type": "rewrite",
            "rewrite": "http://xxxx.com"
          }
        ]
      }
    ]
  }
}
```

`servers_limit` 表示启用站点限流：

| 配置项 | 说明 | 单位 / 默认值 |
| --- | --- | --- |
| `limit` | 持续请求最大速率 | 以秒（s）为单位 |
| `burst` | 瞬时请求限制量 | 以秒（s）为单位 |
| `max_body_size` | 上传文件大小限制 | 以 byte 为单位，默认 32K |
| `max_header_size` | 请求头大小限制 | 以 byte 为单位，默认 4K |

## 3 触发规则

当某个 IP 访问站点的速率超过 `limit`，或请求量超过 `burst` 时，该 IP 会被加入黑名单并禁止访问。

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>限流触发后会直接进入 IP 黑名单（返回 <code>403 BLACK BAN</code>），调试阶段不要把 <code>limit</code> 与 <code>burst</code> 设得过小，否则容易把自己封掉。</div>
</div>

## 4 相关阅读

- 黑名单的写入格式与排查：[配置服务器访问 IP 黑名单](/docs/使用教程/配置服务器访问ip黑名单/)
