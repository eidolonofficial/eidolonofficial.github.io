// Site check: run with `node check.mjs` from this folder. Prints PASS or the failures, and exits 1 on failure.
// It checks: no en or em dash (or their HTML entities) and no legacy character name in any text file,
// no script tag in any file but the pages, and on the pages at most one inline script: no src, identical on
// every page that has one, under 25 lines, with no network, storage or dynamic code. DESIGN.md must exist and
// every page must link each font family named in its front matter. No raster image file or reference may
// exist. Every local href and src resolves to a file here, every in-page #fragment
// exists, every img has a non-empty alt, and every page has lang="en", a title, exactly one h1, a skip
// link to #main, a main#main, exactly one masthead with exactly one site nav, and a footer colophon.
// External references are limited: stylesheet links only to fonts.googleapis.com (exactly one per page),
// a preconnect only to fonts.gstatic.com, and links only to github.com, nodejs.org and linkedin.com.
// It also checks contrast for the color tokens in both schemes of style.css: body text, muted text,
// labels, links, icons, verdict chips, button text and code at least 4.5 to 1, text on the hero sky at
// least 4.5 to 1, the focus ring at least 3 to 1, and the gold used for large display type at least 3 to 1.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PAGES = ['index.html', 'safety.html', 'pipeline.html', 'autopilot.html', 'release.html', 'about.html'];
const TEXT_EXT = new Set(['.html', '.css', '.mjs', '.svg', '.txt', '.md']);
const DASH = /[\u2013\u2014]|&(?:ndash|mdash);|&#(?:8211|8212|x2013|x2014);/i;
const LEGACY = new RegExp(['Fable', 'fox'].join(''), 'i');
const SCRIPT_TAG = new RegExp('<' + 'script\\b', 'i');
const LINK_HOSTS = new Set(['github.com', 'nodejs.org', 'linkedin.com', 'owasp.org', 'attack.mitre.org', 'cwe.mitre.org', 'csrc.nist.gov', 'www.w3.org']);
const FONT_CSS_HOST = 'fonts.googleapis.com';
const FONT_FILE_HOST = 'fonts.gstatic.com';
const RASTER = new RegExp('\\.(?:' + ['png', 'jpe?g', 'gif', 'webp', 'avif', 'bmp', 'ico', 'tiff?', 'heic'].join('|') + ')\\b', 'i');
const SCRIPT_BLOCK = new RegExp('<' + 'script\\b([^>]*)>([\\s\\S]*?)</' + 'script>', 'gi');
const SCRIPT_BANNED = ['http', 'fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB',
  'document.cookie', 'import(', 'eval(', 'new Function', 'WebSocket', 'sendBeacon'];
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

// 1. Dashes, the legacy character name, raster images and stray script tags, in every text file.
//    check.mjs names the script tag and the raster extensions only in split form, so it does not trip
//    its own check. Script tags on the pages are judged in section 2.
for (const file of files) {
  if (RASTER.test(rel(file))) fail(`${rel(file)}: raster image file`);
  if (!TEXT_EXT.has(extname(file))) continue;
  const isPage = extname(file) === '.html';
  readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (DASH.test(line)) fail(`${rel(file)}:${i + 1}: en or em dash`);
    if (LEGACY.test(line)) fail(`${rel(file)}:${i + 1}: legacy character name`);
    if (!isPage && SCRIPT_TAG.test(line)) fail(`${rel(file)}:${i + 1}: script tag`);
    if (RASTER.test(line)) fail(`${rel(file)}:${i + 1}: raster image reference`);
  });
}

