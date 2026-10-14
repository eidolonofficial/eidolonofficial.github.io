// Writes every release-bound string on the site from versions.json, so a new release is one edit of that
// file plus `node release.mjs`, and check.mjs refuses a page that disagrees with it. The pages make no
// network request of their own (check.mjs bans fetch in the inline script), so the sync happens here.
//
//   node release.mjs          rewrite the pages from versions.json
//   node release.mjs --check  report what differs and exit 1, change nothing (check.mjs runs this)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const v = JSON.parse(readFileSync(join(ROOT, 'versions.json'), 'utf8'));
const shown = v[v.shown];
const month = d => new Date(d + 'T00:00:00Z').toLocaleString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const day = d => { const t = new Date(d + 'T00:00:00Z'); return t.getUTCDate() + ' ' + month(d); };
const pages = readdirSync(ROOT).filter(f => f.endsWith('.html'));
const problems = [];

// Each rule: a regex that finds the current spelling, and the text it must be. The regex is loose on the
// value and tight on the surroundings, so a stale number is found wherever the page carries it.
const rules = [
  [/<p class="dateline">[^<]*<\/p>/g, `<p class="dateline">${shown.tag}, ${month(shown.date)}</p>`],
  [/<p class="version">[^<]*<\/p>/g, `<p class="version">${shown.tag}</p>`],
  [/(?:Version|Release) v?[0-9.]+, a skill for Claude Code/g, `Release ${shown.tag}, a skill for Claude Code`],
  [/releases\/download\/v[0-9.]+\/Hearth-v[0-9.]+\.zip/g, `releases/download/${v.hearth.tag}/${v.hearth.zip}`],
  [/Hearth-v[0-9.]+\\welcome\.ps1/g, `${v.hearth.zip.replace(/\.zip$/, '')}\\welcome.ps1`],
  [/Hearth-v[0-9.]+\/macos\/Welcome\.command/g, `${v.hearth.zip.replace(/\.zip$/, '')}/macos/Welcome.command`],
  [/Hearth-v[0-9.]+\.zip/g, v.hearth.zip],
  [/[0-9A-F]{64}/g, v.hearth.sha256.toUpperCase()],
  [/[0-9a-f]{64}/g, v.hearth.sha256],
  [/git clone --branch v[0-9.]+ --depth 1 https:\/\/github\.com\/eidolonofficial\/Hearth\.git/g, `git clone --branch ${v.hearth.tag} --depth 1 https://github.com/eidolonofficial/Hearth.git`],
  [/git clone --branch v[0-9.]+ --depth 1 https:\/\/github\.com\/eidolonofficial\/eidolon\.git/g, `git clone --branch ${v.eidolon.tag} --depth 1 https://github.com/eidolonofficial/eidolon.git`],
  [/It clones the v[0-9.]+ tag of Hearth/g, `It clones the ${v.hearth.tag} tag of Hearth`],
  [/Hearth\/blob\/v[0-9.]+\//g, `Hearth/blob/${v.hearth.tag}/`],
  [/eidolon\/blob\/v[0-9.]+\//g, `eidolon/blob/${v.eidolon.tag}/`],
  [/Download Hearth v[0-9.]+/g, `Download Hearth ${v.hearth.tag}`],
  [/on npm, version [0-9.]+ since [0-9]+ [A-Z][a-z]+ [0-9]{4}/g, `on npm, version ${v.npm.version} since ${day(v.npm.date)}`],
  [/eidolon-hearth<\/a> [0-9.]+, published on [0-9]+ [A-Z][a-z]+ [0-9]{4} from the Hearth v[0-9.]+ tag/g, `eidolon-hearth</a> ${v.npm.version}, published on ${day(v.npm.date)} from the Hearth ${v.hearth.tag} tag`],
];
// The ledger must carry a row for the shown tags; rows for older tags stay as history.
const rows = [
  `releases/tag/${v.eidolon.tag}">eidolon ${v.eidolon.tag}</a></th><td><code>${v.eidolon.commit}</code></td><td>${v.eidolon.tests}</td>`,
  `releases/tag/${v.hearth.tag}">Hearth ${v.hearth.tag}</a></th><td><code>${v.hearth.commit}</code></td><td>${v.hearth.tests}</td>`,
];

for (const page of pages) {
  const before = readFileSync(join(ROOT, page), 'utf8');
  let after = before;
  for (const [re, to] of rules) after = after.replace(re, to);
  if (/<table>[\s\S]*Tag commit/.test(after)) for (const row of rows) if (!after.includes(row)) problems.push(`${page}: the ledger lacks the row ${row.slice(0, 60)}...`);
  if (after !== before) {
    if (CHECK) problems.push(`${page}: release strings differ from versions.json (run node release.mjs)`);
    else writeFileSync(join(ROOT, page), after);
  }
}
if (CHECK) {
  if (problems.length) { for (const p of problems) console.log('FAIL  ' + p); process.exit(1); }
  console.log(`PASS  release strings match versions.json (${v.shown} ${shown.tag}, npm ${v.npm.version})`);
} else {
  for (const p of problems) console.log('NOTE  ' + p);
  console.log(`Pages written from versions.json: ${v.shown} ${shown.tag}, eidolon ${v.eidolon.tag}, npm ${v.npm.version}`);
}
