---
title: Cache a reverse proxy site
weight: 8
summary: Keep upstream responses locally to cut origin load
---

# Cache a reverse proxy site

Enabling cache on a reverse proxy site stores upstream responses locally, so repeated requests hit the cache instead of the origin — lower origin load, faster responses.

## 1 Turn the cache on

In the reverse proxy site's "Advanced settings → Cache":

1. Tick **Enable cache**;
2. Set the cache folder and its maximum size;
3. Set the time to live (TTL);
4. Save and restart the site.

## 2 Cache options

| Option | Description |
| --- | --- |
| Cache folder | Local path that stores cached responses |
| Max size | Evicts old entries with LRU once exceeded |
| TTL | Longest time a resource stays cached |
| Ignore query | Whether the full query string is part of the cache key |

## 3 When it helps

- Sites with plenty of static assets (images, scripts, styles);
- An origin that is weak and needs to absorb traffic spikes.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>For APIs whose content changes often, disable the cache or keep the TTL short to avoid stale responses.</div>
</div>
