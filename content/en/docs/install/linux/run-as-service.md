---
title: Run as a service
weight: 10
translationKey: install-linux-service
summary: Manage Fast-Https startup, service status and logs with systemd
---

# Run as a service

The Fast-Https v1.6.0 server `.deb` package installs `fast-https.service`. For download and installation instructions, see [Install on Ubuntu](../ubuntu/).

## Start now or on boot

Start the service immediately.

```bash
sudo systemctl start fast-https.service
```

Start the service now and enable it at boot.

```bash
sudo systemctl enable --now fast-https.service
```

## Restart or stop

Restart the service after changing its configuration.

```bash
sudo systemctl restart fast-https.service
```

To stop the service and disable startup at boot, run the following command.

```bash
sudo systemctl disable --now fast-https.service
```

## Check status and logs

```bash
systemctl status fast-https.service --no-pager
sudo journalctl -u fast-https.service -n 30 --no-pager
```
