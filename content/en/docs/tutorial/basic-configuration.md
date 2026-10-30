---
title: Basic configuration
weight: 1
summary: First-run settings in the Fast-Https console
---

# Basic configuration

This page covers the basics of the Fast-Https console and the settings you need right after the first start.

## 1 Open the management console

After Fast-Https starts, find its icon in the Windows **notification area**, double click it and the local console opens. The default address is:

```text
http://localhost:8080/
```

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>If the console does not open, check that the tray program is running and that port 8080 is not taken by another process.</div>
</div>

## 2 Port settings

The console port can be changed in "System settings → Listen ports". A **service restart** is required for the change to apply.

| Item | Default | Purpose |
| --- | --- | --- |
| Console port | 8080 | Serves the management UI in the browser |
| Proxy HTTPS port | 443 | Public encrypted access |
| Proxy HTTP port | 80 | Optional, used to redirect to HTTPS |

## 3 Create your first site

1. Open "Sites", click **New site**;
2. Enter the **domain** (e.g. `example.local`, or a public domain already pointing here);
3. Pick the site type: **static folder**, **reverse proxy** or **single page app**;
4. Save it — the site appears in the list as "stopped", click start to run it.

## 4 Apply changes

Most configuration takes effect as soon as you save it. Changing listen ports or re-issuing certificates requires a restart; the status bar tells you when that is the case.

Next, follow [Publish a local static site](/en/docs/tutorial/publish-local-static-site/) to get your first site online.
