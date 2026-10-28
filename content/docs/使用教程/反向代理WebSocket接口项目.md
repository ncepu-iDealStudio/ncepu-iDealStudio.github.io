---
title: 反向代理 WebSocket 接口项目
weight: 5
---

# 反向代理 WebSocket 接口项目

当本地服务使用 WebSocket（如实时聊天、行情推送）时，需要在反向代理中允许协议升级，否则连接会在握手阶段失败。

## 一 需要代理的目标项目

先确认本地 WebSocket 服务可以独立运行，例如监听 `127.0.0.1:8081`：

![目标项目](/assets/images/1712113683954-c20735a0-2a5f-4497-9e48-bd42ebc81524-d8ffc2dd789c4336c797a185f21b251c.png)

## 二 配置 Fast-Https 代理

在反向代理站点的配置中，把上游指向该服务并开启 WebSocket 升级：

```json
{
  "listen": 8080,
  "server_name": "localhost",
  "location": [
    { "url": "/socket", "type": "proxy", "root": "http://127.0.0.1:8081", "websocket": true }
  ]
}
```

保存并重启后，前端通过 `ws://localhost:8080/socket`（或 `wss://` 加密连接）即可通信。

## 注意事项

| 项目 | 建议 |
| --- | --- |
| 连接保活 | 确认本地服务发送心跳，避免被代理超时断开 |
| 路径匹配 | WebSocket 路径需与上游一致 |
| HTTPS | 对外统一使用 `wss://`，由 Fast-Https 完成 TLS 终结 |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>若连接频繁断开，优先检查本地服务的空闲超时设置，以及防火墙是否放行了对应端口。</div>
</div>