// DESIGN.md must exist and name the font families in its front matter, under `fonts:`.
const designPath = join(ROOT, 'DESIGN.md');
let designFonts = [];
if (!existsSync(designPath)) fail('DESIGN.md is missing');
else {
  const front = (readFileSync(designPath, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
  const fontsBlock = (front.match(/^fonts:[ \t]*\r?\n((?:[ \t]+\S.*(?:\r?\n|$))+)/m) || [])[1] || '';
  designFonts = [...fontsBlock.matchAll(/^[ \t]+[a-z]+:[ \t]*(.+?)[ \t]*$/gm)].map((m) => m[1].replace(/^["']|["']$/g, ''));
  if (!designFonts.length) fail('DESIGN.md: no fonts list in the front matter');
}
const scripts = [];

// 2. Pages: structure, masthead, colophon, links, images.
const external = new Set();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[2] ?? m[3]) : null;
};
const idsOf = (html) => new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));
const hostOf = (url) => { try { return new URL(url.replace(/&amp;/g, '&')).hostname; } catch { return null; } };

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

  // The masthead: exactly one, holding exactly one nav, labelled Site, linking every page.
  const mastheads = [...html.matchAll(/<header\b[^>]*class="masthead"[^>]*>([\s\S]*?)<\/header>/gi)];
  if (mastheads.length !== 1) fail(`${name}: ${mastheads.length} masthead headers, expected 1`);
  else {
    const navs = [...mastheads[0][1].matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)];
    if (navs.length !== 1) fail(`${name}: masthead has ${navs.length} nav elements, expected 1`);
    else {
      if (attr(navs[0][0], 'aria-label') !== 'Site') fail(`${name}: masthead nav is not labelled "Site"`);
      for (const page of PAGES) if (!navs[0][2].includes(`href="${page}"`)) fail(`${name}: masthead nav lacks ${page}`);
      if ((navs[0][2].match(/aria-current="page"/g) || []).length !== 1) fail(`${name}: masthead nav needs exactly one aria-current="page"`);
    }
    if (!/Volume 0\.1, October 2026/.test(mastheads[0][1])) fail(`${name}: masthead lacks the dateline`);
  }
  const siteNavs = html.match(/<nav\b[^>]*aria-label="Site"/gi) || [];
  if (siteNavs.length !== 1) fail(`${name}: ${siteNavs.length} site navs, expected 1`);

  // The colophon: exactly one footer, with the license, the credits link and the sourcing line.
  const colophons = [...html.matchAll(/<footer\b[^>]*class="colophon"[^>]*>([\s\S]*?)<\/footer>/gi)];
  if (colophons.length !== 1 || (html.match(/<footer\b/gi) || []).length !== 1) fail(`${name}: needs exactly one footer, the colophon`);
  else {
    const c = colophons[0][1];
    if (!/>Colophon</.test(c)) fail(`${name}: colophon lacks its heading`);
    if (!/MIT License/.test(c)) fail(`${name}: colophon lacks the MIT License line`);
    if (!/href="https:\/\/github\.com\/eidolonofficial\/Hearth\/blob\/[^"]+\/CREDITS\.md"/.test(c)) fail(`${name}: colophon lacks the CREDITS.md link`);
    if (!/Every claim on these pages traces to a document/.test(c)) fail(`${name}: colophon lacks the sourcing line`);
  }

  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const alt = attr(m[0], 'alt');
    if (alt === null || !alt.trim()) fail(`${name}: img without a non-empty alt: ${m[0]}`);
  }

  let fontSheets = 0;
  for (const m of html.matchAll(/<(a|link|img|source|iframe|embed|object)\b[^>]*>/gi)) {
    const tagName = m[1].toLowerCase();
    for (const key of ['href', 'src', 'data']) {
      const value = attr(m[0], key);
      if (value === null) continue;
      if (/^https?:\/\//i.test(value)) {
        external.add(value);
        const host = hostOf(value);
        const relAttr = (attr(m[0], 'rel') || '').toLowerCase();
        if (tagName === 'a') {
          if (!LINK_HOSTS.has(host)) fail(`${name}: link to a host outside the allowlist: ${value}`);
        } else if (tagName === 'link' && relAttr === 'stylesheet' && host === FONT_CSS_HOST) {
          fontSheets += 1;
        } else if (tagName === 'link' && relAttr === 'preconnect' && host === FONT_FILE_HOST) {
          // allowed
        } else {
          fail(`${name}: external ${tagName} ${key} not allowed: ${value}`);
        }
        continue;
      }
      if (/^(mailto|tel|data|javascript):/i.test(value)) { fail(`${name}: unexpected ${key} scheme ${value}`); continue; }
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
  if (fontSheets !== 1) fail(`${name}: ${fontSheets} Google Fonts stylesheet links, expected 1`);
  const fontHref = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attr(m[0], 'href') || '')
    .find((h) => hostOf(h) === FONT_CSS_HOST) || '';
  for (const family of designFonts) {
    const param = `family=${family.replace(/ /g, '+')}`;
    if (!fontHref.includes(`${param}:`) && !fontHref.includes(`${param}&`)) fail(`${name}: does not link the font ${family} named in DESIGN.md`);
  }

  // Scripts: at most one per page, inline, under 25 lines, with no network, storage or dynamic code.
  const tagCount = (html.match(new RegExp(SCRIPT_TAG.source, 'gi')) || []).length;
  const blocks = [...html.matchAll(SCRIPT_BLOCK)];
  if (tagCount !== blocks.length) fail(`${name}: a script tag without a closing tag`);
  if (blocks.length > 1) fail(`${name}: ${blocks.length} scripts, at most 1 allowed`);
  for (const [, attrs, body] of blocks) {
    if (/\bsrc\s*=/i.test(attrs)) fail(`${name}: external script (src) not allowed`);
    const lines = body.trim().split(/\r?\n/).length;
    if (lines >= 25) fail(`${name}: the script has ${lines} lines, it must be under 25`);
    for (const word of SCRIPT_BANNED) if (body.includes(word)) fail(`${name}: the script contains "${word}"`);
    scripts.push([name, body.trim(), lines]);
  }
}
if (new Set(scripts.map(([, body]) => body)).size > 1) fail(`the scripts differ between pages: ${scripts.map(([n]) => n).join(', ')}`);

