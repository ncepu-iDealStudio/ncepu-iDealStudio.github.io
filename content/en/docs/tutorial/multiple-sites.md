---
title: Publish multiple sites
weight: 6
icon: layers
translationKey: tutorial-multiple-sites
summary: Split site configs into conf.d with http.include
---

# Publish multiple sites

Fast-Https supports configuring and publishing several applications through config file inclusion, much like Nginx. You can of course put every site into the main `fast-https.json`, but once the number of applications grows that single file becomes tedious to maintain.

## 1 Enable the config directory

Inside `/fast-https/config/` there is a `conf.d` folder that holds one file per site. Suppose we want to publish two proxied sites, `www.a.com` and `www.b.com`. First check whether the main `fast-https.json` contains the following option:

```json
{
  "http": {
    "include": [
      "./config/conf.d"
    ]
  }
}
```

If it is missing, add it manually. The main configuration file then looks like this:

```json
{
  "log_root": "./logs",
  "pid": "./fast-https.pid",
  "http": {
    "include": [
      "./config/conf.d"
    ]
  }
}
```

## 2 Create one file per site

In the `conf.d` folder create a configuration file per site, named after the domain — for example `www.a.com.json` and `www.b.com.json`.

For a reverse proxied site:

```json
{
  "listen": 80,
  "server_name": "www.a.com",
  "location": [
    {
      "type": "proxy",
      "url": "/",
      "proxy_pass": "http://192.168.1.11:5001",
      "proxy_set_header": [
        {
          "HeaderKey": "Host",
          "HeaderValue": "$proxy_host"
        }
      ]
    }
  ]
}
```

To publish a local static site without a proxy:

```json
{
  "listen": 80,
  "server_name": "www.b.com",
  "location": [
    {
      "type": "local",
      "url": "/",
      "root": "/var/www/www.b.com",
      "index": ["index.html", "index.htm"]
    }
  ]
}
```

## 3 Reload and test

Choose **RELOAD** from the tray menu, then visit both configured domains to verify each site.

## 4 Option reference

| Option | Description |
| --- | --- |
| `http.include: ["./config/conf.d"]` | Declares the directory of child configs and splits multi-site management, like Nginx `include` |
| `log_root` / `pid` | Log directory and PID file path |
| `listen` | Listening port, `80` in the example; HTTPS needs its own listener |
| `server_name` | Site domain, used to route requests by Host |
| `location[].type = "proxy"` | Reverse proxy mode, pairs with `proxy_pass` |
| `proxy_set_header` | Keeps or rewrites request headers, here `Host: $proxy_host` |
| `location[].type = "local"` | Local static mode, pairs with `root` and `index` |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Naming child files after the domain (such as <code>www.a.com.json</code>) keeps long-term maintenance simple. When several sites share one <code>listen</code> port, Fast-Https routes each request by its Host header.</div>
</div>
