---
title: Publish a single page app
weight: 3
icon: app
translationKey: tutorial-spa
summary: Fall back unmatched routes to index.html with the try module
---

# Publish a single page app

Mainstream front-end frameworks such as React and Vue are single page applications: every URL serves the same document (usually `index.html`), and the JavaScript framework then routes to the matching page component.

Requesting a deep link such as `/usr/info` therefore asks for a file that does not exist, and the server returns 404.

## 1 The solution

Edit `config/fast-https.json` and add a `try` module to the `location`:

```json
{
  "log_root": "./logs",
  "pid": "./fast-https.pid",
  "http": {
    "server": [
      {
        "listen": 8080,
        "server_name": "localhost",
        "location": [
          {
            "url": "/",
            "type": "local",
            "root": "./httpdoc/club.quwancode.com",
            "try": [
              {
                "uri": "^.*$",
                "file": ["index.html", "index.htm"],
                "next": "index.html"
              }
            ]
          }
        ]
      }
    ],
    "include": [
      "./config/conf.d"
    ]
  }
}
```

Fast-Https supports a `try` module: when a request matches no rule, or the page resource cannot be found, the resource named by `next` is returned.

## 2 How the options work

`try` is an array evaluated in order; each entry has three fields:

```json
{
  "try": [
    {
      "uri": "^.*$",
      "file": ["index.html"],
      "next": ""
    },
    {
      "uri": "^.*$",
      "file": ["index.htm"],
      "next": "404.html"
    }
  ]
}
```

| Field | Description |
| --- | --- |
| `uri` | Regular expression matched against the request path. If it does not match and `next` is empty, the next entry is evaluated; if it does not match and `next` is set, `next` is returned |
| `file` | When `uri` matches, the default page is looked up in `file` in order |
| `next` | When set, returned if the page resource cannot be found |

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>A single page app is just every unmatched path falling back to <code>index.html</code>. If your app uses hash routing (<code>#/about</code>), it works without any <code>try</code> configuration.</div>
</div>

## 3 Verify

Save, RELOAD, open the root path, then refresh a deep link such as `/user/info` — it should load the page instead of returning 404.
