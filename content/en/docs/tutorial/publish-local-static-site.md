---
title: Publish a local static site
weight: 2
summary: Serve a built static site over Windows or Linux
---

# Publish a local static site

This walkthrough publishes a static site you already built, covering both Windows and Linux.

## 1 Get the software

Download the package for your platform from the release page:

- Windows: `fast-https_Windows_x86_64.zip`
- Linux: `fast-https_Linux_x86_64.tar.gz`

![Release page](/assets/images/docs/tutorial/2.1.png)

![Pick your platform](/assets/images/docs/tutorial/2.2.png)

## 2 Windows setup

### Unzip the package

Unzip the downloaded archive first:

![Unzip the package](/assets/images/docs/tutorial/2.3.png)

### Put the static files in place

Copy your built site into the publishing folder (default `./httpdoc/root`) and make sure it contains `index.html`:

![Upload the static files](/assets/images/docs/tutorial/2.4.png)

### Edit the configuration

Open `fast-https.conf` in the `config` folder and point `root` at your static folder:

![Edit the configuration](/assets/images/docs/tutorial/2.5.png)

```json
{
  "listen": 8080,
  "server_name": "localhost",
  "location": [
    { "url": "/", "type": "local", "root": "./httpdoc/root", "index": ["index.html", "index.htm"] }
  ]
}
```

### Start the manager

Run `monitor.exe` and start the service from the tray icon:

![Start the manager](/assets/images/docs/tutorial/2.6.png)

![Tray icon](/assets/images/docs/tutorial/2.7.png)

Open `http://localhost:8080/index.html` and the site shows up:

![Running site](/assets/images/docs/tutorial/2.8.png)

## 3 Linux setup

### 3.1 Upload the static files

Copy the static files into the publishing folder (default `./httpdoc/root`):

![Upload the static files](/assets/images/docs/tutorial/2.4.png)

### 3.2 Edit the configuration

Edit `config/fast-https.json`, set `server_name` to the server IP and confirm `root` points at the static folder.

```bash
$ cat ./config/fast-https.json
```

### 3.3 Start and test

```bash
$ ./fast-https
# or run it in the background
$ nohup ./fast-https &
```

![Start the service](/assets/images/docs/tutorial/2.9.png)

![Test result](/assets/images/docs/tutorial/2.10.png)
