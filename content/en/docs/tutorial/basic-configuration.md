---
title: Basic configuration
weight: 1
icon: settings
translationKey: tutorial-basic-config
summary: Tray menu, config file location and overall structure
---

# Basic configuration

Every site in Fast-Https is described by a single JSON configuration file. Edit the file, reload the service and the change applies. This page covers how the service starts, where the file lives and what it looks like.

## 1 Start and tray menu

On Windows, double click `monitor.exe` in the application folder; on Linux, run `./fast-https` in a terminal. An icon appears in the notification area. Its context menu offers four actions:

| Menu item | Action |
| --- | --- |
| START | Start the web service |
| STOP | Stop the web service |
| RELOAD | Reload the configuration file without stopping the process |
| QUIT | Exit the tray program |

## 2 Default page

Once the service is running, open `http://localhost:8080/` to see the default Fast-Https start page, which offers the root certificate `root.crt` for download (see [Serve a site over HTTPS](/docs/tutorial/https-access/)).

## 3 Where the configuration file lives

| Platform | Main configuration file |
| --- | --- |
| Windows | `D:\fast-https_Windows_x86_64\config\fast-https.json` |
| Linux | `/usr/local/fast-https/config/fast-https.json` |

## 4 Configuration file structure

A minimal working main configuration file looks like this:

```json
{
  "log_root": "./logs",
  "pid": "./fast-https.pid",
  "http": {
    "include": "mime.types",
    "server": [
      {
        "listen": 8080,
        "server_name": "localhost",
        "location": [
          {
            "url": "/",
            "type": "local",
            "root": "./httpdoc/www.myweb.com",
            "index": ["index.html", "index.htm"]
          }
        ]
      }
    ]
  }
}
```

Top level options:

| Option | Description | Example |
| --- | --- | --- |
| `log_root` | Log directory | `./logs` |
| `pid` | Path of the process PID file | `./fast-https.pid` |
| `http.include` | MIME type table, or a directory of site configs | `"mime.types"` / `["./config/conf.d"]` |
| `http.server` | List of sites, each entry is one virtual host | see below |

Common options inside a `server` block:

| Option | Description |
| --- | --- |
| `listen` | Listening port; use `"443 ssl"` for an encrypted listener |
| `server_name` | Domain served by this site |
| `ssl_certificate` | Certificate path, only needed by `ssl` listeners |
| `ssl_certificate_key` | Private key path, only needed by `ssl` listeners |
| `location` | List of path rules that decide how a request is handled |

A `location` block uses `type` to select the handler:

| `type` | Meaning | Related options | Reference |
| --- | --- | --- | --- |
| `local` | Publish a local static directory | `root`, `index`, `try` | [Publish a local static site](/docs/tutorial/publish-local-static-site/) |
| `proxy` | Reverse proxy an upstream service | `proxy_pass`, `proxy_set_header`, `proxy_cache` | [Reverse proxy a site](/docs/tutorial/reverse-proxy-site/) |
| `rewrite` | Redirect to another address | `rewrite` | [Configure redirects](/docs/tutorial/redirects/) |

## 5 Apply the changes

Save the file and choose **RELOAD** from the tray menu. If the change touches a listening port or the certificate files themselves, prefer **STOP** followed by **START** so the port is released cleanly.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>JSON has no comments. When you copy a sample from another document, delete any line starting with <code>#</code>, otherwise the service fails to read the configuration.</div>
</div>
