// Prints the markets that most need re-checking, as compact JSON, so an update run can work through them.
//   node scripts/verify-list.mjs [--days 21] [--max 60]
// Priority: projected dates, then markets opening or holding events in the next N days, then the oldest verifiedOn.
import { readFileSync } from "node:fs";
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? +process.argv[i + 1] : d; };
const DAYS = arg("--days", 21), MAX = arg("--max", 60);
const markets = JSON.parse(readFileSync(new URL("../data/markets.json", import.meta.url), "utf8"));
const today = new Date().toISOString().slice(0, 10);
const horizon = new Date(Date.now() + DAYS * 864e5).toISOString().slice(0, 10);
const soon = m => (m.start >= today && m.start <= horizon) || (m.events || []).some(e => e.date >= today && e.date <= horizon);
const live = markets.filter(m => m.end >= today);
const score = m => (m.confidence === "projected" ? 100 : 0) + (soon(m) ? 50 : 0) + (m.detail ? 10 : 0) - (m.driveMin / 30) + (m.verifiedOn ? 0 : 5);
const out = live.sort((a, b) => score(b) - score(a)).slice(0, MAX).map(m => ({
  id: m.id, name: m.name, city: m.city, start: m.start, end: m.end, days: m.days || null, confidence: m.confidence,
  driveMin: m.driveMin, verifiedOn: m.verifiedOn || null, source: m.source,
  upcomingEvents: (m.events || []).filter(e => e.date >= today && e.date <= horizon).map(e => `${e.date} ${e.time || ""} ${e.title}`.trim())
}));
console.log(JSON.stringify({ today, horizon, liveMarkets: live.length, toCheck: out }, null, 1));
