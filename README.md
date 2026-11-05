# WoW Forever Tips

A tiny static site with community-sourced leveling / first-run tips for WoW Forever
(launch: Nov 4, 2026 3:00 PM PST = Nov 5, 00:00 Brussels time).

No build step. Open `index.html` directly, or serve the folder:

    python3 -m http.server 8000   # then open http://localhost:8000

Host it anywhere static (GitHub Pages, Netlify drop, Cloudflare Pages).

## Files
- `index.html` – page layout
- `submit.html` – no-account tip form
- `style.css` – shared base and submission form styles
- `app.css` – home layout, gaming database theme, responsive cards and code snippets
- `tip-store.js` – search, filters, browser bookmarks and approved CSV loading
- `app.js` – navigation, tip card components, detail rendering and copy buttons
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
  more: [ { url: "https://...", type: "YouTube", name: "Another source" } ],
                                 // optional: extra sources for a tip that several places mention
  image: "assets/example.svg",   // facultatif : fichier local ou URL http(s)
  imageMobile: "assets/example-mobile.svg", // facultatif : version plus étroite
  imageAlt: "Ce que l'image explique" // facultatif : information utile visible
},
```

The page shows `summary` (or `title`) as the one-line takeaway and keeps `text` behind a disclosure. “Ma liste” checks are stored in this browser only (`localStorage`), not in the file.
In `text`, fenced code blocks (three backticks), inline backticks, and lines beginning with macro commands such as `/cast` get a copy button. The renderer creates DOM text nodes instead of interpreting submitted HTML.

Le champ `image` est facultatif. Un chemin local (`assets/…`) ou une URL `http`/`https` s'affiche dans le détail de l'astuce ; un clic l'ouvre en grand. `imageMobile` sert sous 700 px. Si l'image porte une information, répète-la dans `text` et remplis `imageAlt`. Une image seulement décorative peut omettre `imageAlt`.

Remember the comma between blocks. Always link where you found the tip.
New category? Add it to `window.CATEGORIES` at the bottom of `tips.js`.
`short` est le libellé court de la nav ; `label` est le titre de section, en français. Les valeurs envoyées au formulaire Google restent les chaînes anglaises de `community.js` — il ne faut pas les traduire, la feuille et le CSV sont en anglais.

## Proposer une astuce
Ouvre **Proposer une astuce** (`submit.html`). Pas de compte. Le formulaire part vers un Google Form. Une astuce n'apparaît sur le site qu'une fois approuvée.

L'approbation se fait dans la feuille : <https://docs.google.com/spreadsheets/d/1_pIif9WGzURLXSXnn9RDIVFEu5mqf0xbpvuo8Ijq_ic/edit>

Tape `yes` dans la colonne **Approved** (actuellement colonne I). `y`, `true`, `x` et `1` comptent aussi. Le site lit le CSV publié et ajoute ces lignes à la liste. Google peut mettre quelques minutes à republier le CSV. Si le CSV ne charge pas, les astuces de `tips.js` s'affichent quand même. Les astuces de la communauté restent dans la langue où elles ont été écrites. Les catégories du formulaire doivent rester exactement : `Before launch / settings & UI`, `Race & class picks`, `Leveling route & questing`, `Professions & gold`, `Group play & dungeons`, `Addons`, `Mistakes to avoid`.

## Images

Les astuces de `tips.js` acceptent un champ facultatif `image` (voir plus haut). Les astuces proposées via le formulaire peuvent aussi en avoir une.

**Ajouter une image** sur `submit.html` est facultatif : fichier, glisser-déposer ou collage. Le navigateur refuse ce qui n'est pas une image et ce qui dépasse 10 Mo. Une image plus large que 1600 px est réduite en JPEG (qualité 0,85) avant l'envoi. Le fichier part vers ImgBB, puis l'URL obtenue est écrite dans la question facultative **Image** du Google Form. La clé ImgBB et les identifiants de champs sont regroupés dans `community.js`.

Le CSV publié est lu **par nom de colonne** (casse ignorée, espaces retirés), pas par position. La colonne **Image** fournit l'adresse ; seules les URL `http` et `https` sont gardées. **Approved** reste la colonne d'approbation (actuellement la colonne I, après la colonne vide « Column 6 »). L'image est publique dès l'envoi vers ImgBB, avant l'approbation de l'astuce.

Le CSV public est celui de l'onglet **Approved only**. L'onglet **Form Responses 1** reste privé ; ne le publie pas.
