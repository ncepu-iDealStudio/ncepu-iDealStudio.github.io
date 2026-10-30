---
title: Rate limit a web app
weight: 10
summary: Cap requests per source to absorb floods
---

# Rate limit a web app

Rate limiting caps how many requests a single source may send in a time window, keeping floods and CC attacks away from the origin.

## 1 Create a rule

In "Security → Rate limiting":

1. Pick the site the rule applies to;
2. Choose the dimension (per IP or per domain);
3. Enter the threshold, e.g. "60 requests per minute";
4. Choose the action once exceeded (return 429 / temporary ban);
5. Save.

## 2 Suggested thresholds

| Scenario | Suggested threshold |
| --- | --- |
| Marketing site | 120 requests / IP / minute |
| API endpoints | 60 requests / IP / minute |
| Login endpoint | 10 requests / IP / minute |

## 3 How it counts

Limits are counted per client IP. If a CDN sits in front of your site, make sure Fast-Https can read the real visitor IP (not the CDN origin IP), otherwise the limit hits all traffic coming through the CDN.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Rate limiting and the IP blocklist complement each other: the blocklist is a hard stop, rate limiting a soft shield.</div>
</div>
