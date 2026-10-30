---
title: Configure redirects
weight: 6
summary: Send requests from one address to another
---

# Configure redirects

Redirects move a request from one address to another — HTTP to HTTPS, an old domain to a new one, or a retired page to the home page.

## 1 Common redirect types

| Type | Example | Use case |
| --- | --- | --- |
| HTTP → HTTPS | `http://a.com` → `https://a.com` | Force encrypted access |
| Domain move | `old.com` → `new.com` | Domain migration |
| Path move | `/temp` → `/` | Retire a temporary page |

## 2 Steps

1. Open the site's "Advanced settings → Redirect rules";
2. Choose the redirect type, then fill in source and target;
3. Pick the status code (301 permanent / 302 temporary);
4. Save and restart the site.

## 3 Recommendations

- Use **301** for permanent, production redirects;
- Use **302** for campaign pages and temporary maintenance;
- Turning on "HTTP to HTTPS" upgrades every plain request automatically.

Pair redirects with encryption — see [Serve a site over HTTPS](/en/docs/tutorial/https-access/).
