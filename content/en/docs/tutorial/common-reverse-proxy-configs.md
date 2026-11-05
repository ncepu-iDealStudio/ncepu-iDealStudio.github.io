---
title: Reverse proxy samples
weight: 13
icon: book
translationKey: tutorial-proxy-samples
summary: Reference configurations for common upstream services
---

# Reverse proxy samples

This page collects configuration snippets for common backend services that you can adapt directly. Every snippet can live in the `http.server` array of the main configuration file, or be split into its own file under `conf.d` as described in [Publish multiple sites](/en/docs/tutorial/multiple-sites/).

## 1 A Vue static site

```json
{
  "listen": 80,
  "server_name": "club.quwancode.com",
  "location": [
    {
      "type": "local",
      "url": "/",
      "root": "/var/www/club.quwancode.com",
      "index": ["index.html", "index.htm"]
    }
  ]
}
```

## 2 A Flask API

```json
{
  "listen": 80,
  "server_name": "api.club.quwancode.com",
  "location": [
    {
      "type": "proxy",
      "url": "/",
      "proxy_pass": "http://192.168.1.11:5001"
    }
  ]
}
```

## 3 GitLab

```json
{
  "listen": "443 ssl",
  "server_name": "gitlab.quwancode.com",
  "ssl_certificate": "config/cert/gitlab.quwancode.com.pem",
  "ssl_certificate_key": "config/cert/gitlab.quwancode.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://10.191.44.123:9980",
      "proxy_set_header": [
        {
          "HeaderKey": "Connection",
          "HeaderValue": "keep-alive"
        }
      ]
    }
  ]
}
```

## 4 Jenkins

```json
{
  "listen": "443 ssl",
  "server_name": "jenkins.quwancode.com",
  "ssl_certificate": "config/cert/jenkins.quwancode.com.pem",
  "ssl_certificate_key": "config/cert/jenkins.quwancode.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:9780"
    }
  ]
}
```

## 5 Jira

Redirect every request on port 80 to HTTPS, then proxy port 443 to the internal service:

```json
[
  {
    "listen": 80,
    "server_name": "jira.quwancode.com",
    "location": [
      {
        "url": "/",
        "type": "rewrite",
        "rewrite": "https://jira.quwancode.com"
      }
    ]
  },
  {
    "listen": "443 ssl",
    "server_name": "jira.quwancode.com",
    "ssl_certificate": "config/cert/jira.quwancode.com.pem",
    "ssl_certificate_key": "config/cert/jira.quwancode.com-key.pem",
    "location": [
      {
        "url": "/",
        "type": "proxy",
        "proxy_pass": "http://127.0.0.1:9880"
      }
    ]
  }
]
```

## 6 SonarQube

```json
[
  {
    "listen": 80,
    "server_name": "sonarqube.quwancode.com",
    "location": [
      {
        "url": "/",
        "type": "rewrite",
        "rewrite": "https://sonarqube.quwancode.com"
      }
    ]
  },
  {
    "listen": "443 ssl",
    "server_name": "sonarqube.quwancode.com",
    "ssl_certificate": "config/cert/sonarqube.quwancode.com.pem",
    "ssl_certificate_key": "config/cert/sonarqube.quwancode.com-key.pem",
    "location": [
      {
        "url": "/",
        "type": "proxy",
        "proxy_pass": "http://127.0.0.1:9000"
      }
    ]
  }
]
```

## 7 Scenario overview

| Scenario | `location[].type` | Key options |
| --- | --- | --- |
| Vue / React static site | `local` | `root`, `index` |
| Backend API (Flask / Java / PHP) | `proxy` | `proxy_pass` |
| GitLab | `proxy` | `proxy_pass`, `proxy_set_header: Connection: keep-alive` |
| Jenkins | `proxy` | `proxy_pass` |
| Jira / SonarQube | `rewrite` + `proxy` | Port 80 redirects to HTTPS, 443 proxies to the internal port |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>Domains, internal IPs and ports in the samples are placeholders — replace them with your own values. An <code>ssl</code> listener always needs both <code>ssl_certificate</code> and <code>ssl_certificate_key</code>.</div>
</div>
