---
title: Archive deployment
weight: 20
translationKey: install-linux-centos-archive
summary: Start and verify the default site from the .tar.gz archive
lastmod: 2026-11-10
---

# Archive deployment

This guide runs Fast-Https straight from a `.tar.gz` archive, without installing a package. `.tar.gz` is a common Linux compressed format: unpacking it gives you the program and its configuration directly, with no package manager involved, so it works on any distribution. For other methods, see [CentOS 7 installation and deployment](../rpm/) and [Install on Ubuntu](../ubuntu/).

## Before you start

- Run every command **in the server's terminal** with administrative rights. Log in as `root`, or prefix commands with `sudo`.
- The default site uses **ports 80 and 443**. On a cloud server, allow both in the console first and make sure no other program occupies them — step 2 shows how to check.
- Download `fast-https_Linux_x86_64.tar.gz` from [Gitee Releases](https://gitee.com/ncepu-bj/fast-https/releases) or [GitHub Releases](https://github.com/ncepu-iDealStudio/Fast-Https/releases); use the latest version shown on that page.

**About the "Expected output" blocks**: every output below comes from one complete run. On that machine port 80 was already used by another site, so `listen` was changed to `18080` / `18443` as described in step 2, and the verification URLs use those ports too. If your ports 80 / 443 are free, substitute the defaults — the shape of the output is identical.

## 1 Download and unpack

The block below creates directories, downloads, unpacks and makes the binary executable. `VER` is the latest tag from the releases page; `mkdir -p` creates directories, `tar -xzf` unpacks and `chmod 755` grants execute permission:

```bash
mkdir -p /soft /usr/local/fasthttps
cd /soft
VER=v1.6.0
wget "https://gitee.com/ncepu-bj/fast-https/releases/download/$VER/fast-https_Linux_x86_64.tar.gz"
ls -lh fast-https_Linux_x86_64.tar.gz
tar -xzf fast-https_Linux_x86_64.tar.gz -C /usr/local/fasthttps
chmod 755 /usr/local/fasthttps/fast-https
ls -la /usr/local/fasthttps
```

**Expected output** (download size + unpacked directory, `ls -la` abridged)

```text
-rw-r--r-- 1 root root 6.5M Nov 10 19:52 fast-https_Linux_x86_64.tar.gz
total 16764
drwxr-xr-x   6 root root 4096 Nov 10 19:52 .
drwxr-xr-x. 14 root root 4096 Nov 10 19:52 ..
drwxr-xr-x   4 root root 4096 Nov 10 19:52 config
drwxr-xr-x   2 root root 4096 Nov 10 19:52 docs
-rwxr-xr-x   1 root root 17117344 Nov  6 23:26 fast-https
drwxr-xr-x   3 root root 4096 Nov 10 19:52 httpdoc
drwxr-xr-x   2 root root 4096 Nov 10 19:52 logs
-rw-rw-rw-   1 root root 17632 Nov  6 23:19 README.md
```

Seeing `fast-https` with `-rwxr-xr-x` permissions, plus `config` and `httpdoc`, confirms both unpacking and permissions.

| Path | Description |
| --- | --- |
| `fast-https` | Main binary, a single executable |
| `config/fast-https.json` | Main configuration, JSON format |
| `config/conf.d/` | Site configuration directory, contains `default.json` |
| `config/mime.json` | File type mapping |
| `config/cert/` | Certificate directory, populated on first start |
| `httpdoc/root/` | Default site root, with the homepage `index.html` |
| `logs/` | Runtime logs |
| `docs/usage.html`, `README.md` | Notes shipped in the archive |

Print the resolved configuration, certificate, log and pid paths (the pid file records the process ID) with:

```bash
cd /usr/local/fasthttps && ./fast-https config path
```

**Expected output**

```text
config /usr/local/fasthttps/config/fast-https.json
cert   /usr/local/fasthttps/config/cert
log    /usr/local/fasthttps/logs
pid    /usr/local/fasthttps/fast-https.pid
```

## 2 Check configuration and ports

```bash
cat /usr/local/fasthttps/config/conf.d/default.json
ss -lntp | grep -E ':(80|443)\b'
```

**Expected output** (first command: the default site configuration)

```text
{
  "listen": [80, "443 ssl h2"],
  "server_name": "localhost",
  "ssl_certificate": "./cert/localhost.pem",
  "ssl_certificate_key": "./cert/localhost-key.pem",
  "location": [
    {
      "url": "/",
      "type": "local",
      "root": "./httpdoc/root",
      "index": ["index.html", "index.htm"]
    }
  ]
}
```

`listen` is the port (80 for HTTP, 443 for HTTPS and HTTP/2), `server_name` is the hostname the site responds to, and `root` is the directory holding the homepage. Paths starting with `./` are relative to the working directory.

**Expected output** (second command: when a port is occupied)

```text
LISTEN     0      511          *:80    *:*    users:(("nginx",pid=7677,fd=8),...)
LISTEN     0      511       [::]:80 [::]:*   users:(("nginx",pid=7677,fd=9),...)
```

No output from the second command means 80 / 443 are free; a listed process name means the port is taken. Do not stop someone else's service — change your own configuration:

```bash
sed -i 's|"listen": \[80, "443 ssl h2"\]|"listen": [18080, "18443 ssl h2"]|' /usr/local/fasthttps/config/conf.d/default.json
grep -n '"listen"' /usr/local/fasthttps/config/conf.d/default.json
```

**Expected output**

```text
2:  "listen": [18080, "18443 ssl h2"],
```

Use these ports in every verification URL below. If the ports were free, skip this part.

For a public deployment, set `server_name` to the domain or IP clients will use and allow the required ports in the firewall and cloud security group. `security.host_check` is off in the main configuration, so requests are not restricted by Host.

## 3 Start the server

```bash
cd /usr/local/fasthttps
./fast-https start
```

**Expected output**

```text
{"level":"info","kind":"console","time":"2026-11-10T19:52:58.772+08:00","message":"Include config dir: /usr/local/fasthttps/config/conf.d/default.json"}
{"level":"info","kind":"console","time":"2026-11-10T19:52:58.919+08:00","message":"fast-https started in background, pid 9422, logs in /usr/local/fasthttps/logs"}
```

`started in background` means the program daemonized on its own — no `&` or `nohup` is needed. The pid differs on every start. The first start generates a local CA and site certificate under `config/cert/`, writes `fast-https.pid`, and sends logs to `logs/` (`daemon.log`, `access.log`, `system.log`, `error.log`, `safe.log`).

The `./` prefix means "this program in the current directory" and must not be omitted. You must also `cd` into the unpack directory first: paths such as `./conf.d` and `./httpdoc/root` are resolved against it.

Common subcommands: `start`, `stop`, `status`, `reload` to reapply configuration, `config path`, `site` to manage site files, `acme` to configure certificate issuance, and `version`. Run `./fast-https --help` for the full list.

## 4 Verify the default site

```bash
cd /usr/local/fasthttps
./fast-https status
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:18080/
curl -sk -o /dev/null -w 'HTTPS %{http_code} TLS=%{ssl_verify_result}\n' https://localhost:18443/
```

**Expected output**

```text
fast-https is running, pid 9422
HTTP 200
HTTPS 200 TLS=0
```

`running` is followed by the process ID; `200` means the request succeeded. `-k` skips verification of the self-signed certificate and `TLS=0` indicates the TLS connection itself is healthy. With free ports, use `http://127.0.0.1/` and `https://localhost/`.

Confirm the listeners:

```bash
ss -lntp | grep -E ':(18080|18443)\b'
```

**Expected output**

```text
LISTEN   0   4096   [::]:18443   [::]:*   users:(("fast-https",pid=9422,fd=13))
LISTEN   0   4096   [::]:18080   [::]:*   users:(("fast-https",pid=9422,fd=12))
```

`logs/daemon.log` holds the same information (followed by a startup banner):

```text
{"level":"info","kind":"console","message":"Include config dir: /usr/local/fasthttps/config/conf.d/default.json"}
{"level":"info","kind":"console","message":"fast-https started in background, pid 9422, logs in /usr/local/fasthttps/logs"}
```

On a cloud server, open `http://<server public IP>:18080/` in a browser on your own computer to see the default homepage (omit the port when using the defaults); `localhost` refers to the server itself and will not work from your computer. A browser warning about an untrusted certificate is expected; use a certificate matching your domain for a public service.

## 5 Stop and reload

```bash
cd /usr/local/fasthttps
./fast-https reload
./fast-https stop
./fast-https status
```

**Expected output**

```text
{"level":"info","kind":"console","time":"2026-11-10T19:53:02.486+08:00","message":"fast-https stopped"}
Error: fast-https is not running, no pid file
```

`reload` prints nothing on success; `stop` prints `fast-https stopped`, removes the pid file and releases the ports. The final `Error: ... no pid file` is written to standard error and is **expected** — it confirms the service is stopped.

## 6 Register a systemd unit (optional)

The archive contains no service file, so it does not start at boot by default. To start automatically on boot and restart after a crash, register a **systemd unit**. systemd is the component that manages background services on Linux; a unit is a text file describing how to start a program, and `systemctl` is the command used to control it.

Run this block to create the unit file (copy it as a whole; you can also write the same content with an editor into `/etc/systemd/system/fast-https.service`):

```bash
cat > /etc/systemd/system/fast-https.service <<'EOF'
[Unit]
Description=Fast-Https (archive deployment)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
WorkingDirectory=/usr/local/fasthttps
Environment=FASTHTTPS_FOREGROUND=1
ExecStart=/usr/local/fasthttps/fast-https start
ExecReload=/usr/local/fasthttps/fast-https reload
Restart=on-failure
RestartSec=2s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF
```

This command prints **nothing**. Verify with `cat /etc/systemd/system/fast-https.service`; the content should match the block exactly.

Three details must be correct:

- `WorkingDirectory` has to be the unpack directory, because relative paths such as `./conf.d`, `./httpdoc/root` and `./cert` are resolved against it.
- `ExecStart` / `ExecReload` must point at the actual `fast-https` path in that directory.
- `FASTHTTPS_FOREGROUND=1` is required. On Linux, `start` daemonizes by default, while systemd's `Type=simple` needs the program to stay in the foreground. Without this line the main process exits immediately with `status=0`, the service shows `inactive` and no port is opened.

Register and start it:

```bash
systemctl daemon-reload
systemctl enable --now fast-https.service
systemctl is-active fast-https.service
```

**Expected output**

```text
Created symlink from /etc/systemd/system/multi-user.target.wants/fast-https.service to /etc/systemd/system/fast-https.service.
active
```

`daemon-reload` prints nothing; `Created symlink` means start-at-boot is enabled and `active` means the service is running. Check the status:

```bash
systemctl status fast-https.service --no-pager
```

**Expected output** (abridged)

```text
● fast-https.service - Fast-Https (archive deployment)
   Loaded: loaded (/etc/systemd/system/fast-https.service; enabled; vendor preset: disabled)
   Active: active (running)
 Main PID: 9595 (fast-https)
   CGroup: /system.slice/fast-https.service
           └─9595 /usr/local/fasthttps/fast-https start
```

A request should still succeed:

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:18080/
```

**Expected output**

```text
HTTP 200
```

Afterwards use `systemctl reload fast-https.service` to reapply configuration, `systemctl disable --now fast-https.service` to stop it and disable startup at boot, and `journalctl -u fast-https.service -n 30 --no-pager` to read logs. `disable --now` prints:

```text
Removed symlink /etc/systemd/system/multi-user.target.wants/fast-https.service.
```

`systemctl is-active fast-https.service` then returns `unknown` (or `inactive`), meaning the service is stopped.

If Fast-Https was already installed from the [.rpm package](../rpm/) or the [.deb package](../ubuntu/), a `fast-https.service` of the same name already exists — remove that package first or choose a different unit name.

## 7 Troubleshooting

| Symptom | What to do |
| --- | --- |
| Download returns 404 | `VER` is wrong; check the latest tag on the releases page |
| `./fast-https` reports a permission error | Re-run `chmod 755 ./fast-https` from step 1 |
| `status` says the service is not running | Confirm you `cd`'d into the unpack directory, then read `logs/daemon.log` |
| The port check lists nginx or another process | Follow step 2 and change `listen`; do not stop someone else's service |
| curl returns 000 or connection refused | The service is not running, or the verification URL still uses the old port |
| `is-active` does not print `active` | Check `FASTHTTPS_FOREGROUND=1` and the paths in the unit, then run `systemctl status fast-https.service --no-pager` |
| The page will not open on your computer | Check that the port is allowed in the cloud security group, and use the server's public IP |

## Next steps

The default site only confirms the deployment. To publish your own site or configure a reverse proxy, see the Tutorials section in the sidebar.
