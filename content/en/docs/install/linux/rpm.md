---
title: CentOS 7 installation and deployment
weight: 2
translationKey: install-linux-rpm
summary: Install with yum on RPM-based distributions and run under systemd
lastmod: 2026-11-10
---

# CentOS 7 installation and deployment

This guide deploys Fast-Https on CentOS and other `yum`-based distributions from an `.rpm` package. Installation registers a system service with start-on-boot and automatic restart. For other methods, see [Install on Ubuntu](../ubuntu/) and [Archive deployment](../unpack-and-deploy/).

## Before you start

- Run every command **in the server's terminal** with administrative rights. Log in as `root`, or prefix each command with `sudo`.
- The default site uses **ports 80 and 443**. On a cloud server, allow both in the console first and make sure no other program occupies them.
- Download the package from [Gitee Releases](https://gitee.com/ncepu-bj/fast-https/releases) or [GitHub Releases](https://github.com/ncepu-iDealStudio/Fast-Https/releases); use the latest version shown on that page.

**About the "Expected output" blocks**: every output below comes from one complete run. On that machine port 80 was already used by another site, so `listen` was changed to `18080` / `18443` as described in step 3, and the verification URLs use those ports too. If your ports 80 / 443 are free, substitute the defaults — the shape of the output is identical.

## 1 Check the architecture and download the package

`.rpm` is the package format used by CentOS and the RHEL family. Different processors need different packages, so check yours first:

```bash
uname -m
```

**Expected output**

```text
x86_64
```

`x86_64` maps to the `amd64` package; `aarch64` maps to `arm64`.

The download command has two version numbers, both taken from the latest release: `VER` is the tag on the releases page (with a `v`), and `PKG` is the version inside the filename (without the `v`). For example, tag `v1.6.0` corresponds to `1.6.0` in the filename:

```bash
VER=v1.6.0
PKG=1.6.0
wget -O fast-https.rpm "https://gitee.com/ncepu-bj/fast-https/releases/download/$VER/fast-https_${PKG}_linux_amd64.rpm"
ls -lh fast-https.rpm
```

**Expected output** (`wget` is quiet; only `ls` prints a line)

```text
-rw-r--r-- 1 root root 6.5M Nov 10 19:52 fast-https.rpm
```

Seeing the filename and size means the download worked. On an `aarch64` machine, replace `amd64` at the end with `arm64`.

## 2 Install

```bash
yum install -y ./fast-https.rpm
rpm -qi fast-https
```

`-y` answers installation prompts automatically and `./` means "this file in the current directory". `yum` resolves the `ca-certificates` and `logrotate` dependencies.

**Expected output** (tail of `yum`)

```text
Running transaction
fast-https: config /etc/fast-https, site /usr/share/fast-https/httpdoc, log /var/log/fast-https
fast-https: start with systemctl enable --now fast-https
fast-https: these directories are owned by root, run start/check with sudo
  Verifying  : fast-https-1.6.0-1.x86_64                                    1/1

Installed:
  fast-https.x86_64 0:1.6.0-1

Complete!
```

`Complete!` marks the end of the installation; the three `fast-https:` lines are paths and a start hint printed by the install script. The beginning of `rpm -qi` looks like this:

```text
Name        : fast-https
Version     : 1.6.0
Release     : 1
Architecture: x86_64
Group       : Applications/Internet
Size        : 17292444
License     : GPL-2.0
```

Installed file locations (you will need these when editing configuration or reading logs):

| Purpose | Path |
| --- | --- |
| Binary | `/usr/bin/fast-https` |
| Main configuration | `/etc/fast-https/fast-https.json` |
| Site configuration | `/etc/fast-https/conf.d/default.json` |
| Default site root | `/usr/share/fast-https/httpdoc/root/` |
| Certificates | `/etc/fast-https/cert/` |
| Logs | `/var/log/fast-https/` |
| pid file | `/run/fast-https/fast-https.pid` |
| systemd unit | `/usr/lib/systemd/system/fast-https.service` |

The pid file records the process ID; the systemd unit is the service's configuration text. Print the resolved locations at any time with:

```bash
fast-https config path
```

**Expected output**

```text
config /etc/fast-https/fast-https.json
cert   /etc/fast-https/cert
log    /var/log/fast-https
pid    /run/fast-https/fast-https.pid
```

## 3 Start and enable at boot

First check whether ports 80 / 443 are in use:

```bash
ss -lntp | grep -E ':(80|443)\b'
```

**Expected output (when a port is occupied)**

```text
LISTEN     0      511          *:80    *:*    users:(("nginx",pid=7677,fd=8),...)
LISTEN     0      511       [::]:80 [::]:*   users:(("nginx",pid=7677,fd=9),...)
```

No output means the ports are free; a process name such as `nginx` means the port is taken. Do not stop someone else's service — change your own configuration instead: edit `/etc/fast-https/conf.d/default.json` and change `listen` from `[80, "443 ssl h2"]` to free ports, for example:

```bash
sed -i 's|"listen": \[80, "443 ssl h2"\]|"listen": [18080, "18443 ssl h2"]|' /etc/fast-https/conf.d/default.json
grep -n '"listen"' /etc/fast-https/conf.d/default.json
```

**Expected output**

```text
2:  "listen": [18080, "18443 ssl h2"],
```

Use these ports in every verification URL below. If the ports were free, skip this part and keep 80 / 443.

The package registers a **systemd service** named `fast-https.service`. systemd is the component that manages background services on Linux; `systemctl` is the command used to control it.

```bash
systemctl enable --now fast-https.service
systemctl is-active fast-https.service
systemctl status fast-https.service --no-pager
```

**Expected output**

```text
Created symlink from /etc/systemd/system/multi-user.target.wants/fast-https.service to /usr/lib/systemd/system/fast-https.service.
active
● fast-https.service - Fast-Https web server and reverse proxy
   Loaded: loaded (/usr/lib/systemd/system/fast-https.service; enabled; vendor preset: disabled)
   Active: active (running)
 Main PID: 8395 (fast-https)
   CGroup: /system.slice/fast-https.service
           └─8395 /usr/bin/fast-https start
```

`Created symlink` means start-at-boot is enabled; `active` means the service is running; `Main PID` is the process ID and differs on every start.

The unit already sets `Restart=on-failure` (restart after a crash), `RestartSec=2s` and `ExecReload=/usr/bin/fast-https reload`, so none of that needs manual configuration.

## 4 Verify the default site

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:18080/
curl -sk -o /dev/null -w 'HTTPS %{http_code} TLS=%{ssl_verify_result}\n' https://localhost:18443/
```

**Expected output**

```text
HTTP 200
HTTPS 200 TLS=0
```

`200` is the status code for a successful request; `-k` skips verification of the self-signed certificate and `TLS=0` indicates the TLS connection itself is healthy. With free ports, use `http://127.0.0.1/` and `https://localhost/` instead.

Confirm the listeners:

```bash
ss -lntp | grep -E ':(18080|18443)\b'
```

**Expected output**

```text
LISTEN   0   4096   [::]:18443   [::]:*   users:(("fast-https",pid=8395,fd=12))
LISTEN   0   4096   [::]:18080   [::]:*   users:(("fast-https",pid=8395,fd=11))
```

Service logs are available with `journalctl -u fast-https.service -n 30 --no-pager`, and include an access record like:

```text
{"level":"info","kind":"access","remote_addr":"127.0.0.1:51554","type":"LOCAL","method":"GET","path":"/","host":"127.0.0.1:18080","status":200,"size":2106,"user_agent":"curl/7.29.0"}
```

`"status":200` matches the curl result, confirming the request reached Fast-Https. Structured logs are also written under `/var/log/fast-https/`.

On a cloud server, open `http://<server public IP>:18080/` in a browser on your own computer (omit the port when using the defaults); `localhost` refers to the server itself and will not work from your computer. A browser warning about an untrusted certificate is expected for a self-signed certificate; use a certificate matching your domain for a public service.

## 5 Manage the service

The package registers `fast-https.service`, so use `systemctl` for day-to-day management:

```bash
systemctl start fast-https.service                  # start
systemctl enable --now fast-https.service          # start and enable at boot
systemctl is-active fast-https.service             # check whether it is running
systemctl status fast-https.service --no-pager     # inspect status
systemctl restart fast-https.service              # restart after a config change
fast-https reload                                 # or just reapply configuration
journalctl -u fast-https.service -n 30 --no-pager # read recent logs
systemctl disable --now fast-https.service        # stop and disable startup at boot
```

`fast-https reload` and `systemctl restart` print **nothing** on success; verify with `systemctl is-active fast-https.service`, which prints `active`. `disable --now` prints:

```text
Removed symlink /etc/systemd/system/multi-user.target.wants/fast-https.service.
```

After that, `is-active` returns `unknown` (or `inactive`) — both mean the service is stopped.

To remove the package:

```bash
yum remove -y fast-https
```

**Expected output** (tail)

```text
  Erasing    : fast-https-1.6.0-1.x86_64                                    1/1
warning: /etc/fast-https/conf.d/default.json saved as /etc/fast-https/conf.d/default.json.rpmsave
fast-https: purged config, certs and logs under /etc/fast-https and /var/log/fast-https

Removed:
  fast-https.x86_64 0:1.6.0-1

Complete!
```

A modified configuration file is kept as `.rpmsave` rather than silently discarded.

## 6 Troubleshooting

| Symptom | What to do |
| --- | --- |
| Download returns 404 | `VER` or `PKG` is wrong; check the latest tag and filename on the releases page |
| `yum` cannot find the file | Confirm you are in the directory with `fast-https.rpm`, and that `./` is present |
| The port check lists nginx or another process | Follow step 3 and change `listen`; do not stop someone else's service |
| `is-active` does not print `active` | Run `systemctl status fast-https.service --no-pager` and check the logs |
| curl returns 000 or connection refused | The service is not running, or the verification URL still uses the old port |
| The page will not open on your computer | Check that the port is allowed in the cloud security group, and use the server's public IP |

## Next steps

For a public deployment, set `server_name` to the hostname or IP clients will use. To publish your own site or configure a reverse proxy, see the Tutorials section in the sidebar.
