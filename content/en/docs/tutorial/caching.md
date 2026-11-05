---
title: Cache a reverse proxy site
weight: 9
icon: zap
translationKey: tutorial-caching
summary: Store upstream responses with proxy_cache
---

# Cache a reverse proxy site

## 1 Why cache a reverse proxy site

Caching a reverse proxied site improves performance and the user experience, and also strengthens stability and security:

- **Performance**: resources enter the cache on the first request, so later requests are answered from cache with fewer backend round trips;
- **Less backend load**: cached images, CSS and JavaScript free the application server to handle dynamic requests;
- **Bandwidth savings**: repeated requests for the same resource are served by the proxy instead of the origin;
- **Better experience**: faster resource loading means smoother pages and shorter waits;
- **Stability**: cached and distributed requests mean one overloaded server no longer affects the whole system;
- **Hot updates**: cache lifetimes can be tuned per status so updated content reaches users quickly;
- **Security**: long lifetimes for immutable assets reduce direct exposure of the origin.

## 2 Configure proxy caching

Add `proxy_cache` to the `location` of a reverse proxied site:

```json
{
  "listen": 9090,
  "server_name": "localhost",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://xxxx.com",
      "proxy_cache": {
        "path": "cache",
        "valid": ["200:1h", "304:1h", "any:30m"],
        "key": "$request_method$host$request_uri"
      }
    }
  ]
}
```

`proxy_cache` enables the proxy cache:

| Option | Description |
| --- | --- |
| `path` | Directory that stores cached files |
| `valid` | Cache lifetime per response status, written as `status:duration` |
| `key` | Rule that builds the cache file name from variables |

The example caches the upstream `xxxx.com`: `path` is the cache location, `valid` lists the lifetime for each status (status 200 is cached for one hour, `any` falls back to 30 minutes) and `key` builds the cache file name.

## 3 Recommendations

- Sites with many static assets benefit the most;
- For fast-changing APIs, shorten the lifetime of the matching status codes or exclude them from caching;
- RELOAD after changing `proxy_cache`.
