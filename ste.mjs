// How close the site's prose is to ASD-STE100 (Simplified Technical English), as the share of sentences
// that pass every check, per page. The checks are mechanical stand-ins for STE's rules for descriptive text;
// they find candidates and a person decides. Verbatim pull quotes (blockquote), code, pre, figcaption, headings,
// the masthead and the navigation are not measured. "80 percent of the way" means at least 80 percent of a
// page's sentences pass every check and none fails hard (over 30 words, or an em or en dash).
//
//   node ste.mjs            summary per page, exit 1 when a page is under 80 percent or has a hard failure
//   node ste.mjs --verbose  also prints every failing sentence with its reasons
import { readFileSync, readdirSync } from "node:fs";

const PAGES = readdirSync(".").filter((f) => f.endsWith(".html")).sort();
const VERBOSE = process.argv.includes("--verbose");
const BAR = 0.8;

const TECHNICAL_ING = new Set(["embedding", "embeddings", "training", "learning", "scaling", "routing", "reasoning", "thinking",
  "encoding", "decoding", "string", "strings", "setting", "settings", "building", "warning", "warnings", "meaning", "wiring",
  "rendering", "logging", "testing", "reading", "writing", "mapping"]);
const NOT_VERB_ING = new Set(["thing", "things", "nothing", "something", "anything", "everything", "during", "ring", "spring",
  "morning", "evening", "ceiling", "ping", "sling", "sting", "swing", "king", "wing", "bring", "sing"]);
const PLAINER = { utilize: "use", utilise: "use", approximately: "about", numerous: "many", subsequently: "then", commence: "start",
  facilitate: "help", demonstrate: "show", obtain: "get", sufficient: "enough", additional: "more", prior: "before",
  regarding: "about", whereas: "but", whilst: "while", thus: "so", hence: "so", therefore: "so", endeavour: "try",
  endeavor: "try", ascertain: "find", comprise: "contain", comprises: "contains", constitute: "make", constitutes: "makes",
  possess: "have", possesses: "has", require: "need", requires: "needs", terminate: "stop", initiate: "start",
  individual: "one", employ: "use", employs: "uses", assist: "help", attempt: "try", attempts: "tries", enormous: "very large",
  vast: "very large", merely: "only", solely: "only", nevertheless: "but" };
const IRREGULAR = new Set(["built", "made", "found", "given", "taken", "shown", "known", "seen", "done", "written", "chosen",
  "drawn", "held", "kept", "left", "led", "put", "read", "run", "set", "sent", "spent", "told", "thought", "brought", "bought",
  "caught", "taught", "won", "grown", "thrown", "hidden", "broken", "spoken", "stolen", "frozen", "worn", "cut", "split",
  "fed", "hung", "struck", "bound", "wound", "laid", "paid", "said", "sold", "pinned", "wired", "signed"]);
const LINKERS = /,|\b(which|who|whose|whom|because|although|though|while|whereas|unless|until|since|so that)\b/gi;
const BE = "(?:is|are|was|were|be|been|being|am)";
const PASSIVE = new RegExp(`\\b${BE}\\s+(?:\\w+ly\\s+|not\\s+)?(\\w+)\\b`, "gi");
const PERFECT = /\b(?:has|have|had)\s+(?:\w+ly\s+|not\s+)?(\w+)\b/gi;
const MODAL = /\b(would|could|might|should|shall)\b/i;
const CONTRACTION = /\w(?:n't|'re|'ll|'ve|'d)\b/i;

// Prose of one page: the main element without quotes, code, captions and headings; tags become spaces.
function prose(html) {
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [html])[0];
  return main
    .replace(/<(script|style|code|pre|blockquote|figcaption|h1|h2|h3|h4|nav|header)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<(p|li|td|th|dd|dt|div|section|article|aside|tr|table|figure|footer)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, "\n").trim();
}
// Sentences: split each line on terminal punctuation followed by a space and a capital or a quote.
function sentences(text) {
  const out = [];
  for (const line of text.split("\n")) {
    for (const s of line.split(/(?<=[.!?])\s+(?=["(A-Z0-9])/)) {
      const t = s.trim();
      if (t.split(/\s+/).length >= 3 && /[.!?]$/.test(t)) out.push(t);
    }
  }
  return out;
}
function check(s) {
  const reasons = [];
  const words = s.split(/\s+/);
  if (words.length > 30) reasons.push(`long: ${words.length} words (hard)`);
  else if (words.length > 25) reasons.push(`long: ${words.length} words`);
  if (/[\u2013\u2014]/.test(s)) reasons.push("dash (hard)");
  if (/;/.test(s)) reasons.push("semicolon");
  if (CONTRACTION.test(s)) reasons.push("contraction");
  if (MODAL.test(s)) reasons.push("soft modal");
  for (const m of s.matchAll(PERFECT)) if (/(ed|en)$/.test(m[1]) || IRREGULAR.has(m[1].toLowerCase())) { reasons.push("perfect tense"); break; }
  for (const m of s.matchAll(PASSIVE)) {
    const w = m[1].toLowerCase();
    if ((/(ed|en)$/.test(w) && w.length > 4 && !["often", "even", "open", "between", "seven", "golden", "hidden"].includes(w)) || IRREGULAR.has(w)) { reasons.push(`passive: ${m[0]}`); break; }
  }
  for (const w of words.map((x) => x.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, ""))) {
    if (/ing$/.test(w) && w.length > 4 && !TECHNICAL_ING.has(w) && !NOT_VERB_ING.has(w)) { reasons.push(`ing: ${w}`); break; }
  }
  for (const w of words.map((x) => x.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, ""))) if (PLAINER[w]) { reasons.push(`word: ${w} (${PLAINER[w]})`); break; }
  if ((s.match(LINKERS) || []).length > 2) reasons.push("clauses: more than two links");
  return reasons;
}

let bad = false;
for (const page of PAGES) {
  const all = sentences(prose(readFileSync(page, "utf8")));
  const failing = all.map((s) => [s, check(s)]).filter(([, r]) => r.length);
  const hard = failing.filter(([, r]) => r.some((x) => x.includes("(hard)")));
  const share = all.length ? (all.length - failing.length) / all.length : 1;
  const ok = share >= BAR && hard.length === 0;
  if (!ok) bad = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${page}: ${Math.round(share * 100)}% of ${all.length} sentences pass; hard failures ${hard.length}`);
  if (VERBOSE) for (const [s, r] of failing) console.log(`    - ${r.join("; ")}\n      ${s}`);
}
console.log(bad ? "STE: under the bar" : "STE: every page at or above 80 percent with no hard failure");
process.exit(bad ? 1 : 0);
