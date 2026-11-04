# Mulled Miles (Christmas Markets 2026 tracker)

Nick's phone-first web app for Christmas markets within a 5-hour drive of Hoensbroek, NL (next to Heerlen). It covers 249 markets in NL, BE, DE (NRW in depth), LU and FR. Nick and his wife use it on their phones to pick weekend trips. Function comes first, and readability matters: the dark theme is kept at 7:1 contrast for body text.

## What lives where

- `data/markets.json` is the single source of truth. All research results go here.
- `src/index.template.html` is the whole app: HTML, CSS and vanilla JS. It has no framework and no npm dependencies.
- `scripts/build.mjs` validates the data and builds `public/index.html` + `public/sw.js` (Vercel). With `--artifact`, it builds `dist/artifact.html` (claude.ai artifact, single file).
- `scripts/verify-list.mjs` prints the markets most in need of re-checking: projected dates, markets opening soon, upcoming events.
- `docs/UPDATE.md` is the weekly refresh procedure. Follow it exactly for scheduled runs.
- `data/CHANGELOG.md` records data changes, newest first.
- `vercel.json` sets the build (`node scripts/build.mjs`), the output directory (`public`) and cache headers.

## Commands

```
node scripts/build.mjs              # build the Vercel site (run after every data edit; it fails on bad data)
node scripts/build.mjs --artifact   # build the claude.ai artifact version
node scripts/verify-list.mjs --days 21 --max 60
npx serve public                    # local preview
```

## Deployment

- **GitHub:** `ndubaz/ChristmasMarket26`, branch `main`. Vercel auto-deploys every push to `main`.
- **Vercel:** Hobby account `ndubaz-5533`, team id `team_O5dGajZMxTjDlfCmwOIKjT5w`. If no project is linked to the repo yet, link it with the Vercel MCP `create_git_project` (repo `ndubaz/ChristmasMarket26`).
- **claude.ai artifact:** slug `5788d9b5-5dca-434a-af3e-4b3f5bd7154a` (https://claude.ai/artifact/BovxLdyaqPY92iZizkdYD7). It has the `downloads` capability declared, which the PDF export needs. To republish, build with `--artifact`, then call `publish_files` with `dist/artifact.html` as `index.html` and `base_version` taken from `get_artifact`. Don't change its title or capabilities.

## Data schema (`data/markets.json`)

Each market has these fields:

- **Required:** `id` (unique slug), `name`, `short` (22 characters or fewer, used in calendar cells), `city`, `country` (NL|BE|DE|LU|FR), `region` (German state, Dutch province, Flanders/Wallonia/Brussels, or French region), `lat`, `lng`, `driveMin` (from Hoensbroek, 300 or less), `start`, `end` (YYYY-MM-DD), `rep` (1-5 editorial reputation), `repBasis`, `tip`, `confidence` (`confirmed` = 2026 dates from an organizer, city or official tourism page; otherwise `projected`) and `source` (URL for the dates).
- **Size:** `stalls` and `visitors` (null when unknown), `visitorsYear`, and `sizeEst` (0-1, used only when both stalls and visitors are null).
- **Opening days:** `closed` lists full-day closures within start..end. `days` is used only for markets not open every day and lists every open date; when it's present, start and end must equal its first and last dates. `closedNote` is short text.
- **Detail fields:** `detail: true` marks markets with full research. Then:
  - `hoursWeek` is `{mon..sun: "11:00-21:00" | "closed"}`.
  - `hoursExceptions` is `[{date, hours}]`.
  - `events` is `[{date, time, title, type, ticket, note}]`. `type` is one of parade, lights, fireworks, opening, nicholas, krampus, nativity, latenight, concert, tradition, other. `ticket` is free, ticketed or book ahead.
  - `highlights`, `parking`, `train`, `lez`, `costs {gluehwein, deposit, cash}`, `specialties[]`, `tags[]`, `crowds` and `verifiedOn`.
- **Correction notes:** `dateNote` is shown on the detail page when dates were corrected or newly confirmed.

The page computes rank and score at load: size gives 60 points (from visitors, stalls or sizeEst) and reputation gives 40. Don't store ranks.

## Rules for editing data

- Never invent facts. Use null when unknown. Prefer official organizer or city pages; aggregators (festivalsindeutschland.de, info-lux.com, reischeck.nl and the like) have been wrong before. Liège, for example, has had three different date sets.
- Only set `confidence: "confirmed"` from an official source for 2026.
- A cancelled market is removed from `markets.json`, and the removal is noted in `data/CHANGELOG.md`.
- Keep `id`s stable: users' saved plans reference them.
- Run the build after every edit. It must pass before you commit.

## Rules for code changes

- Mobile-first. Nothing may scroll sideways at 390 px width, except the timeline container. Tap targets are 44 px or larger.
- Keep working features intact: plan storage (`localStorage` keys `xm3-plan`, `xm3-drive`, `xm3-big`), PDF export, hash routing (`#home`, `#browse`, `#calendar`, `#map`, `#plan`, `#m-<id>`) and offline support.
- The theme is dark only. Keep body text at 7:1 contrast or better. The single accent is candle amber `--acc`, and `--ev` (coral) means special events. Fonts are Gloock (display) and Atkinson Hyperlegible (body).
- UI copy: plain English, active voice, no em dashes inside sentences.
- Commits end with the attribution lines Claude Code provides.
