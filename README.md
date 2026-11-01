# WoW Forever Tips

A tiny static site with community-sourced leveling / first-run tips for WoW Forever
(launch: Nov 4, 2026 3:00 PM PST = Nov 5, 00:00 Brussels time).

No build step. Open `index.html` directly, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

Host it anywhere static (GitHub Pages, Netlify drop, Cloudflare Pages).

## Files
- `index.html` – page layout
- `style.css` – dark/gold theme
- `app.js` – countdown, search, category filter, card rendering
- `tips.js` – **all the tips** (edit this one)

## Adding a tip
Open `tips.js`, copy any `{ ... }` block in `window.TIPS`, paste it, and edit:

```js
{ id: "my-new-tip",              // unique
  cat: "leveling",               // before | race | leveling | professions | group | addons | mistakes
  title: "Short punchy title",
  text: "One to three sentences explaining the tip.",
  source: { url: "https://...", type: "Reddit", name: "r/wowforever – thread title" },
                                 // type: Reddit | YouTube | X | Guide | Blizzard | Forum
  badge: "beta",                 // optional: "beta" (may change) or "classic" (Classic-era wisdom)
  must: true,                    // optional: shows the ★ Must know star
  more: [ { url: "https://...", type: "YouTube", name: "Another source" } ]
                                 // optional: extra sources for a tip that several places mention
},
```

Remember the comma between blocks. Always link where you found the tip.
New category? Add it to `window.CATEGORIES` at the bottom of `tips.js`.
