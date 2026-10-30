---
title: Serve a site over HTTPS
weight: 7
summary: Start the service, download the certificate, trust it
---

# Serve a site over HTTPS

Going from HTTP to HTTPS takes three steps: start the service, download the certificate, install it. This page walks the whole chain.

## 1 HTTP versus HTTPS

HTTP is the foundation of data exchange on the web, but it is not secure — anyone in the path can intercept the traffic. HTTPS is the secure version of HTTP: data between the browser and the server is encrypted.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>The lock icon and the HTTPS prefix are the first trust signal visitors see, and a ranking factor for search engines.</div>
</div>

| Detail | HTTP | HTTPS |
| --- | --- | --- |
| URL | Prefixed `http://` | Prefixed `https://` |
| Port | 80 | 443 |
| Security | Known weaknesses | Removes interception risks |

HTTPS also brings SEO benefits, compliance (GDPR for example) and protection against content injection — it is the baseline for any modern site.

## 2 Configure a self-signed certificate

### 2.1 Start the Fast-Https service

Click the tray icon in the notification area and start the local web management service.

### 2.2 Download the certificate

Open the local management address in the browser and download the root certificate `root.crt` from the console.

```text
http://localhost:8080/
```

### 2.3 Install the certificate (Windows)

Find **root.crt** in your download folder, choose "Current user" and finish the import so Windows trusts the self-signed certificate. The lock icon then appears in the address bar.
