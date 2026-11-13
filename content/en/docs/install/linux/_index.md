---
title: Linux
weight: 3
icon: linux
translationKey: install-linux
summary: Choose an installation method for your Linux distribution
---

# Linux

Once Fast-Https is installed on a Linux server, it ships a default site: open port 80 of the server in a browser and you will see a welcome page. Pick **one** of the three methods below and do not mix them.

## Check two things first

Run every command on this page **in the server's terminal**, not on your own computer. Log in to the server and run:

```bash
# Show the distribution name
cat /etc/os-release
# Show the processor architecture
uname -m
```

- The first command reports the distribution: `Ubuntu` or `Debian` means the `.deb` method; `CentOS`, `Rocky`, `AlmaLinux` or `openEuler` means the `.rpm` method.
- The second reports the processor architecture: `x86_64` maps to `amd64` in download filenames, `aarch64` maps to `arm64`. Most cloud servers are `x86_64`.

If you are still unsure, or your distribution is not listed, choose archive deployment: it is just a compressed file and does not depend on a package manager.

## Which one should I pick

| Your system | Choose | Notes |
| --- | --- | --- |
| Ubuntu / Debian | Install on Ubuntu | `apt` installs a `.deb` package and registers a system service |
| CentOS / RHEL family | CentOS 7 installation and deployment | `yum` installs an `.rpm` package and registers a system service |
| Other distributions / no package manager | Archive deployment | Unpack a `.tar.gz` and run it; register the service yourself |

`.deb` and `.rpm` are Linux package formats: they are recorded by the system package manager and can be upgraded or removed centrally. A `.tar.gz` is a compressed archive that unpacks directly into program files, without a package manager.

## Before you start

- You need an account that can log in to the server and run administrative commands: either `root`, or an account that prefixes commands with `sudo`.
- The default site uses **port 80 (HTTP) and 443 (HTTPS)**. On a cloud server, allow both ports in the provider's security group / firewall first, or the site will be unreachable from outside.
- Neither port may be occupied by another program (for example an existing Nginx). Each guide below includes a command to check.

## Installation options

{{< doc-children >}}

## After installation

Each of the three guides includes verification commands and the day-to-day commands for starting and stopping the service. To publish your own site, configure a reverse proxy or set up HTTPS, see the Tutorials section in the sidebar.
