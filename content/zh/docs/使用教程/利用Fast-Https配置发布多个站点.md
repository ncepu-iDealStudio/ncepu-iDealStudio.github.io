---
title: 利用 Fast-Https 配置发布多个站点
weight: 6
icon: layers
translationKey: tutorial-multiple-sites
summary: 用 conf.d 拆分多个站点配置
---

# 利用 Fast-Https 配置发布多个站点

Fast-Https 支持以配置文件包含的方式来配置和发布多个应用（与 Nginx 类似）。当然，你也可以把所有站点都放在主配置文件 `fast-https.json` 中，只是当要发布的应用多了以后，这个文件更新管理起来会比较繁琐。

## 1 开启配置目录包含

在 `/fast-https/config/` 文件夹中有一个 `conf.d` 文件夹，用于存放各站点的独立配置。假定我们要发布两个代理站点 `www.a.com` 和 `www.b.com`，先检查主配置文件 `fast-https.json` 中是否包含以下配置项：

```json
{
  "http": {
    "include": [
      "./config/conf.d"
    ]
  }
}
```

如果没有，手工添加一下。此时主配置文件内容如下：

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

## 2 为每个站点建立配置文件

在 `conf.d` 文件夹中新建各站点的配置文件，可以直接用站点名称命名，例如 `www.a.com.json` 和 `www.b.com.json`。

反向代理站点的配置内容参考如下：

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

直接发布本地静态站点、不需要反向代理时：

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

## 3 重载并测试

点击托盘菜单 **RELOAD** 重新加载 Fast-Https，然后分别用两个站点的配置域名进行访问测试。

## 4 配置项对照

| 配置项 | 作用 |
| --- | --- |
| `http.include: ["./config/conf.d"]` | 主配置中声明子配置目录，实现多站点拆分管理（类似 Nginx 的 include） |
| `log_root` / `pid` | 日志目录与 PID 文件路径 |
| `listen` | 监听端口，示例为 80；HTTPS 端口按需另配 |
| `server_name` | 站点域名，用于按 Host 分流 |
| `location[].type = "proxy"` | 反向代理模式，配合 `proxy_pass` 指向后端服务 |
| `proxy_set_header` | 透传或改写请求头，示例将 `Host` 设为 `$proxy_host` |
| `location[].type = "local"` | 本地静态站点模式，配合 `root`、`index` |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>子配置文件名与站点域名保持一致（如 <code>www.a.com.json</code>）便于长期维护；所有站点共用同一个 <code>listen</code> 端口时，Fast-Https 会按请求的 Host 分流到对应站点。</div>
</div>
