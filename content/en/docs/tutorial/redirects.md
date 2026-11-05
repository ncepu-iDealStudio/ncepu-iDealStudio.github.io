---
title: Configure redirects
weight: 7
icon: redirect
translationKey: tutorial-redirects
summary: Redirect requests with the rewrite location type
---

# Configure redirects

## 1 What a redirect is

A redirect is a server response technique that sends a user from one page or domain to another. It can be implemented on the server or the client, and the action is indicated mainly by an HTTP status code. A 301 redirect, for instance, is a permanent redirect meaning the resource of the old address has moved permanently to the new one.

Common scenarios:

- **Domain change**: when a site moves to a new domain, a 301 redirect sends visitors of the old domain to the new one while keeping search rankings and link equity;
- **Site structure optimisation**: after a redesign, old URLs redirect to the new structured pages;
- **Page migration**: a page moved elsewhere redirects visitors from the old address;
- **Handling error pages**: users are redirected from an error page to the correct one;
- **Multi-version sites**: the www and non-www versions use a 301 to declare the preferred domain and avoid split equity;
- **SEO strategy**: a 301 transfers page equity and avoids losses caused by URL changes.

## 2 Why redirects help

- **Consolidate equity**: equity from the old address moves to the new one, improving its ranking;
- **Better experience**: users no longer hit error pages after a URL change or page move;
- **Keep existing links**: inbound links stay valid instead of breaking;
- **Avoid duplicate content**: search engines index only one version;
- **Simpler management**: a sound redirect policy simplifies maintenance of large sites.

## 3 Redirect configuration

Set `type` to `rewrite` in the `location` and give the target address in `rewrite`:

```json
{
  "listen": 7000,
  "server_name": "localhost",
  "location": [
    {
      "url": "/api1",
      "type": "rewrite",
      "rewrite": "http://xxxx.com"
    }
  ]
}
```

| Option | Description |
| --- | --- |
| `listen` | Port the server listens on |
| `server_name` | Domain configured for this site |
| `url` | Regular expression the request path must match |
| `type` | `rewrite` enables redirecting |
| `rewrite` | Target address of the redirect |

## 4 Example: HTTP to HTTPS

```json
{
  "http": {
    "server": [
      {
        "listen": 80,
        "server_name": "xxxx.com",
        "location": [
          {
            "url": "/",
            "type": "rewrite",
            "rewrite": "https://xxxx.com"
          }
        ]
      },
      {
        "listen": "443 ssl",
        "server_name": "xxxx.com",
        "ssl_certificate": "config/cert/localhost.pem",
        "ssl_certificate_key": "config/cert/localhost-key.pem",
        "location": [
          {
            "url": "/",
            "type": "local",
            "root": "./httpdoc/root",
            "index": ["index.html", "index.htm"]
          }
        ]
      }
    ]
  }
}
```

Notes:

- The first `server` block listens on port 80 and rewrites every request to `https://xxxx.com`, so `http://xxxx.com` automatically moves to the encrypted address;
- The second block listens on `443 ssl` and is the actual configuration of the HTTPS site;
- `ssl_certificate` and `ssl_certificate_key` point at the certificate and key files;
- `root` and `index` define the static directory and its default documents.
