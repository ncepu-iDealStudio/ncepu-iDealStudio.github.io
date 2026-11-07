---
title: Ubuntu 安装与部署
weight: 1
translationKey: install-linux-ubuntu
summary: 安装服务端 .deb 包，启动 systemd 服务并验证默认站点
lastmod: 2026-11-07
---

# Ubuntu 安装与部署

本页介绍在 Ubuntu 上用 `.deb` 安装包部署 Fast-Https。`.deb` 是 Ubuntu / Debian 的软件包格式，用 `apt` 安装后会自动注册一个系统服务，可以实现开机自启。

## 开始前

- 所有命令都在**服务器的终端**里执行。
- 需要一个带 `sudo` 权限的账号。`sudo` 表示「用管理员权限执行这一条命令」，执行时可能要求输入密码。
- 默认站点占用 **80 和 443** 端口。云服务器请先到控制台放行这两个端口，并确认没有被 Nginx 之类的程序占用（第 3 步会检查）。
- 安装包要从 [Gitee Releases](https://gitee.com/ncepu-bj/fast-https/releases) 或 [GitHub Releases](https://github.com/ncepu-iDealStudio/Fast-Https/releases) 下载，版本号以页面上的最新版为准。

## 1 确认架构并下载安装包

不同处理器要用不同的安装包。先查架构：

```bash
dpkg --print-architecture
```

- 输出 `amd64` → 下载文件名含 `amd64` 的包（大多数云服务器）
- 输出 `arm64` → 下载文件名含 `arm64` 的包

在服务器上下载安装包。下面以 `amd64` 为例，命令里的版本号请换成 releases 页上的最新版：

```bash
wget https://gitee.com/ncepu-bj/fast-https/releases/download/v1.6.0/fast-https_1.6.0_linux_amd64.deb
ls -lh *.deb
```

`ls -lh` 会列出刚下载的文件和大小，能看到文件就表示下载成功。也可以在 releases 页面点下载后把文件上传到服务器，效果一样。

| 架构 | 服务端安装包 | 下载 |
| --- | --- | --- |
| `amd64` | `fast-https_1.6.0_linux_amd64.deb` | [Gitee](https://gitee.com/ncepu-bj/fast-https/releases/download/v1.6.0/fast-https_1.6.0_linux_amd64.deb) / [GitHub](https://github.com/ncepu-iDealStudio/Fast-Https/releases/download/v1.6.0/fast-https_1.6.0_linux_amd64.deb) |
| `arm64` | `fast-https_1.6.0_linux_arm64.deb` | [Gitee](https://gitee.com/ncepu-bj/fast-https/releases/download/v1.6.0/fast-https_1.6.0_linux_arm64.deb) / [GitHub](https://github.com/ncepu-iDealStudio/Fast-Https/releases/download/v1.6.0/fast-https_1.6.0_linux_arm64.deb) |

请选**服务端包**：`fast-https-desktop` 开头的是带图形界面的桌面版，服务器上不需要。

## 2 安装

进入安装包所在目录后执行。`./` 表示「当前目录里的这个文件」，不能省略：

```bash
sudo apt install ./fast-https_1.6.0_linux_amd64.deb
dpkg-query -W fast-https
```

`arm64` 系统请把文件名换成上表对应的 `arm64` 包。`dpkg-query` 会打印包名和版本，能看到 `fast-https` 就说明安装成功。

安装后的文件位置（以后改配置、找日志会用到）：

| 用途 | 安装位置 |
| --- | --- |
| 命令 | `/usr/bin/fast-https` |
| 主配置 | `/etc/fast-https/fast-https.json` |
| 默认站点配置 | `/etc/fast-https/conf.d/default.json` |
| 默认站点目录 | `/usr/share/fast-https/httpdoc/root/` |
| 证书目录 | `/etc/fast-https/cert/` |
| 日志目录 | `/var/log/fast-https/` |

## 3 启动服务

先检查 80 / 443 有没有被其他程序占用：

```bash
ss -ltn '( sport = :80 or sport = :443 )'
```

只输出一行表头（`State Recv-Q ...`）说明端口空闲，可以继续；如果列出了具体进程，说明端口被占用，需要编辑 `/etc/fast-https/conf.d/default.json`，把 `listen` 改成空闲端口，例如 `[18080, "18443 ssl h2"]`，后面验证时也要换成对应的端口。

安装包已经注册了名为 `fast-https.service` 的 **systemd 服务**。systemd 是 Linux 管理后台服务的组件，`systemctl` 是操作它的命令。

```bash
sudo systemctl start fast-https.service
systemctl is-active fast-https.service
```

第二条命令应输出 `active`，表示服务正在运行。

## 4 验证默认站点

先测 HTTP：

```bash
curl --noproxy '*' -fsS -o /dev/null -w 'HTTP %{http_code}\n' http://localhost/
```

看到 `HTTP 200` 就成功了。`200` 是「请求成功」的状态码；`--noproxy '*'` 让这条本机请求绕过代理，避免机器上的代理设置影响结果。

首次启动会为 `localhost` 生成一张由本地 CA 签发的证书。下面先下载这张 CA 证书，再用它校验 HTTPS 连接：

```bash
curl --noproxy '*' -fSLo fast-https-local-root.crt http://localhost/root.crt &&
curl --noproxy '*' --cacert ./fast-https-local-root.crt \
  -fsS -o /dev/null -w 'HTTPS %{http_code} | TLS verify %{ssl_verify_result}\n' https://localhost/
```

`HTTPS 200 | TLS verify 0` 表示 HTTPS 正常，`0` 代表证书校验通过。

![Ubuntu 终端中的安装版本、服务状态和 HTTP、HTTPS 验证结果](/assets/images/docs/install/linux/ubuntu/service-verification.png)

如果服务器就在你面前且有桌面，在浏览器打开 `http://localhost/` 可看到默认首页。**如果服务器在云上**，要在你自己电脑的浏览器里打开 `http://<服务器公网 IP>/`，而不是 `localhost`——`localhost` 永远指正在操作的那台机器。

![Ubuntu 浏览器访问 localhost 时显示的 Fast-Https 默认首页](/assets/images/docs/install/linux/ubuntu/default-homepage.png)

用浏览器打开 HTTPS 时会出现「证书不受信任」的提示，这是自签名证书的正常现象，测试时可以选择继续访问；正式对外服务应配置与域名匹配的证书。

## 5 管理服务

安装包已注册 `fast-https.service`，日常用 `systemctl` 管理：

```bash
sudo systemctl enable --now fast-https.service   # 立即启动并设置开机自启
sudo systemctl restart fast-https.service        # 修改配置后重启
systemctl status fast-https.service --no-pager   # 查看运行状态
sudo journalctl -u fast-https.service -n 30 --no-pager  # 查看最近日志
```

仅做本机测试时，验证完可以停止；`disable --now` 会同时取消开机自启：

```bash
sudo systemctl stop fast-https.service
sudo systemctl disable --now fast-https.service
```

需要卸载软件但保留配置、证书和日志时：

```bash
sudo apt remove fast-https
```

## 6 常见问题

| 现象 | 怎么处理 |
| --- | --- |
| 下载时报 404 | 版本号写错了，去 releases 页核对最新的 tag 和文件名 |
| `apt` 提示找不到文件 | 确认当前目录就是安装包所在目录，命令里的 `./` 和文件名拼写要正确 |
| `is-active` 不是 `active` | 用 `systemctl status fast-https.service --no-pager` 看报错，再查日志 |
| curl 返回 000 或连接被拒 | 服务没起来，回到第 3 步；若改过端口，验证地址也要跟着换 |
| 自己电脑打不开页面 | 检查云安全组是否放行 80，且浏览器用的是服务器公网 IP |

对外部署时，把 `server_name` 改成实际访问的域名或 IP，并在防火墙和云平台安全组中放行监听端口。

## 下一步

默认站点只用来确认安装成功。想发布自己的网站或配置反向代理，请看左侧「使用教程」栏目。
