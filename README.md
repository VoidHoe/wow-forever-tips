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
`short` est le libellé court de la nav ; `label` est le titre de section, en français. Les valeurs envoyées au formulaire Google restent les chaînes anglaises de `community.js` — il ne faut pas les traduire, la feuille et le CSV sont en anglais.

## Proposer une astuce
Ouvre **Proposer une astuce** (`submit.html`). Pas de compte. Le formulaire part vers un Google Form. Rien n'est public tant que ce n'est pas approuvé.

L'approbation se fait dans la feuille : <https://docs.google.com/spreadsheets/d/1_pIif9WGzURLXSXnn9RDIVFEu5mqf0xbpvuo8Ijq_ic/edit>

Tape `yes` dans la colonne **Approved** (colonne G). `y`, `true`, `x` et `1` comptent aussi. Le site lit le CSV publié et ajoute ces lignes à la liste. Google peut mettre quelques minutes à republier le CSV. Si le CSV ne charge pas, les astuces de `tips.js` s'affichent quand même. Les astuces de la communauté restent dans la langue où elles ont été écrites. Les catégories du formulaire doivent rester exactement : `Before launch / settings & UI`, `Race & class picks`, `Leveling route & questing`, `Professions & gold`, `Group play & dungeons`, `Addons`, `Mistakes to avoid`.
