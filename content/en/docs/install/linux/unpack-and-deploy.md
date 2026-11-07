---
title: Archive deployment
weight: 20
translationKey: install-linux-centos-archive
summary: Start and verify the default site from the .tar.gz archive
lastmod: 2026-11-07
---

# Archive deployment

This guide runs Fast-Https straight from a `.tar.gz` archive, without installing a package. `.tar.gz` is a common Linux compressed format: unpacking it gives you the program and its configuration directly, with no package manager involved, so it works on any distribution. For other methods, see [CentOS 7 installation and deployment](../rpm/) and [Install on Ubuntu](../ubuntu/).

## Before you start

- Run every command **in the server's terminal** with administrative rights. Log in as `root`, or prefix commands with `sudo`.
- The default site uses **ports 80 and 443**. On a cloud server, allow both in the console first and make sure no other program occupies them — step 2 shows how to check.
- Download `fast-https_Linux_x86_64.tar.gz` from [Gitee Releases](https://gitee.com/ncepu-bj/fast-https/releases) or [GitHub Releases](https://github.com/ncepu-iDealStudio/Fast-Https/releases); use the latest version shown on that page.

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

The final `ls` should show `fast-https`, `config`, `httpdoc` and the rest — that confirms the unpacking worked.

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

Run `./fast-https config path` to print the resolved configuration, certificate, log and pid paths. The pid file records the process ID.

## 2 Check configuration and ports

```bash
cat /usr/local/fasthttps/config/conf.d/default.json
ss -lntp | grep -E ':(80|443)\b'
```

The first command prints the default site configuration: `listen` is the port (80 for HTTP, 443 for HTTPS and HTTP/2), `server_name` is the hostname the site responds to (`localhost` by default), and `root` is the directory holding the homepage.

The second checks the ports. No output means 80 / 443 are free; any output means another program occupies them, so change `listen` in the configuration or stop that program first.

For a public deployment, set `server_name` to the domain or IP clients will use and allow the required ports in the firewall and cloud security group. `security.host_check` is off in the main configuration, so requests are not restricted by Host.

## 3 Start the server

```bash
cd /usr/local/fasthttps
./fast-https start
```

The `./` prefix means "this program in the current directory" and must not be omitted. You must also `cd` into the unpack directory first: paths such as `./conf.d` and `./httpdoc/root` in the configuration are relative to the current working directory.

`start` daemonizes on its own, so no `&` or `nohup` is needed. The first start generates a local CA and site certificate under `config/cert/`, writes `fast-https.pid`, and sends logs to `logs/` (`daemon.log`, `access.log`, `system.log`, `error.log`, `safe.log`).

Common subcommands: `start`, `stop`, `status`, `reload` to reapply configuration, `config path`, `site` to manage site files, `acme` to configure certificate issuance, and `version`. Run `./fast-https --help` for the full list.

## 4 Verify the default site

```bash
./fast-https status
curl -sS -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1/
curl -sk -o /dev/null -w 'HTTPS %{http_code} TLS=%{ssl_verify_result}\n' https://localhost/
```

`status` should report the service running with its process ID; both curl commands should return `200` (success). `-k` skips verification of the self-signed certificate and `TLS=0` indicates the TLS connection itself is healthy.

On a cloud server, open `http://<server public IP>/` in a browser on your own computer to see the default homepage; `localhost` refers to the server itself and will not work from your computer. A browser warning about an untrusted certificate is expected; use a certificate matching your domain for a public service.

## 5 Stop and reload

```bash
cd /usr/local/fasthttps
./fast-https reload
./fast-https stop
```

`reload` reapplies configuration after an edit; `stop` terminates the process, removes the pid file and releases ports 80 / 443. After that, `status` reports that the service is not running.

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

Three details must be correct:

- `WorkingDirectory` has to be the unpack directory, because relative paths such as `./conf.d`, `./httpdoc/root` and `./cert` are resolved against it.
- `ExecStart` / `ExecReload` must point at the actual `fast-https` path in that directory.
- `FASTHTTPS_FOREGROUND=1` is required. On Linux, `start` daemonizes by default, while systemd's `Type=simple` needs the program to stay in the foreground. Without this line the main process exits immediately, the service shows `inactive` and no port is opened.

Register and start it:

```bash
systemctl daemon-reload
systemctl enable --now fast-https.service
systemctl is-active fast-https.service
```

`daemon-reload` makes systemd re-read the new unit, `enable --now` starts it and enables it at boot, and `is-active` printing `active` confirms success.

Afterwards use `systemctl status fast-https.service --no-pager` to inspect it, `systemctl reload fast-https.service` to reapply configuration, `systemctl disable --now fast-https.service` to stop it and disable startup at boot, and `journalctl -u fast-https.service -n 30 --no-pager` to read logs.

If Fast-Https was already installed from the [.rpm package](../rpm/) or the [.deb package](../ubuntu/), a `fast-https.service` of the same name already exists — remove that package first or choose a different unit name.

## 7 Troubleshooting

| Symptom | What to do |
| --- | --- |
| Download returns 404 | `VER` is wrong; check the latest tag on the releases page |
| `./fast-https` reports a permission error | Re-run `chmod 755 ./fast-https` from step 1 |
| `status` says the service is not running | Confirm you `cd`'d into the unpack directory, then read `logs/daemon.log` |
| curl returns 000 or connection refused | The service is not running or 80/443 are occupied — go back to steps 2 and 3 |
| `is-active` does not print `active` | Check `FASTHTTPS_FOREGROUND=1` and the paths in the unit, then run `systemctl status fast-https.service --no-pager` |
| The page will not open on your computer | Check that port 80 is allowed in the cloud security group, and use the server's public IP |

## Next steps

The default site only confirms the deployment. To publish your own site or configure a reverse proxy, see the Tutorials section in the sidebar.
