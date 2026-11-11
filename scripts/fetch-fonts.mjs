/**
 * 按站点实际用到的字符，从 Google Fonts 抓取拉丁字体切片并自托管。
 *
 * 中文不再自托管：Noto Serif SC 被切成 100 多个 unicode-range 分片，按「当前文案
 * 用到的字符」抓取子集后，任何新增汉字都会落到没有收录的分片里，同行出现
 * 自托管字形 + 系统字体混排（字重/字形不一致，看起来像"扭曲"），而且每次改
 * 文案都要重跑。中文统一交给系统字体栈，见 main.css 的 --serif/--sans/--mono。
 * static/fonts/noto-serif-sc/ 是历史遗留文件，不再被引用，可随时清理。
 *
 * 用法（改动拉丁文案后重跑一次）：
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
