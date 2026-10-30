---
title: Build from source
weight: 4
icon: source
summary: Compile the backend and the console yourself
---

# Build from source

Compile Fast-Https yourself, or set up a development environment from the sources.

## 1 Prerequisites

- **Go** ≥ 1.21 (backend)
- **Node.js** ≥ 18 (management console frontend)
- **Git** (to fetch the sources)

## 2 Get the sources

```bash
git clone https://gitee.com/ncepu-bj/fast-https.git
cd fast-https
```

Or from GitHub:

```bash
git clone https://github.com/ncepu-iDealStudio/Fast-Https.git
```

## 3 Build

Build the frontend first, then the backend binary:

```bash
# management console frontend
npm install
npm run build

# backend (Windows)
go build -o Fast-Https.exe ./cmd/server
```

## 4 Run

```bash
# run directly
./Fast-Https.exe

# or install it as a service so it starts with the system
Fast-Https.exe service install
```

Once running, open `http://localhost:8080/` to reach the console.

<div class="admon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
<div>A source build listens on port 8080 by default; change the listen port in the configuration file and restart if you need something else.</div>
</div>
