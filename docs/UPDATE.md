# Weekly data refresh

Run this every week from November to early January. It keeps dates, events and cancellations current, then redeploys. Budget: about 15 web searches and 60 page fetches. Prefer fetching the `source` URL and the organizer's own site over searching.

## 0. Season check
If today is after 2027-01-10, the season is over. Make no changes; report "Season over, nothing updated" and stop.

## 1. Pick what to check
```
node scripts/verify-list.mjs --days 21 --max 60
```
Work through `toCheck` in order, all `projected` entries first. For each market:
- **Dates:** fetch `source` and the official site, then confirm start, end, closures and `days`. Also look for any cancellation notice.
- **Upcoming events:** for markets with events in the next 21 days, or that open in the next 21 days, confirm event dates and times, and add newly announced special events (parades, light shows, Saint Nicholas, late nights, nativity, fireworks).
- **Hours:** fill `hoursWeek` if it's null and the organizer has now published hours.

## 2. Edit `data/markets.json`
- Edit with a short Python or Node script that loads, changes and writes the JSON, so you don't hand-edit 400 KB.
- **New official 2026 dates:** update `start`, `end`, `closed` and `days`, set `confidence` to `"confirmed"` and `source` to that URL, set `verifiedOn` to today, and set `dateNote` to `"Dates corrected on <D Mon>"` or `"Dates confirmed on <D Mon>"`.
- **Cancelled markets:** remove them.
- **Re-checked markets with no change:** update `verifiedOn` only.
- **Never downgrade** a `confirmed` market to `projected` because a page didn't load.
- **Stable `id`s:** don't change them.
- Set `data/meta.json` `checked` to today's date in the form `"11 Nov 2026"`.

## 3. Build and check
```
node scripts/build.mjs
node scripts/build.mjs --artifact
```
Both must pass. If validation fails, fix the data; don't weaken the validator.

## 4. Record and publish
1. **Changelog:** add a dated section at the top of `data/CHANGELOG.md`. List corrected dates (old to new), newly confirmed markets, cancellations, added events, and what you couldn't verify.
2. **Git:** commit `public/`, `data/` and the changelog to `main` with the message `Weekly data refresh YYYY-MM-DD`, then push. Vercel redeploys automatically. If the push is refused, say so plainly in the report and continue with step 3.
3. **claude.ai artifact:** republish slug `5788d9b5-5dca-434a-af3e-4b3f5bd7154a` with `dist/artifact.html` as `index.html`, using `publish_files` in patch mode with `base_version` from `get_artifact`.
4. **Vercel:** if Vercel has no project for the repo yet, create it with `create_git_project` (repo `ndubaz/ChristmasMarket26`, team `team_O5dGajZMxTjDlfCmwOIKjT5w`).

## 5. Report
Send Nick a short message:
- how many markets you checked
- date corrections (market: old to new)
- cancellations
- newly confirmed markets
- notable new events in the next two weeks
- anything that failed (push, deploy, unreachable sites)

Keep it to the facts, with no padding.
