---
title: Reverse proxy samples
weight: 13
icon: book
translationKey: tutorial-proxy-samples
summary: Choose a static site, HTTP proxy, or HTTPS proxy configuration for your app
lastmod: 2026-11-06
---

# Reverse proxy samples

These templates configure the Fast-Https side of common deployments. Serve Vue build output as static files, or forward traffic to an already running backend (the upstream). Pick the example that fits your setup.

| Goal | Example | What Fast-Https does |
| --- | --- | --- |
| Serve static files | Vue | Reads and serves the build output |
| Forward requests to an HTTP API | Flask | Proxies requests to the upstream |
| Expose a backend over HTTPS | GitLab, Jenkins | Handles HTTPS and forwards to an HTTP upstream |
| Redirect the HTTP entry page to HTTPS | Jira, SonarQube | Redirects on port 80 and proxies on port 443 |

## 1 Put the configuration in the right place

In the Fast-Https v1.5.0 archive, `config/fast-https.json` uses `"include": ["./conf.d"]` to load sites from `config/conf.d/`. Keep your existing settings and create the files named in your chosen example. **Put one JSON object in each file.** If you manage sites in the main file instead, add each object as a separate item in `http.server`. Use one of these methods per site.

Replace the `*.example.com` placeholders with your domains pointing to the Fast-Https host, and make sure the chosen ports are available. The address `127.0.0.1` assumes that the upstream runs on the same machine. If it runs elsewhere, set `proxy_pass` to an address and port reachable from Fast-Https. For HTTPS examples, put the certificate and private key under `config/cert/` and update both paths. See [Serve a site over HTTPS](/en/docs/tutorial/https-access/) for help with certificates.

## 2 Serve a Vue site

Put the built `index.html` and assets in the deployment directory. Save the example as `config/conf.d/club.example.com.json` and set `root` to the actual directory. Once the configuration takes effect, the HTTP domain should show the Vue home page.

```json
{
  "listen": 80,
  "server_name": "club.example.com",
  "location": [
    {
      "url": "/",
      "type": "local",
      "root": "/var/www/club.example.com",
      "index": ["index.html", "index.htm"]
    }
  ]
}
```

If your app must fall back to the home page when a client-side route is refreshed, see [Publish a single-page app](/en/docs/tutorial/publish-single-page-site/).

## 3 Proxy a Flask API

First, request a known Flask endpoint from the Fast-Https host to confirm that the upstream responds. Save the example as `config/conf.d/api.example.com.json`. After applying it, request the same path through the proxy domain and check the status and body.

```json
{
  "listen": 80,
  "server_name": "api.example.com",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:5001"
    }
  ]
}
```

## 4 Serve GitLab or Jenkins over HTTPS

These examples assume an upstream that already serves HTTP. Match the application's public URL to the domain and scheme visitors use. Refer to [GitLab's external TLS termination settings](https://docs.gitlab.com/omnibus/settings/ssl/#configure-a-reverse-proxy-or-load-balancer-ssl-termination) or [Jenkins reverse proxy guidance](https://www.jenkins.io/doc/book/system-administration/reverse-proxy-configuration-with-jenkins/) for application-specific settings.

### GitLab

Save as `config/conf.d/gitlab.example.com.json`. This configuration sets `Connection: keep-alive` on requests to GitLab.

```json
{
  "listen": "443 ssl",
  "server_name": "gitlab.example.com",
  "ssl_certificate": "./cert/gitlab.example.com.pem",
  "ssl_certificate_key": "./cert/gitlab.example.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:9980",
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

### Jenkins

Save as `config/conf.d/jenkins.example.com.json`.

```json
{
  "listen": "443 ssl",
  "server_name": "jenkins.example.com",
  "ssl_certificate": "./cert/jenkins.example.com.pem",
  "ssl_certificate_key": "./cert/jenkins.example.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:9780"
    }
  ]
}
```

## 5 Add an HTTPS entry point for Jira or SonarQube

Use two files per service. The HTTP site redirects to the HTTPS home page, and the HTTPS site proxies traffic to the upstream. The `rewrite` rule below has a fixed destination for the entry page. If your redirect needs to preserve paths and query strings, test the rule you choose with real URLs.

### Jira

Save the HTTP site as `config/conf.d/jira-http.json`.

```json
{
  "listen": 80,
  "server_name": "jira.example.com",
  "location": [
    {
      "url": "/",
      "type": "rewrite",
      "rewrite": "https://jira.example.com/"
    }
  ]
}
```

Save the HTTPS site as `config/conf.d/jira-https.json`.

```json
{
  "listen": "443 ssl",
  "server_name": "jira.example.com",
  "ssl_certificate": "./cert/jira.example.com.pem",
  "ssl_certificate_key": "./cert/jira.example.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:9880"
    }
  ]
}
```

### SonarQube

Save the HTTP site as `config/conf.d/sonarqube-http.json`.

```json
{
  "listen": 80,
  "server_name": "sonarqube.example.com",
  "location": [
    {
      "url": "/",
      "type": "rewrite",
      "rewrite": "https://sonarqube.example.com/"
    }
  ]
}
```

Save the HTTPS site as `config/conf.d/sonarqube-https.json`.

```json
{
  "listen": "443 ssl",
  "server_name": "sonarqube.example.com",
  "ssl_certificate": "./cert/sonarqube.example.com.pem",
  "ssl_certificate_key": "./cert/sonarqube.example.com-key.pem",
  "location": [
    {
      "url": "/",
      "type": "proxy",
      "proxy_pass": "http://127.0.0.1:9000"
    }
  ]
}
```

## 6 Apply and check the configuration

Save the configuration files. Fast-Https reads them the next time it starts. If it is already running, reload the configuration with the following Linux command from the extracted Fast-Https directory.

```bash
./fast-https reload
```

For a static site, check that the home page and its assets load. For a proxy, request a known path and compare the direct upstream response with the response through Fast-Https. For HTTPS, check that the browser trusts the certificate. If you configured an HTTP entry point, visit its home page and check that the address bar shows the HTTPS URL from `rewrite`.
