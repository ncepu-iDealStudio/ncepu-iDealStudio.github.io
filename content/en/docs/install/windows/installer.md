---
title: Installer
weight: 2
translationKey: windows-installer
summary: Run the Windows installer and follow the wizard
---

# Installer

Download the Windows installer (`.exe`) from the release page, run it and follow the wizard. Compared with the zip package, the installer writes the program into a chosen folder, creates shortcuts, is removed through Windows "Apps & features", and ships the graphical desktop client.

## 1 Download the installer

Open the [release page](https://gitee.com/ncepu-bj/fast-https/releases) and find the installer in the asset list of the **topmost** release. Filenames look like this:

```text
fast-https-<version>-windows-amd64-setup.exe      # x64
fast-https-<version>-windows-arm64-setup.exe      # ARM64
```

`<version>` comes from whichever release you download; no version is hardcoded here, so the example cannot go stale after a new release. Match on `fast-https-<version>-windows-<arch>-setup.exe`. The same page also offers `fast-https_Windows_x86_64.zip` if you prefer the portable build.

![Downloading the installer](/assets/images/docs/install/windows/exe-01.png)

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>A browser warning such as "this file isn't commonly downloaded" is <b>expected</b>: the build is not code-signed. Choose «…» → <i>Keep</i> in the download panel, and <i>Keep anyway</i> if prompted again. This is a heuristic browser warning, not a problem with the package.</div>
</div>

## 2 Run the wizard

Double-click the downloaded `setup.exe`. Accept the UAC prompt if Windows shows one.

![Setup welcome page](/assets/images/docs/install/windows/exe-02.png)

## 3 Choose the install folder

Click «Browse» to change the install path; avoid spaces and non-ASCII characters.

![Choosing the install folder](/assets/images/docs/install/windows/exe-03.png)

## 4 Finish the installation

Wait for the files to be written, then click «Next» to close the wizard.

![Installation complete](/assets/images/docs/install/windows/exe-04.png)

The installer creates a `Fast-Https 桌面管理端` desktop shortcut, a Start-menu entry, and `uninstall.exe`.

## 5 Start and verify

### 5.1 Launch the desktop client

After installation, launch **Fast-Https 桌面管理端** from the Start menu or the desktop shortcut. The service state is «Stopped» by default and the status bar shows `pid —`.

![Desktop client on launch: service stopped](/assets/images/docs/install/windows/exe-05.png)

### 5.2 Start the service

Click «启动服务» (Start service) in the top-right corner. When the state turns green «运行中» (Running) and the hint «回环端口可连接» (loopback port reachable) appears, the service is up. The button now reads «停止服务» (Stop service), and the status bar shows the process `pid`.

![Service running](/assets/images/docs/install/windows/exe-06.png)

### 5.3 Browse the site list

Click «站点» (Sites) in the left menu to list the configured sites. A `localhost` site listening on both 80 and 443 is included by default; the two share one config file, `conf.d/default.json`.

![Site list](/assets/images/docs/install/windows/exe-07.png)

### 5.4 Add a site

Click «添加站点» (Add site) in the top-right corner to configure a new domain/IP, listening port, document root and SSL certificate. Saving writes a matching JSON file under `conf.d/`.

![Add-site dialog](/assets/images/docs/install/windows/exe-08.png)

### 5.5 Verify in a browser

Open `https://localhost/`. The `Welcome to Fast-Https !` page means the installation and startup both succeeded.

![Browser verification](/assets/images/docs/install/windows/exe-09.png)

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>443 uses the self-signed certificate generated on first start, so the browser reports "Not secure" — choose <i>Advanced → Proceed to localhost</i>. `http://localhost/` shows no such warning.</div>
</div>

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>The default ports are <b>80 and 443</b>. Use <code>http://localhost/</code> or <code>https://localhost/</code> — <b>do not append <code>:8080</code></b>. The <code>https://localhost:8080/index.html</code> in older docs is the wrong port and results in "This site can't be reached". If ports 80/443 are already taken, use high ports when adding a site in step 5.4.</div>
</div>
