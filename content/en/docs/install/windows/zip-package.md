---
title: Zip package
weight: 1
translationKey: windows-zip
summary: Download the zip and unzip — no installer involved
---

# Zip package

Download `fast-https_Windows_x86_64.zip` from the [release page](https://gitee.com/ncepu-bj/fast-https/releases), unzip it into any folder and run it. There is no installer; deleting the folder removes the program.

![Release page](/assets/images/docs/install/windows/1.1.png)

## 1 Unzip the package

![Unzip the package](/assets/images/docs/install/windows/1.2.png)

## 2 Edit the default configuration

Open `fast-https.conf` in the `config` folder:

![Edit the configuration](/assets/images/docs/install/windows/1.3.png)

The default configuration looks like this:

```json
{
  "http": {
    "server": [
      {
        "listen": 80,
        "server_name": "localhost",

        "location": [
          {
            "url": "/",
            "type": "local",
            "root": "./httpdoc/root",
            "index": ["index.html", "index.htm"]
          }
        ]
      },
      {
        "listen": "443 ssl h2",
        "server_name": "localhost",
        "ssl_certificate": "./config/cert/localhost.pem",
        "ssl_certificate_key": "./config/cert/localhost-key.pem",
        "location": [
          { "url": "/", "type": "local", "root": "./httpdoc/root", "index": ["index.html", "index.htm"] }
        ]
      }
    ],
    "include": ["./config/conf.d"]
  }
}
```

## 3 Start the server

Run `monitor.exe` to start the manager:

![Start monitor](/assets/images/docs/install/windows/1.4.png)

Then click the tray icon in the notification area:

![Tray icon](/assets/images/docs/install/windows/1.5.png)

## 4 Verify the installation

Open `https://localhost:8080/index.html` in a browser — the default welcome page confirms the server is up:

![Default page](/assets/images/docs/install/windows/1.6.png)

That is the whole zip package installation on Windows.
