# Fast-Https 文档站

![Hugo](https://img.shields.io/badge/Hugo-0.165%2B-FF4088?logo=hugo&logoColor=white)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github&logoColor=white)
![i18n](https://img.shields.io/badge/i18n-%E4%B8%AD%E6%96%87%20%7C%20English-3B82F6)
![License](https://img.shields.io/badge/Docs-CC%20BY%204.0-9CA3AF)

这是 **Fast-Https** 的官方文档站源码，基于 [Hugo](https://gohugo.io/) 构建，部署在 GitHub Pages：
<https://ncepu-idealstudio.github.io/>

- 产品主页：<https://gitee.com/ncepu-bj/fast-https>
- 源码仓库：[Gitee](https://gitee.com/ncepu-bj/fast-https) / [GitHub](https://github.com/ncepu-iDealStudio/Fast-Https)

本仓库**只包含文档站点**（内容、模板、样式、构建配置），不含 Fast-Https 本体代码。

## 📖 这个项目是干什么的

Fast-Https 是一款用 Go 编写的 Web 服务器 / HTTPS 反向代理工具，面向 Windows 桌面使用：常驻任务栏托盘，通过图形界面完成证书签发、静态站点发布、反向代理、缓存与访问管控，无需命令行。

本站点负责把这些能力讲清楚，内容包括：

- **软件获取与安装**：发行版下载地址、源码仓库、Windows（压缩包 / 安装包）、Linux、Docker、源码构建
- **使用教程**：基本配置、静态站点与单页应用发布、反向代理、WebSocket、重定向、HTTPS、缓存、IP 黑名单、限流
- **团队时间线**：iDealStudio 工作室从 2019 年 Go 学习小组到 Fast-Https 1.0.0 的发展记录

站点支持中英双语：中文在根路径 `/`，英文在 `/en/` 下。

## 🛠 开发环境配置

| 依赖 | 版本要求 | 说明 |
| --- | --- | --- |
| Hugo Extended | ≥ 0.165.0 | 必须用 **extended** 版本，图片 WebP 处理依赖它 |
| Git | 任意较新版本 | 拉取代码、提交 |
| 浏览器 | 现代浏览器 | 预览效果 |

安装 Hugo（任选其一）：

```bash
# macOS
brew install hugo

# Windows
winget install Hugo.Hugo.Extended
# 或 choco install hugo-extended

# Linux（deb）
sudo apt install hugo
```

确认版本与是否 extended：

```bash
hugo version
# 输出中应包含 +extended
```

本地开发：

```bash
# 克隆
git clone https://github.com/ncepu-iDealStudio/ncepu-iDealStudio.github.io.git
cd ncepu-iDealStudio.github.io

# 启动本地服务（含草稿，如 2025/2026 时间线占位）
hugo server -D

# 构建到 public/
hugo --gc --minify
```

默认预览地址：<http://localhost:1313/>

> 首次构建需要处理 `assets/images` 里的原始 PNG，耗时几秒；之后命中 `resources/_gen` 缓存会快很多。

## 🧱 项目结构

```text
.
├─ content/                  # 内容（按语言分目录）
│  ├─ zh/                    # 中文，映射到 /
│  │  ├─ _index.md           # 首页
│  │  ├─ about.md            # 团队时间线页（type: about）
│  │  ├─ docs/               # 文档：欢迎、软件获取、使用教程
│  │  └─ timeline/           # 时间线节点（每个 md 一个节点）
│  └─ en/                    # 英文，映射到 /en/
│     ├─ about.md
│     ├─ docs/               # welcome、install、tutorial
│     └─ timeline/
├─ layouts/                  # 模板
│  ├─ index.html             # 首页
│  ├─ about/single.html      # 时间线故事页
│  ├─ docs/{single,section}.html
│  ├─ timeline/list.html
│  ├─ _default/
│  │  ├─ baseof.html         # 页面骨架（含 favicon、搜索索引 meta）
│  │  ├─ single.html
│  │  └─ _markup/render-image.html   # 图片渲染钩子（WebP + srcset + lazy）
│  ├─ partials/              # nav、footer、doc-shell、doc-side、img、图标
│  └─ shortcodes/            # doc-cards、doc-children、doc-icon、icon
├─ i18n/                     # 界面文案：zh.yaml / en.yaml
├─ assets/images/            # 图片源文件（docs/、timeline/），构建时处理
├─ static/                   # 原样发布：css/、js/、favicon
├─ .github/workflows/        # hugo.yaml：推送到 main 自动构建并部署 Pages
└─ hugo.toml                 # 站点配置：baseURL、双语、菜单、输出格式
```

## ✍️ 写文档的几个约定

- **新增中文页**：在 `content/zh/docs/<栏目>/` 下建 `.md`，`title` 即标题，`weight` 控制顺序；章节目录页用 `_index.md`，并放 `{{< doc-children >}}` 或 `{{< doc-cards >}}` 自动列出子页。
- **新增英文页**：放到 `content/en/docs/` 对应目录。想让中英文页面互相跳转，两边 front matter 写同一个 `translationKey`。
- **界面文案**：改 `i18n/zh.yaml` 与 `i18n/en.yaml`，模板里用 `{{ i18n "key" }}`。
- **图片**：把原始 PNG 放进 `assets/images/docs/<栏目>/<页面序号>.<步骤>.png`，正文按 `/assets/images/...` 引用即可；构建时自动转 WebP、限宽并生成 `srcset`，**不要**放到 `static/` 下。
- **导航菜单**：在 `hugo.toml` 的 `[languages.zh.menus.main]` / `[languages.en.menus.main]` 中配置；文档侧边栏由内容目录自动生成，无需手工维护。

## 🚀 部署

推送到 `main` 触发 `.github/workflows/hugo.yaml`：拉取子模块 → 安装 Hugo Extended → 构建到 `public/` → 上传并部署到 GitHub Pages。

仓库 **Settings → Pages → Source** 需设置为 **GitHub Actions**（而不是从分支部署）。本地无需提交 `public/`。
