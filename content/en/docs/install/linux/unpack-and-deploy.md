---
title: Unpack and deploy
weight: 1
summary: Download, unpack and start on CentOS 7.9
---

# Unpack and deploy

Fast-Https runs on mainstream Linux distributions. The steps below use CentOS 7.9 as an example.

```bash
# create a working folder
$ mkdir /soft
$ cd /soft

# download the matching build
$ wget https://gitee.com/ncepu-bj/fast-https/releases/download/v1.0/fast-https_Linux_x86_64.tar.gz

# unpack into the install directory
$ tar -xzvf fast-https_Linux_x86_64.tar.gz -C /usr/local/fasthttps
$ cd /usr/local/fasthttps/
$ chmod 755 ./fast-https
```

Check the configuration file:

```bash
$ cat ./config/fast-https.json
```

![Configuration file](/assets/images/docs/install/linux/1.1.png)

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>If you open the server from a remote browser, set <code>server_name</code> to the server IP, for example <code>"server_name": "192.168.11.166"</code>. To avoid a port conflict the example uses 1443 instead of 443 (443 is fine too).</div>
</div>

Start the server:

```bash
$ ./fast-https
```

![Start the service](/assets/images/docs/install/linux/1.2.png)

In production, run it in the background:

```bash
$ nohup ./fast-https &
```

Test the default site:

```bash
$ curl http://localhost:8080
```

![Test result](/assets/images/docs/install/linux/1.3.png)

Open `http://ip:8080/index.html` in a browser and the default page confirms the installation on CentOS is complete.
