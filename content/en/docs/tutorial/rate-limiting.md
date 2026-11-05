---
title: Rate limit a web app
weight: 12
icon: gauge
translationKey: tutorial-rate-limit
summary: Throttle requests with the http.servers_limit option
---

# Rate limit a web app

## 1 Why rate limiting matters

Rate limiting caps how many requests reach the web server in a given period, protecting server resources, keeping the service available, improving the experience and defending against abuse:

- **Protects resources**: prevents overload and exhaustion of CPU, memory and bandwidth;
- **Keeps quality**: stable, fast responses under high concurrency;
- **Defends against attacks**: mitigates DDoS-style floods built from huge request volumes;
- **Fairness**: stops a single user or program from consuming most resources;
- **Cost control**: avoids surprise bills on usage-based cloud services;
- **Better experience**: no slowdowns or outages during traffic peaks.

## 2 Configure the site limit

The limit lives in `servers_limit` under the `http` node:

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

`servers_limit` enables site rate limiting:

| Option | Description | Unit / default |
| --- | --- | --- |
| `limit` | Maximum sustained request rate | per second (s) |
| `burst` | Instantaneous request allowance | per second (s) |
| `max_body_size` | Upload size limit | bytes, default 32K |
| `max_header_size` | Request header size limit | bytes, default 4K |

## 3 When the limit trips

When an IP exceeds `limit` or sends more requests than `burst`, that IP is added to the blocklist and denied access.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Tripping the limit writes the client straight into the IP blocklist (returning <code>403 BLACK BAN</code>), so do not set <code>limit</code> and <code>burst</code> too low while debugging or you will block yourself.</div>
</div>

## 4 Related reading

- Blocklist format and troubleshooting: [Block IP addresses](/en/docs/tutorial/ip-blocklist/)