// 3. The stylesheet: nothing pulled in from elsewhere, and contrast in both schemes.
const css = readFileSync(join(ROOT, 'style.css'), 'utf8');
if (/@import/i.test(css)) fail('style.css: @import is not allowed');
if (/url\(\s*["']?(?:https?:)?\/\//i.test(css)) fail('style.css: external url() is not allowed');
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
const PAIRS = [['text', 4.5], ['muted', 4.5], ['link', 4.5], ['label', 4.5], ['mirror', 4.5],
  ['block', 4.5], ['ask', 4.5], ['allow', 4.5], ['gold', 3]];
const EXTRA = [['text', 'sky', 4.5], ['muted', 'sky', 4.5], ['onbtn', 'btn', 4.5], ['codetext', 'codebg', 4.5], ['focus', 'bg', 3]];
for (const [label, src] of [['light', lightSrc], ['dark', darkSrc]]) {
  if (!src) { fail(`style.css: no ${label} token block`); continue; }
  const t = block(src[1]);
  for (const [fg, min] of PAIRS) {
    for (const bg of ['bg', 'surface']) {
      if (!t[fg] || !t[bg]) { fail(`style.css ${label}: missing --${fg} or --${bg}`); continue; }
      const r = ratio(t[fg], t[bg]);
      contrastLines.push(`${label} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
      if (r < min) fail(`style.css ${label}: --${fg} on --${bg} is ${r.toFixed(2)} to 1, below ${min}`);
    }
  }
  for (const [fg, bg, min] of EXTRA) {
    if (!t[fg] || !t[bg]) { fail(`style.css ${label}: missing --${fg} or --${bg}`); continue; }
    const r = ratio(t[fg], t[bg]);
    contrastLines.push(`${label} ${fg} on ${bg}: ${r.toFixed(2)} (min ${min})`);
    if (r < min) fail(`style.css ${label}: --${fg} on --${bg} is ${r.toFixed(2)} to 1, below ${min}`);
  }
}

console.log('External URLs:');
for (const url of [...external].sort()) console.log(`  ${url}`);
console.log('Contrast:');
for (const line of contrastLines) console.log(`  ${line}`);
console.log(`Fonts named in DESIGN.md: ${designFonts.join(', ')}`);
console.log(`Scripts: ${scripts.length ? scripts.map(([n, , l]) => `${n} (${l} lines)`).join(', ') + ', identical and inline' : 'none'}`);
console.log(`Checked ${htmlFiles.length} pages and ${files.length} files.`);
if (failures.length) {
  for (const f of failures) console.log(`FAIL ${f}`);
  process.exit(1);
}
console.log('PASS');
