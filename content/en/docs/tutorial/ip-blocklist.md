---
title: Block IP addresses
weight: 9
summary: Deny specific sources with a blocklist
---

# Block IP addresses

The IP blocklist denies requests from specific sources — useful to stop malicious crawlers, attack sources or unwanted visitors quickly.

## 1 Add a rule

In "Security → Access blocklist":

1. Click **New rule**;
2. Enter the IP or subnet to deny, for example:

```text
192.168.1.100
10.0.0.0/24
```

3. Choose the scope (global or a single site);
4. Save — it applies immediately.

## 2 Matching

| Form | Example | Meaning |
| --- | --- | --- |
| Single IP | `1.2.3.4` | Block that address |
| CIDR | `1.2.3.0/24` | Block the whole subnet |
| Wildcard | `*.example.com` | Match by host name (optional) |

## 3 Notes

- The blocklist wins over the default allow policy;
- If you block yourself, `127.0.0.1` is always allowed, so you can still open the console and remove the rule.

Pair it with rate limiting — see [Rate limit a web app](/en/docs/tutorial/rate-limiting/).
