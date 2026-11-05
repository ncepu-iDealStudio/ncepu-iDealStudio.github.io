---
title: Other default options
weight: 11
icon: sliders
translationKey: tutorial-log-options
summary: Control access log fields with log_split and log_format
---

# Other default options

Besides site, proxy and security options, the `http` node holds a group of defaults that control how access logs are written.

## 1 Log format options

```json
{
  "http": {
    "log_split": " ",
    "log_format": [
      "user_agent", "time", "type", "method", "path"
    ]
  }
}
```

| Option | Type | Description |
| --- | --- | --- |
| `log_split` | String | Separator placed between log fields, a single space in the example |
| `log_format` | Array of strings | Fields written to the log and their order; joined with `log_split` |

## 2 Variables accepted by `log_format`

Each entry of `log_format` is one of the following:

| Variable | Meaning |
| --- | --- |
| `user_agent` | Client User-Agent |
| `ip_port` | Client IP and port |
| `time` | Request time |
| `type` | Log type |
| `method` | HTTP method |
| `path` | Request path |
| `host` | Requested host name |
| `status` | Response status code |
| `size` | Response body size |
| `referer` | Referer address |

## 3 Examples

Log the client IP and port, time, method, path and status with the default separator:

```json
{
  "http": {
    "log_split": " ",
    "log_format": [
      "ip_port", "time", "method", "path", "status"
    ]
  }
}
```

To make logs easy to split later, pick a separator that never appears inside a field:

```json
{
  "http": {
    "log_split": "|",
    "log_format": [
      "time", "ip_port", "method", "path", "status", "size", "user_agent"
    ]
  }
}
```

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>User-Agent values can contain spaces, so a space separator makes the field count unstable when parsing. Prefer <code>|</code>, <code>\t</code> or another character unlikely to appear in the content.</div>
</div>
