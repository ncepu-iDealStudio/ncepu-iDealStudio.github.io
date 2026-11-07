---
title: CentOS 7 installation and deployment
weight: 2
translationKey: install-linux-rpm
summary: Install with yum on RPM-based distributions and run under systemd
lastmod: 2026-11-07
---

# CentOS 7 installation and deployment

This guide deploys Fast-Https on CentOS and other `yum`-based distributions from an `.rpm` package. Installation registers a system service with start-on-boot and automatic restart. For other methods, see [Install on Ubuntu](../ubuntu/) and [Archive deployment](../unpack-and-deploy/).

## Before you start

- Run every command **in the server's terminal** with administrative rights. Log in as `root`, or prefix each command with `sudo`.
- The default site uses **ports 80 and 443**. On a cloud server, allow both in the console first and make sure no other program occupies them.
- Download the package from [Gitee Releases](https://gitee.com/ncepu-bj/fast-https/releases) or [GitHub Releases](https://github.com/ncepu-iDealStudio/Fast-Https/releases); use the latest version shown on that page.

## 1 Check the architecture and download the package

`.rpm` is the package format used by CentOS and the RHEL family. Different processors need different packages, so check yours first:

```bash
uname -m
```

- `x86_64` → download the package whose filename contains `amd64` (most cloud servers)
- `aarch64` → download the package whose filename contains `arm64`

The download command has two version numbers, both taken from the latest release: `VER` is the tag on the releases page (with a `v`), and `PKG` is the version inside the filename (without the `v`). For example, tag `v1.6.0` corresponds to `1.6.0` in the filename:

```bash
VER=v1.6.0
PKG=1.6.0
wget -O fast-https.rpm "https://gitee.com/ncepu-bj/fast-https/releases/download/$VER/fast-https_${PKG}_linux_amd64.rpm"
ls -lh fast-https.rpm
```

Seeing the file and its size after `ls -lh` means the download worked. On an `aarch64` machine, replace `amd64` at the end with `arm64`.

## 2 Install

```bash
yum install -y ./fast-https.rpm
rpm -qi fast-https
```

`-y` answers installation prompts automatically and `./` means "this file in the current directory". `yum` resolves the `ca-certificates` and `logrotate` dependencies, then prints the configuration, site and log directories and the suggested start command. `rpm -qi` prints the package name, version and architecture, confirming the installation.

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

The pid file records the process ID; the systemd unit is the service's configuration text. Run `fast-https config path` at any time to print the resolved locations.

## 3 Start and enable at boot

The package registers a **systemd service** named `fast-https.service`. systemd is the component that manages background services on Linux; `systemctl` is the command used to control it.

```bash
systemctl enable --now fast-https.service
systemctl is-active fast-https.service
systemctl status fast-https.service --no-pager
```

`enable --now` starts the service immediately and also enables it at boot. `is-active` should print `active`; `status` shows more detail and recent log lines.

The unit already sets `Restart=on-failure` (restart after a crash), `RestartSec=2s` and `ExecReload=/usr/bin/fast-https reload`, so none of that needs manual configuration.

## 4 Verify the default site

```bash
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1/
curl -sk -o /dev/null -w 'HTTPS %{http_code} TLS=%{ssl_verify_result}\n' https://localhost/
```

Both should return `200`, the status code for a successful request. `-k` skips certificate verification because the certificate generated on first start is self-signed; `TLS=0` indicates the TLS connection itself is healthy.

The default site listens on 80 (HTTP) and 443 (HTTPS, HTTP/2). On a cloud server, open `http://<server public IP>/` in a browser on your own computer — `localhost` refers to the server itself and will not work from your computer. A browser warning about an untrusted certificate is expected for a self-signed certificate; use a certificate matching your domain for a public service.

Read service logs with `journalctl -u fast-https.service -n 30 --no-pager`; structured logs are written under `/var/log/fast-https/`.

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

## 6 Troubleshooting

| Symptom | What to do |
| --- | --- |
| Download returns 404 | `VER` or `PKG` is wrong; check the latest tag and filename on the releases page |
| `yum` cannot find the file | Confirm you are in the directory with `fast-https.rpm`, and that `./` is present |
| `is-active` does not print `active` | Run `systemctl status fast-https.service --no-pager` and check the logs; occupied ports 80/443 are a common cause |
| curl returns 000 or connection refused | The service is not running or a port is occupied — go back to step 3 |
| The page will not open on your computer | Check that port 80 is allowed in the cloud security group, and use the server's public IP |

## Next steps

For a public deployment, set `server_name` to the hostname or IP clients will use. To publish your own site or configure a reverse proxy, see the Tutorials section in the sidebar.
