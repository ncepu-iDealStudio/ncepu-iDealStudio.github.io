---
title: Run as a service
weight: 2
summary: Install as a system service with start on boot
---

# Run as a service

Fast-Https can also be installed as a system service, supervised by the OS instead of manually running `nohup`:

```bash
# install the service
$ sudo ./fast-https install

# enable start on boot
$ systemctl enable fast-https.service

# start the service
$ sudo systemctl start fast-https.service

# remove the service
$ sudo ./fast-https uninstall
```
