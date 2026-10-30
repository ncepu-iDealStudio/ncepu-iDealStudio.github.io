---
title: Reverse proxy a WebSocket service
weight: 5
summary: Allow protocol upgrade so the handshake succeeds
---

# Reverse proxy a WebSocket service

When a local service speaks WebSocket (real-time chat, market feeds), the reverse proxy has to allow the protocol upgrade — otherwise the connection fails during the handshake.

## 1 The upstream project

First make sure the local WebSocket service runs on its own, for example listening on `127.0.0.1:8081`:

![Upstream project](/assets/images/docs/tutorial/5.1.png)

## 2 Configure the proxy

Point the upstream at that service and enable the WebSocket upgrade:

```json
{
  "listen": 8080,
  "server_name": "localhost",
  "location": [
    { "url": "/socket", "type": "proxy", "root": "http://127.0.0.1:8081", "websocket": true }
  ]
}
```

After saving and restarting, the frontend can talk over `ws://localhost:8080/socket` (or `wss://` for an encrypted connection).

## Things to watch

| Item | Recommendation |
| --- | --- |
| Keep-alive | Make the local service send heartbeats so the proxy does not time the connection out |
| Path matching | The WebSocket path must match the upstream path |
| HTTPS | Use `wss://` externally and let Fast-Https terminate TLS |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Frequent disconnects are usually the idle timeout of the local service, or a firewall blocking the port.</div>
</div>
