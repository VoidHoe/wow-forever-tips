# WoW Forever Tips

A tiny static site with community-sourced leveling / first-run tips for WoW Forever
(launch: Nov 4, 2026 3:00 PM PST = Nov 5, 00:00 Brussels time).

No build step. Open `index.html` directly, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

Host it anywhere static (GitHub Pages, Netlify drop, Cloudflare Pages).

## Files
- `index.html` – page layout
- `style.css` – dark/gold theme
- `app.js` – countdown, search, category nav, collapsed tips, “known” checks
- `tips.js` – **all the tips** (edit this one)

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
Optional `short` on a category is the compact nav label; `label` is the section heading.
