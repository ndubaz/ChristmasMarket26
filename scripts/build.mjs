// Builds the app from src/ + data/. No dependencies.
//   node scripts/build.mjs            -> public/index.html + public/sw.js (Vercel site, offline + installable)
//   node scripts/build.mjs --artifact -> dist/artifact.html (single file for the claude.ai artifact; jsPDF from cdnjs, no service worker)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const root = new URL("..", import.meta.url);
const read = p => readFileSync(new URL(p, root), "utf8");
const ARTIFACT = process.argv.includes("--artifact");

const markets = JSON.parse(read("data/markets.json"));
const geo = JSON.parse(read("data/geo.json"));
const meta = JSON.parse(read("data/meta.json"));

// Validation: a bad edit fails the build instead of breaking the page.
const iso = /^\d{4}-\d{2}-\d{2}$/;
const ids = new Set(), errors = [];
for (const m of markets) {
  for (const k of ["id", "name", "short", "city", "country", "region", "start", "end", "lat", "lng", "driveMin", "rep", "confidence", "source"])
    if (m[k] == null || m[k] === "") errors.push(`${m.name || "?"}: missing ${k}`);
  if (!iso.test(m.start) || !iso.test(m.end) || m.start > m.end) errors.push(`${m.name}: bad dates ${m.start}..${m.end}`);
  if (ids.has(m.id)) errors.push(`duplicate id ${m.id}`);
  ids.add(m.id);
  if (!["confirmed", "projected"].includes(m.confidence)) errors.push(`${m.name}: confidence must be confirmed|projected`);
  for (const d of m.days || []) if (!iso.test(d) || d < m.start || d > m.end) errors.push(`${m.name}: day ${d} outside ${m.start}..${m.end}`);
  for (const d of m.closed || []) if (!iso.test(d)) errors.push(`${m.name}: bad closed date ${d}`);
  for (const e of m.events || []) if (!iso.test(e.date) || !e.title) errors.push(`${m.name}: bad event ${JSON.stringify(e)}`);
  if (!(m.rep >= 1 && m.rep <= 5)) errors.push(`${m.name}: rep must be 1-5`);
  if (m.driveMin > 300) errors.push(`${m.name}: driveMin over 300 (outside 5 h radius)`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }

const tpl = read("src/index.template.html");
let html = tpl
  .replace("__DATA__", () => JSON.stringify(markets))
  .replace("__GEO__", () => JSON.stringify(geo))
  .replace("__BUILT__", meta.checked)
  .replace("__JSPDF_SRC__", ARTIFACT ? "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" : "/vendor/jspdf-2.5.1.umd.min.js")
  .replaceAll("__PWA__", ARTIFACT ? "false" : "true");
if (ARTIFACT) html = html.replace(/<!--PWA-->[\s\S]*?<!--\/PWA-->\n?/, "");

const events = markets.reduce((s, m) => s + (m.events || []).length, 0);
if (ARTIFACT) {
  mkdirSync(new URL("dist/", root), { recursive: true });
  writeFileSync(new URL("dist/artifact.html", root), html);
  console.log(`Built dist/artifact.html: ${markets.length} markets, ${events} events`);
} else {
  writeFileSync(new URL("public/index.html", root), html);
  const version = createHash("sha1").update(html).update(read("src/sw.template.js")).digest("hex").slice(0, 10);
  writeFileSync(new URL("public/sw.js", root), read("src/sw.template.js").replace("__VERSION__", version));
  console.log(`Built public/: ${markets.length} markets, ${events} events, cache ${version}`);
}
