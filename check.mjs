// Site check: run with `node check.mjs` from this folder. Prints PASS or the failures, and exits 1 on failure.
// It checks: no en or em dash (or their HTML entities) in any text file, every local href and src
// resolves to a file here, every in-page #fragment exists, every img has a non-empty alt, and every
// page has lang="en", a title, exactly one h1, a skip link to #main, a main#main and the site nav.
// It also checks text contrast (at least 4.5 to 1) for the color tokens in both schemes of style.css.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PAGES = ['index.html', 'safety.html', 'pipeline.html', 'autopilot.html', 'release.html'];
const TEXT_EXT = new Set(['.html', '.css', '.mjs', '.svg', '.txt', '.md']);
const DASH = /[\u2013\u2014]|&(?:ndash|mdash);|&#(?:8211|8212|x2013|x2014);/i;
const LEGACY = new RegExp(['Fable', 'fox'].join(''), 'i');
const failures = [];
const fail = (msg) => failures.push(msg);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out); else out.push(path);
  }
  return out;
}

const files = walk(ROOT);
const rel = (p) => relative(ROOT, p).split('\\').join('/');

// 1. Dashes and the legacy character name, in every text file.
for (const file of files) {
  if (!TEXT_EXT.has(extname(file))) continue;
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (DASH.test(line)) fail(`${rel(file)}:${i + 1}: en or em dash`);
    if (LEGACY.test(line)) fail(`${rel(file)}:${i + 1}: legacy character name`);
  });
}

// 2. Pages: structure, links, images.
const external = new Set();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
};
const idsOf = (html) => new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));

const htmlFiles = files.filter((f) => extname(f) === '.html');
for (const page of PAGES) if (!existsSync(join(ROOT, page))) fail(`missing page ${page}`);

for (const file of htmlFiles) {
  const name = rel(file);
  const html = readFileSync(file, 'utf8');
  const ids = idsOf(html);

  if (!/<html[^>]*\slang="en"/i.test(html)) fail(`${name}: no lang="en" on <html>`);
  const title = html.match(/<title>([^<]*)<\/title>/i);
  if (!title || !title[1].trim()) fail(`${name}: no title`);
  const h1s = html.match(/<h1[\s>]/gi) || [];
  if (h1s.length !== 1) fail(`${name}: ${h1s.length} h1 elements, expected 1`);
  if (!/<a[^>]*class="skip"[^>]*href="#main"|<a[^>]*href="#main"[^>]*class="skip"/i.test(html)) fail(`${name}: no skip link to #main`);
  if (!/<main[^>]*\sid="main"/i.test(html)) fail(`${name}: no <main id="main">`);
  const nav = html.match(/<nav[^>]*aria-label="[^"]+"[^>]*>([\s\S]*?)<\/nav>/i);
  if (!nav) fail(`${name}: no labelled <nav>`);
  else {
    for (const page of PAGES) if (!nav[1].includes(`href="${page}"`)) fail(`${name}: nav lacks ${page}`);
    if ((nav[1].match(/aria-current="page"/g) || []).length !== 1) fail(`${name}: nav needs exactly one aria-current="page"`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const alt = attr(m[0], 'alt');
    if (alt === null || !alt.trim()) fail(`${name}: img without a non-empty alt: ${m[0]}`);
  }

  for (const m of html.matchAll(/<(?:a|link|img|script|source)\b[^>]*>/gi)) {
    for (const key of ['href', 'src']) {
      const value = attr(m[0], key);
      if (value === null) continue;
      if (/^https?:\/\//i.test(value)) { external.add(value); continue; }
      if (/^(mailto|tel|data):/i.test(value)) { fail(`${name}: unexpected ${key} scheme ${value}`); continue; }
      const [pathPart, fragment] = value.split('#');
      const clean = pathPart.split('?')[0];
      if (clean === '') {
        if (fragment && !ids.has(fragment)) fail(`${name}: missing in-page target #${fragment}`);
        continue;
      }
      const target = resolve(dirname(file), clean);
      if (!target.startsWith(ROOT) || !existsSync(target) || statSync(target).isDirectory()) {
        fail(`${name}: ${key}="${value}" does not resolve to a file in this folder`);
        continue;
      }
      if (fragment && extname(target) === '.html' && !idsOf(readFileSync(target, 'utf8')).has(fragment)) {
        fail(`${name}: ${value} points at a missing #${fragment}`);
      }
    }
  }
}

// 3. Contrast of the text tokens against both backgrounds, light and dark.
const css = readFileSync(join(ROOT, 'style.css'), 'utf8');
const block = (src) => Object.fromEntries([...src.matchAll(/--([a-z]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));
const lightSrc = css.match(/:root\s*\{([^}]*)\}/);
const darkSrc = css.match(/prefers-color-scheme:\s*dark\)\s*\{\s*:root\s*\{([^}]*)\}/);
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const contrastLines = [];
for (const [label, src] of [['light', lightSrc], ['dark', darkSrc]]) {
  if (!src) { fail(`style.css: no ${label} token block`); continue; }
  const t = block(src[1]);
  for (const fg of ['text', 'muted', 'link']) {
    for (const bg of ['bg', 'surface']) {
      if (!t[fg] || !t[bg]) { fail(`style.css ${label}: missing --${fg} or --${bg}`); continue; }
      const r = ratio(t[fg], t[bg]);
      contrastLines.push(`${label} ${fg} on ${bg}: ${r.toFixed(2)}`);
      if (r < 4.5) fail(`style.css ${label}: --${fg} on --${bg} is ${r.toFixed(2)} to 1, below 4.5`);
    }
  }
  if (t.focus && t.bg && ratio(t.focus, t.bg) < 3) fail(`style.css ${label}: focus outline below 3 to 1`);
}

console.log('External URLs:');
for (const url of [...external].sort()) console.log(`  ${url}`);
console.log('Contrast:');
for (const line of contrastLines) console.log(`  ${line}`);
console.log(`Checked ${htmlFiles.length} pages and ${files.length} files.`);
if (failures.length) {
  for (const f of failures) console.log(`FAIL ${f}`);
  process.exit(1);
}
console.log('PASS');
