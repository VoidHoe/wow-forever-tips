# WoW Forever Tips

A tiny static site with community-sourced leveling / first-run tips for WoW Forever
(launch: Nov 4, 2026 3:00 PM PST = Nov 5, 00:00 Brussels time).

No build step. Open `index.html` directly, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

Host it anywhere static (GitHub Pages, Netlify drop, Cloudflare Pages).

## Files
- `index.html` – page layout
- `submit.html` – no-account tip form
- `style.css` – dark/gold theme
- `app.js` – countdown, search, category nav, collapsed tips, “known” checks, approved community tips
- `community.js` – form field map, CSV parser, approval filter
- `submit.js` – the submit form
- `tips.js` – **the curated tips** (edit this one)

## Adding a tip
Open `tips.js`, copy any `{ ... }` block in `window.TIPS`, paste it, and edit:

```js
{ id: "my-new-tip",              // unique
  cat: "leveling",               // before | race | leveling | professions | group | addons | mistakes
  title: "Short punchy title",
  summary: "Even shorter one-line takeaway", // optional; shown in the list. Uses title if omitted.
  text: "One to three sentences explaining the tip.",
  source: { url: "https://...", type: "Reddit", name: "r/wowforever – thread title" },
                                 // type: Reddit | YouTube | X | Guide | Blizzard | Forum
  badge: "beta",                 // optional: "beta" (may change) or "classic" (Classic-era wisdom)
  must: true,                    // optional: included in Must know
  more: [ { url: "https://...", type: "YouTube", name: "Another source" } ]
                                 // optional: extra sources for a tip that several places mention
},
```

The page shows `summary` (or `title`) as the one-line takeaway and keeps `text` behind a disclosure. “Known” checks are stored in this browser only (`localStorage`), not in the file.

Remember the comma between blocks. Always link where you found the tip.
New category? Add it to `window.CATEGORIES` at the bottom of `tips.js`.
Optional `short` on a category is the compact nav label; `label` is the section heading. Those labels are also the exact category choices on the submit form (`community.js`).

## Submitting a tip
Open **Submit a tip** (`submit.html`). No account. The form posts to a Google Form. Nothing is public until it is approved.

Approval happens in the sheet: <https://docs.google.com/spreadsheets/d/1_pIif9WGzURLXSXnn9RDIVFEu5mqf0xbpvuo8Ijq_ic/edit>

Type `yes` in the **Approved** column (column G). `y`, `true`, `x`, and `1` also count. The site reads the published CSV and adds those rows to the list. Google can take a few minutes to republish the CSV. If the CSV can't be loaded, the curated tips in `tips.js` still show.
