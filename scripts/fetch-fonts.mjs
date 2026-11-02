/**
 * 按站点实际用到的字符，从 Google Fonts 抓取 woff2 切片并自托管。
 *
 * 为什么要这么做：中文字体全量 5MB+，全量自托管不可接受；Google Fonts 本身
 * 就把 Noto Serif SC 切成了 100 多个 unicode-range 分片，我们只保留「站点文案
 * 真正覆盖到」的分片，剩下的交给系统字体兜底。
 *
 * 用法（改动内容后重跑一次即可，新增字符可能落到新的分片里）：
 *   node scripts/fetch-fonts.mjs
 *
 * 产物：static/fonts/** 与 static/css/fonts.css —— 两个都要提交。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/* ---------- 1. 收集站点实际用到的字符 ---------- */
const chars = new Set();
for (let i = 32; i <= 126; i++) chars.add(String.fromCharCode(i));
for (const c of '，。、；：？！“”‘’（）《》〈〉【】…—·　￥％＆～') chars.add(c);

function walk(dir, exts) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'public', 'resources', '.git', 'design-demos', 'assets'].includes(e.name)) continue;
      walk(p, exts);
    } else if (exts.some((x) => p.endsWith(x))) {
      for (const ch of fs.readFileSync(p, 'utf8')) chars.add(ch);
    }
  }
}
walk(path.join(ROOT, 'content'), ['.md']);
walk(path.join(ROOT, 'i18n'), ['.yaml']);
walk(path.join(ROOT, 'layouts'), ['.html', '.json']);
walk(path.join(ROOT, 'static', 'js'), ['.js']);

const codes = [...chars].map((c) => c.codePointAt(0));
console.log(`站点字符数: ${codes.length}`);

/* ---------- 2. 拉取 Google 的分片 CSS ---------- */
function parseRanges(str) {
  const out = [];
  for (const part of str.split(',')) {
    const m = part.trim().match(/^U\+([0-9A-Fa-f]+)(?:-([0-9A-Fa-f]+))?$/);
    if (!m) continue;
    const lo = parseInt(m[1], 16);
    const hi = m[2] ? parseInt(m[2], 16) : lo;
    out.push([lo, hi]);
  }
  return out;
}

const hits = (ranges) => codes.some((c) => ranges.some(([lo, hi]) => c >= lo && c <= hi));

const FAMILIES = [
  { name: 'Noto Serif SC', slug: 'noto-serif-sc', query: 'Noto+Serif+SC:wght@700' },
  { name: 'IBM Plex Sans', slug: 'ibm-plex-sans', query: 'IBM+Plex+Sans:wght@400;500;600' },
  { name: 'IBM Plex Mono', slug: 'ibm-plex-mono', query: 'IBM+Plex+Mono:wght@400;500' },
];

const cssOut = [];
const report = [];

for (const fam of FAMILIES) {
  const res = await fetch(`https://fonts.googleapis.com/css2?family=${fam.query}&display=swap`, {
    headers: { 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`${fam.name} CSS 请求失败: ${res.status}`);
  const css = await res.text();

  const dir = path.join(ROOT, 'static', 'fonts', fam.slug);
  fs.mkdirSync(dir, { recursive: true });

  let i = 0, kept = 0, bytes = 0;
  for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const body = block[1];
    const weight = (body.match(/font-weight:\s*(\d+)/) || [])[1] || '400';
    const src = (body.match(/url\((https:[^)]+)\)/) || [])[1];
    const ur = body.match(/unicode-range:\s*([^;]+);/);
    if (!src) continue;
    i++;
    if (ur && !hits(parseRanges(ur[1]))) continue;

    const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
    const file = `${fam.slug}-${weight}-${String(i).padStart(3, '0')}.woff2`;
    fs.writeFileSync(path.join(dir, file), buf);
    bytes += buf.length;
    kept++;

    cssOut.push(
      `@font-face{font-family:'${fam.name}';font-style:normal;font-weight:${weight};font-display:swap;` +
        `src:url(../fonts/${fam.slug}/${file}) format('woff2');` +
        (ur ? `unicode-range:${ur[1].trim()};` : '') +
        `}`
    );
  }
  report.push({ 字体: fam.name, 分片: `${kept}/${i}`, KB: Math.round(bytes / 1024) });
}

fs.writeFileSync(path.join(ROOT, 'static', 'css', 'fonts.css'), cssOut.join('\n') + '\n');
console.table(report);
console.log(`fonts.css 共 ${cssOut.length} 条 @font-face`);
