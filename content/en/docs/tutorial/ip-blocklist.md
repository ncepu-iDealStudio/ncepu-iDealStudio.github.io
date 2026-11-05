---
title: Block IP addresses
weight: 10
icon: shield
translationKey: tutorial-ip-blocklist
summary: Deny clients with the http.blaklist option
---

# Block IP addresses

## 1 Why a blocklist helps

A web server blocklist denies requests coming from specific IP addresses:

- **Stops malicious traffic**: the list typically holds addresses that launch DDoS attacks, brute force logins or injection attempts;
- **Protects server resources**: malicious traffic consumes bandwidth, CPU and memory that legit users need;
- **Improves data safety**: reduces the risk of data leaks and corruption;
- **Keeps the user experience intact**: avoids slowdowns or outages caused by abusive clients;
- **Compliance**: blocking sources tied to illegal activity helps meet regulations;
- **Smaller logs**: fewer useless log lines to analyse and monitor;
- **Custom access control**: block specific users or networks as needed;
- **Brand protection**: stopping abusive activity protects your reputation.

A blocklist is not perfect: several users may share one IP and legitimate traffic could be blocked, and the list needs regular updates. It is therefore usually combined with allow lists and firewall rules.

## 2 Configure the blocklist

The blocklist lives in the `blaklist` array under the `http` node (the field name follows the implementation):

```json
{
  "log_root": "./logs",
  "pid": "./fast-https.pid",
  "http": {
    "include": "mime.types",
    "blaklist": [
      "192.168.11.1-192.168.11.150",
      "192.168.1.151,59.66.66.66",
      "192.168.1.151"
    ],
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

`blaklist` enables the IP blocklist and accepts three forms:

| Form | Example | Meaning |
| --- | --- | --- |
| Range | `"192.168.11.1-192.168.11.150"` | Blocks every address in the range |
| Multiple IPs | `"192.168.1.151,59.66.66.66"` | Comma separated list |
| Single IP | `"192.168.1.151"` | Blocks that address only |

## 3 Verify a blocked client

Save the configuration, RELOAD, then access the server from a blocked IP. The response is:

```
403 BLACK BAN
```

A `403 BLACK BAN` response means the address is denied.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Check your own egress IP before saving, otherwise you may lock yourself out right after the reload.</div>
</div>
