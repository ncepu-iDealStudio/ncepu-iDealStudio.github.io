---
title: Quick start
weight: 1
summary: Pull the image, mount the config and site folders, map ports, then run
---

# Docker quick start

The official Fast-Https images bundle the `fast-https` binary, a default configuration and a sample site. Pull an image, mount your own config and site folders, and it is ready to run. The container paths differ between the base images, so check the table below first.

## 1 Images

| Image tag | Base system | Workdir | Config folder | Site folder |
| --- | --- | --- | --- | --- |
| `alpine` | Alpine Linux | `/app` | `/app/config` | `/app/httpdoc` |
| `ubuntu` | Ubuntu 24.04 | `/usr/local/fast-https` | `/usr/local/fast-https/config` | `/usr/local/fast-https/httpdoc` |
| `centos7` | CentOS 7 | `/usr/local/fast-https` | `/usr/local/fast-https/config` | `/usr/local/fast-https/httpdoc` |

All three images expose `80` and `443` and set `FASTHTTPS_FOREGROUND=1`, so the process runs in the foreground and works with `-d` out of the box.

The images are built from the Dockerfiles in the `build/` folder of the source repository: `build/Dockerfile` (Alpine), `build/docker/Dockerfile_ubuntu` and `build/docker/Dockerfile_centos7`.

## 2 Pull the image

```bash
docker pull registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:alpine
```

Pick another base system if you prefer:

```bash
docker pull registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:ubuntu
docker pull registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:centos7
```

## 3 Prepare the folders to mount

The image already ships a default configuration and a sample home page. Once a host folder is mounted with `-v`, the matching content inside the container is **replaced completely**, so the host folders must be prepared first and must not be empty:

```text
/path/to/config
├── fast-https.json      # main config: listen port and site definitions
├── mime.json            # MIME type table
├── fastcgi.conf         # FastCGI settings
├── cert/                # certificates
└── conf.d/              # site configs

/path/to/httpdoc
└── root/
    └── index.html       # site document root
```

The simplest way to prepare them is to copy the defaults out of the image and then edit them:

```bash
mkdir -p /path/to/config /path/to/httpdoc
docker run --rm registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:alpine \
  sh -c "tar -C /app -cf - config httpdoc" | tar -C /path/to -xf -
```

## 4 Run the container

Alpine image (used throughout this page):

```bash
docker run -d --name fast-https \
  -p 8080:80 \
  -p 443:443 \
  -v /path/to/config:/app/config \
  -v /path/to/httpdoc:/app/httpdoc \
  --restart unless-stopped \
  registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:alpine
```

Flags explained:

- `-p 8080:80`: host `8080` to container HTTP `80`. Keeping 8080 avoids clashing with an existing web server on the host; the URL then includes the port.
- `-p 443:443`: host `443` to container HTTPS `443`, so certificates and public links use the standard port. If 443 is taken, use `-p 8443:443` instead and include the port in links.
- `-v /path/to/config:/app/config`: host config folder to the container config folder.
- `-v /path/to/httpdoc:/app/httpdoc`: host site folder to the container document root.
- `--restart unless-stopped`: restart after a crash or a host reboot.
- `-d`: run detached. Drop `-d` to stream logs to the terminal and stop with `Ctrl+C`.

For the ubuntu and centos7 images, only the container-side paths change, to `/usr/local/fast-https/config` and `/usr/local/fast-https/httpdoc`:

```bash
docker run -d --name fast-https \
  -p 8080:80 -p 443:443 \
  -v /path/to/config:/usr/local/fast-https/config \
  -v /path/to/httpdoc:/usr/local/fast-https/httpdoc \
  --restart unless-stopped \
  registry.cn-beijing.aliyuncs.com/ncepu-ideal/fast-https:ubuntu
```

## 5 Verify

```bash
# is the container up?
docker ps --filter name=fast-https

# follow the startup log
docker logs -f fast-https

# request the home page
curl -I http://127.0.0.1:8080/
```

Open `http://<server-ip>:8080/` in a browser and the site home page should appear. A 404 usually means `httpdoc/root/index.html` is missing on the host. If the container keeps restarting, check the syntax of `fast-https.json`: `//` comments are allowed, but a trailing comma is not.

## 6 Build the image yourself

The images can also be built from source. Because the Dockerfiles run `COPY go.mod go.sum` and `COPY . .`, the build context must be the repository root: run `docker build` there and select the Dockerfile with `-f`.

```bash
git clone https://github.com/ncepu-iDealStudio/Fast-Https.git
cd Fast-Https

# Alpine (default Dockerfile in build/Dockerfile)
docker build -f build/Dockerfile -t fast-https:tag .

# Ubuntu
docker build -f build/docker/Dockerfile_ubuntu -t fast-https:tag .

# CentOS 7
docker build -f build/docker/Dockerfile_centos7 -t fast-https:tag .
```

The build stage uses `golang:1.27-alpine` and compiles statically with `CGO_ENABLED=0`; the binary is then copied into the runtime image. The workdirs are `/app` (Alpine) and `/usr/local/fast-https` (Ubuntu, CentOS 7), matching the mount paths above. In mainland China you can also clone from the gitee mirror: `https://gitee.com/ncepu-bj/fast-https`.
