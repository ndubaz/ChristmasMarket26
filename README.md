# Mulled Miles: Christmas markets 2026 near Hoensbroek

A phone-first web app listing 249 Christmas markets within a 5-hour drive of Hoensbroek (NL, BE, DE, LU, FR). It covers dates, special events, hours, parking, train links, Google Maps links and a personal plan with PDF export. It is a static site with no backend, and it works offline once opened.

Version 3.0. Data checked 4 Nov 2026.

## Layout

```
public/                 What Vercel serves
  index.html            Built app (generated, do not edit by hand)
  sw.js                 Service worker (generated)
  manifest.webmanifest  Home-screen install
  icons/                App icons
  vendor/               jsPDF 2.5.1, served locally
src/
  index.template.html   App source: markup, styles, script
  sw.template.js        Service worker source
data/
  markets.json          All market data (edit this)
  geo.json              Country outlines for the map
  meta.json             "Data checked" date shown in the app
scripts/build.mjs       Builds public/ from src/ + data/ (no dependencies)
vercel.json             Build settings and headers
```

## Update the data

Working in Claude Code? `CLAUDE.md` has the project rules, and `docs/UPDATE.md` is the weekly refresh procedure. By hand:

1. Edit `data/markets.json`. Each market has `id`, `name`, `city`, `country`, `region`, `lat`, `lng`, `driveMin`, `start`, `end`, plus optional `closed`, `days` (explicit open dates for weekend-only or one-day markets), `events`, `hoursWeek`, `parking`, `train`, `lez`, `costs`, `specialties`, `tags`, `confidence` and `source`.
2. Change the date in `data/meta.json` if you re-checked the data.
3. Run `node scripts/build.mjs`. It validates dates and ids and fails loudly on a bad edit.
4. Commit and push. Vercel rebuilds automatically.

Ranks and scores are computed in the browser from `stalls`, `visitors`, `sizeEst` and `rep`. They are not stored in the data.

`node scripts/build.mjs --artifact` builds `dist/artifact.html`, the single-file version for the claude.ai artifact.

## Run locally

```
node scripts/build.mjs
npx serve public
```

## Deploy on Vercel

The repo deploys as-is. `vercel.json` sets the build command (`node scripts/build.mjs`), the output directory (`public`) and cache headers. In Vercel, choose Add New, then Project, import `ndubaz/ChristmasMarket26`, and keep the defaults.

## Notes

- Your plan and text-size setting live in the browser's localStorage on each device. They are not synced between devices.
- Dates marked "projected" come from last year's pattern or third-party listings. Check the official link in each market's page before driving.
- Install on iPhone: open the site in Safari, tap Share, then Add to Home Screen.
