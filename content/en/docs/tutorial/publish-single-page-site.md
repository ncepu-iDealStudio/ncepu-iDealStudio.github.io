---
title: Publish a single page app
weight: 3
summary: History-mode fallback so refreshing a sub route does not 404
---

# Publish a single page app

A single page app (SPA, e.g. a Vue or React build) handles every route in the browser with history mode. Without a fallback, refreshing a sub route returns 404.

## 1 How it differs from a multi-page site

| Type | Behaviour | Refreshing a sub route |
| --- | --- | --- |
| Multi-page site | One html file per route | Works |
| Single page app | Only `index.html`, routing in the frontend | Must fall back to `index.html` |

## 2 Create the site

1. Create a site and choose **single page app (SPA)** as the type;
2. Enter the domain and the local root folder (point it at `dist/` or `build/`);
3. Turn on **history fallback** so every unmatched path returns `index.html`;
4. Save and start the site.

## 3 Verify

The root path loads as expected, and manually refreshing `/about`, `/user/123` and other sub routes should still render the app instead of a 404.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>If your SPA uses hash routing (`#/about`), no history fallback is needed — publish it like a normal static site.</div>
</div>
