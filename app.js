(function () {
  "use strict";

  var store = window.TipStore.create(window.TIPS || [], window.CATEGORIES || {}, window.COMMUNITY);
  var tips = store.tips;
  var cats = store.cats;
  var state = store.state;
  var known = store.known;
  var fold = store.fold;
  var catName = store.catName;
  var takeaway = store.takeaway;
  var rowMatch = store.rowMatch;
  var countFor = store.countFor;
  var saveKnown = store.saveKnown;
  var mustStats = store.mustStats;

  var HINTS = {
    before: "Client, réglages et noms — avant de poireauter dans la file.",
    race: "Quoi roll, et les surprises de spec du début.",
    leveling: "Routes, XP reposé, et comment se passent les premières heures.",
    professions: "Où est l'or du début, et quoi apprendre.",
    group: "Donjons, duos, et comment arriver à l'entrée.",
    addons: "Ce que le jeu a déjà, et ce qui vaut le coup d'ajouter.",
    mistakes: "Les morts et les gouffres à or que tu peux éviter."
  };

  var ICONS = {
    all: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
    must: '<path d="M12 3.2l2.1 4.4 4.8.7-3.5 3.4.8 4.8L12 14.8 7.8 16.5l.8-4.8L5.1 8.3l4.8-.7z"/>',
    before: '<circle cx="12" cy="12" r="8"/><path d="M12 8v5l3 2"/>',
    race: '<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
    leveling: '<path d="M4 7l5 2.5L14 7l6 2.5V18l-6-2.5L9 18l-5-2.5z"/><path d="M9 9.5V18M14 7v8.5"/>',
    professions: '<path d="M12 3v18"/><path d="M16 7H9.5a3.5 3.5 0 000 7H14a3.5 3.5 0 010 7H7"/>',
    group: '<path d="M16 19.5v-1.2a3 3 0 00-3-3H7a3 3 0 00-3 3v1.2"/><circle cx="10" cy="8" r="2.6"/><path d="M20 19.5v-1a2.6 2.6 0 00-2-2.5"/><circle cx="17" cy="8.2" r="2"/>',
    addons: '<path d="M9 4h5l1 2h3a1 1 0 011 1v11a1 1 0 01-1 1H6a1 1 0 01-1-1V7a1 1 0 011-1h3z"/><path d="M9 12h6M9 16h4"/>',
    mistakes: '<path d="M12 4l8 14H4z"/><path d="M12 10v4M12 16.5h.01"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="9" cy="10" r="1.4"/><path d="M20 16l-4.2-3.4a1 1 0 00-1.3.05L8 18"/>'
  };

  function setText(id, text) {
    var n = document.getElementById(id);
    if (n) n.textContent = text;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function appendLinkedText(p, text) {
    var value = String(text || "");
    var urls = /https?:\/\/[^\s<>"']+/gi;
    var end = 0;
    var match;
    while ((match = urls.exec(value))) {
      var url = match[0].replace(/[.,;:!?]+$/, "");
      // Keep balanced parentheses within URLs, but leave surrounding ones as text.
      while (url.endsWith(")") && (url.match(/\)/g) || []).length > (url.match(/\(/g) || []).length) {
        url = url.slice(0, -1);
      }
      var parsed;
      try { parsed = new URL(url); } catch (_) { continue; }
      p.appendChild(document.createTextNode(value.slice(end, match.index)));
      var host = parsed.hostname.replace(/^www\./, "");
      var label = host === "curseforge.com" ? "Voir sur CurseForge" : "Ouvrir le lien · " + host;
      var a = el("a", "tip-link-button", label);
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = url;
      a.appendChild(el("span", "sr", " (s’ouvre dans un nouvel onglet)"));
      p.appendChild(a);
      end = match.index + url.length;
    }
    p.appendChild(document.createTextNode(value.slice(end)));
  }
  function iconEl(name) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "ico");
    svg.innerHTML = ICONS[name] || ICONS.all;
    return svg;
  }
  // ---- nav (built once so a search doesn't reset the scroll position) ----
  var nav = document.getElementById("nav");
  var navButtons = {};
  var filterToggle = document.getElementById("filterToggle");
  var filterPanel = document.getElementById("filterPanel");
  function setFiltersOpen(open) {
    filterToggle.setAttribute("aria-expanded", String(open));
    filterPanel.classList.toggle("is-open", open);
  }
  filterToggle.addEventListener("click", function () {
    setFiltersOpen(filterToggle.getAttribute("aria-expanded") !== "true");
  });
  function selectCategory(key) {
    state.cat = key === "saved" ? "all" : key;
    state.savedOnly = key === "saved";
    render();
    setFiltersOpen(false);
    if (window.matchMedia("(max-width: 959px)").matches) {
      var main = document.getElementById("tips");
      var side = document.querySelector(".side");
      main.style.scrollMarginTop = ((side ? side.offsetHeight : 0) + 8) + "px";
      main.scrollIntoView({ block: "start" });
    }
  }
  function addNavButton(key, label) {
    var b = document.createElement("button");
    b.type = "button";
    b.appendChild(iconEl(key));
    b.appendChild(el("span", "lab", label));
    b.appendChild(el("span", "n", ""));
    b.setAttribute("aria-pressed", "false");
    b.addEventListener("click", function () { selectCategory(key); });
    nav.appendChild(b);
    navButtons[key] = b;
  }
  addNavButton("all", "Tout");
  addNavButton("must", "À savoir");
  addNavButton("saved", "Ma liste");
  var orderLabel = el("div", "nav-label", "Dans l'ordre");
  nav.appendChild(orderLabel);
  Object.keys(cats).forEach(function (k) { addNavButton(k, catName(k, false)); });

  function updateNav() {
    var filtersActive = state.cat !== "all" || state.hideKnown || state.savedOnly;
    filterToggle.classList.toggle("has-active", filtersActive);
    filterToggle.setAttribute("aria-label", filtersActive ? "Filtres actifs" : "Filtres");
    var anyCat = false;
    Object.keys(navButtons).forEach(function (key) {
      var b = navButtons[key];
      var n = countFor(key);
      b.setAttribute("aria-pressed", (key === "saved" ? state.savedOnly : !state.savedOnly && state.cat === key) ? "true" : "false");
      b.querySelector(".n").textContent = String(n);
      var keep = key === "all" || key === "saved" || state.cat === key || n > 0;
      b.hidden = !keep;
      if (keep && key !== "all" && key !== "must" && key !== "saved") anyCat = true;
    });
    if (orderLabel) orderLabel.hidden = !anyCat;
  }

  function safeTipImage(value) {
    var api = window.COMMUNITY;
    if (!api || typeof api.safeImageSrc !== "function") return "";
    return api.safeImageSrc(value);
  }

  var lightbox = el("div", "lightbox");
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Image en grand");
  var lightboxClose = el("button", "lightbox-close", "Fermer");
  lightboxClose.type = "button";
  lightboxClose.setAttribute("aria-label", "Fermer l'image");
  var lightboxImg = document.createElement("img");
  lightboxImg.className = "lightbox-img";
  lightboxImg.alt = "";
  lightbox.appendChild(lightboxClose);
  lightbox.appendChild(lightboxImg);
  document.body.appendChild(lightbox);
  var lightboxReturn = null;

  function closeLightbox() {
    if (lightbox.hidden) return;
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";
    document.body.classList.remove("has-lightbox");
    var back = lightboxReturn;
    lightboxReturn = null;
    if (back && back.focus) back.focus();
  }
  function openLightbox(src, alt, returnEl) {
    if (!src) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "Image de l'astuce";
    lightbox.hidden = false;
    document.body.classList.add("has-lightbox");
    lightboxReturn = returnEl || document.activeElement;
    lightboxClose.focus();
  }
  lightbox.addEventListener("click", function () { closeLightbox(); });

  function sourceLink(src) {
    if (!src || !src.url || !/^https?:\/\//i.test(src.url)) return null;
    var li = el("li");
    var a = el("a", "src");
    a.href = src.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    var shownType = !src.type || src.type === "Link" ? "Lien" : src.type;
    a.appendChild(el("span", "stype " + (src.type || "Link"), shownType));
    a.appendChild(document.createTextNode(src.name || src.url));
    a.appendChild(el("span", "sr", " (s'ouvre dans un nouvel onglet)"));
    li.appendChild(a);
    return li;
  }

  // Tip body component: plain text stays plain text; only explicit code is styled.
  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(value);
    var field = el("textarea");
    field.value = value;
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    var copied = document.execCommand("copy");
    field.remove();
    return copied ? Promise.resolve() : Promise.reject(new Error("copy"));
  }
  function copyButton(value, inline) {
    var button = el("button", inline ? "inline-copy" : "code-copy", "Copier");
    button.type = "button";
    button.setAttribute("aria-label", "Copier le code");
    button.addEventListener("click", function () {
      copyText(value).then(function () {
        button.textContent = "Copié";
        button.setAttribute("aria-label", "Code copié");
        setTimeout(function () {
          button.textContent = "Copier";
          button.setAttribute("aria-label", "Copier le code");
        }, 1800);
      }).catch(function () { button.textContent = "Copie impossible"; });
    });
    return button;
  }
  function appendInlineText(parent, value) {
    var pattern = /`([^`\n]+)`/g;
    var start = 0;
    var match;
    while ((match = pattern.exec(value))) {
      appendLinkedText(parent, value.slice(start, match.index));
      var inline = el("span", "inline-snippet");
      inline.appendChild(el("code", "inline-code", match[1]));
      inline.appendChild(copyButton(match[1], true));
      parent.appendChild(inline);
      start = pattern.lastIndex;
    }
    appendLinkedText(parent, value.slice(start));
  }
  function codeBlock(value, label) {
    var block = el("div", "code-block");
    var head = el("div", "code-head");
    head.appendChild(el("span", "code-label", label || "Macro"));
    head.appendChild(copyButton(value, false));
    block.appendChild(head);
    var pre = el("pre");
    pre.appendChild(el("code", null, value));
    block.appendChild(pre);
    return block;
  }
  function tipBody(value) {
    var body = el("div", "tip-body");
    var lines = String(value || "").replace(/\r\n/g, "\n").split("\n");
    var prose = [];
    function flushProse() {
      if (!prose.length) return;
      var p = el("p", "text");
      appendInlineText(p, prose.join("\n"));
      body.appendChild(p);
      prose = [];
    }
    for (var i = 0; i < lines.length; i++) {
      var fence = lines[i].match(/^\s*```([^`]*)\s*$/);
      if (fence) {
        var end = i + 1;
        while (end < lines.length && !/^\s*```\s*$/.test(lines[end])) end++;
        if (end < lines.length) {
          flushProse();
          body.appendChild(codeBlock(lines.slice(i + 1, end).join("\n"), fence[1].trim() || "Macro"));
          i = end;
          continue;
        }
      }
      if (/^\s*\/(?:cast|use|console|run|script|invite|target|focus|stopcasting|startattack|who|pvp)\b/i.test(lines[i])) {
        flushProse();
        var commands = [lines[i]];
        while (i + 1 < lines.length && /^\s*\//.test(lines[i + 1])) commands.push(lines[++i]);
        body.appendChild(codeBlock(commands.join("\n"), "Macro"));
      } else {
        prose.push(lines[i]);
      }
    }
    flushProse();
    return body;
  }

  function card(t, opts) {
    opts = opts || {};
    var article = el("article", "tip" + (t.must ? " is-must" : "") + (known[t.id] ? " is-known" : ""));
    article.id = "tip-" + t.id;
    article.dataset.id = t.id;
    if (t.community) article.dataset.community = "1";

    var meta = el("div", "tip-meta");
    meta.appendChild(el("span", "tip-avatar", (catName(t.cat, false) || "A").charAt(0).toUpperCase()));
    var metaText = el("div", "tip-meta-text");
    metaText.appendChild(el("strong", null, catName(t.cat, true)));
    metaText.appendChild(el("span", null, t.community ? "Conseil de la communauté" : "Astuce sourcée · ouvre pour le détail"));
    meta.appendChild(metaText);
    if (t.must) meta.appendChild(el("span", "tip-meta-star", "✦ Essentiel"));

    var label = el("label", "mark");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!known[t.id];
    input.setAttribute("aria-label", "Ajouter à ma liste : " + takeaway(t));
    var tick = el("span", "tick");
    tick.setAttribute("aria-hidden", "true");
    label.appendChild(input);
    label.appendChild(tick);

    var details = document.createElement("details");
    if (state.expandAll) details.open = true;
    var summary = document.createElement("summary");
    var sum = el("span", "sum");
    sum.appendChild(el("span", "take", takeaway(t)));
    sum.appendChild(el("span", "quick-answer", t.text));
    var badges = el("span", "badges");
    if (opts.showCat) badges.appendChild(el("span", "badge where", catName(t.cat, false)));
    if (t.must && !opts.hideMust) badges.appendChild(el("span", "badge must", "À savoir"));
    if (t.badge === "beta") badges.appendChild(el("span", "badge beta", "Bêta"));
    if (t.badge === "classic") badges.appendChild(el("span", "badge classic", "Ère Classique"));
    if (t.community) badges.appendChild(el("span", "badge community", "Communauté"));
    if (safeTipImage(t.image)) {
      var hint = el("span", "img-hint");
      hint.title = "Image";
      hint.appendChild(iconEl("image"));
      hint.appendChild(el("span", "sr", "Cette astuce contient une image"));
      badges.appendChild(hint);
    }
    if (t.by) badges.appendChild(el("span", "byline", "par " + t.by));
    sum.appendChild(badges);
    sum.appendChild(el("span", "chev"));
    summary.appendChild(sum);
    details.appendChild(summary);

    var detail = el("div", "detail");
    detail.appendChild(tipBody(t.text));
    var imageSrc = safeTipImage(t.image);
    if (imageSrc) {
      var alt = t.imageAlt ? String(t.imageAlt) : "";
      var open = el("button", "tip-image-open");
      open.type = "button";
      open.setAttribute("aria-label", alt ? "Agrandir l'image : " + alt : "Agrandir l'image");
      var picture = el("picture", "tip-picture");
      var mobileSrc = safeTipImage(t.imageMobile);
      if (mobileSrc && mobileSrc.indexOf(",") === -1 && /\s/.test(mobileSrc) === false) {
        var mobile = document.createElement("source");
        mobile.media = "(max-width: 700px)";
        mobile.srcset = mobileSrc;
        picture.appendChild(mobile);
      }
      var img = el("img", "tip-image");
      img.src = imageSrc;
      img.alt = alt;
      img.loading = "lazy";
      img.decoding = "async";
      picture.appendChild(img);
      open.appendChild(picture);
      open.addEventListener("click", function () { openLightbox(imageSrc, alt, open); });
      detail.appendChild(open);
    }
    var list = el("ul", "sources");
    [t.source].concat(t.more || []).forEach(function (src) {
      var item = sourceLink(src);
      if (item) list.appendChild(item);
    });
    if (list.childNodes.length) {
      detail.appendChild(el("h3", "detail-label", "D'où vient cette astuce"));
      detail.appendChild(list);
    }
    details.appendChild(detail);

    input.addEventListener("change", function () {
      if (input.checked) known[t.id] = 1;
      else delete known[t.id];
      saveKnown();
      article.classList.toggle("is-known", !!known[t.id]);
      updateProgress();
      updateCount();
      updateNav();
      if ((state.hideKnown && input.checked) || (state.savedOnly && !input.checked)) render();
    });

    article.appendChild(meta);
    article.appendChild(label);
    article.appendChild(details);
    return article;
  }

  var mustEl = document.getElementById("must");
  var listEl = document.getElementById("list");
  var emptyEl = document.getElementById("empty");

  function updateProgress() {
    var text = document.getElementById("must-progress");
    var bar = document.getElementById("must-meter");
    if (!text || !bar) return;
    var stats = mustStats();
    var pct = stats.total ? Math.round(stats.n / stats.total * 100) : 0;
    bar.style.width = pct + "%";
    text.textContent = stats.n
      ? stats.n + " sur " + stats.total + " cochées dans ce navigateur."
      : "Lis ces " + stats.total + " d'abord. Coche quand c'est dans la tête.";
  }

  function updateCount() {
    var shown = countFor(state.cat);
    var knownN = store.savedCount();
    var text = shown + " sur " + tips.length + " astuces";
    if (knownN === 1) text += " · 1 dans ma liste";
    else if (knownN) text += " · " + knownN + " dans ma liste";
    setText("count", text);
    var reset = document.getElementById("reset");
    var dirty = !!(state.q || state.cat !== "all" || state.hideKnown || state.savedOnly);
    if (reset) reset.hidden = !dirty;
  }

  function render() {
    updateNav();
    var showSpot = state.cat === "all" && !state.q && !state.savedOnly;
    var featuredIds = {};
    mustEl.innerHTML = "";
    mustEl.hidden = true;
    listEl.innerHTML = "";

    var shown = 0;
    if (showSpot) {
      var spotTips = tips.filter(function (t) { return t.must && rowMatch(t, "all"); });
      if (spotTips.length) {
        mustEl.hidden = false;
        var head = el("div", "spot-head");
        var titles = el("div");
        titles.appendChild(el("h2", null, "À savoir"));
        var progress = el("p", null, "");
        progress.id = "must-progress";
        titles.appendChild(progress);
        head.appendChild(titles);
        var meter = el("div", "meter");
        meter.setAttribute("aria-hidden", "true");
        var fill = el("span");
        fill.id = "must-meter";
        meter.appendChild(fill);
        head.appendChild(meter);
        mustEl.appendChild(head);
        var rows = el("div", "rows");
        spotTips.slice(0, 3).forEach(function (t) {
          featuredIds[t.id] = true;
          rows.appendChild(card(t, { showCat: true, hideMust: true }));
        });
        mustEl.appendChild(rows);
        var allMust = el("button", "spot-more", "Voir les " + spotTips.length + " astuces essentielles →");
        allMust.type = "button";
        allMust.addEventListener("click", function () { selectCategory("must"); });
        mustEl.appendChild(allMust);
        shown += spotTips.length;
        updateProgress();
      }
    }

    Object.keys(cats).forEach(function (k) {
      var group = tips.filter(function (t) {
        if (t.cat !== k || !rowMatch(t, state.cat)) return false;
        if (featuredIds[t.id]) return false;
        return true;
      });
      group.sort(function (a, b) {
        var must = (b.must === true) - (a.must === true);
        if (must) return must;
        return (a.community === true) - (b.community === true);
      });
      if (!group.length) return;
      shown += group.length;
      var sec = el("section", "group");
      sec.id = "cat-" + k;
      var h = el("h2");
      h.appendChild(iconEl(k));
      h.appendChild(document.createTextNode(catName(k, true)));
      h.appendChild(el("span", "n", String(group.length)));
      sec.appendChild(h);
      var hint = HINTS[k] || "";
      if (showSpot) {
        var pulled = tips.filter(function (t) { return t.cat === k && featuredIds[t.id]; }).length;
        if (pulled) hint += (hint ? " " : "") + (pulled === 1 ? "1 astuce à savoir est déjà au-dessus." : pulled + " astuces à savoir sont déjà au-dessus.");
      }
      if (hint) sec.appendChild(el("p", "hint", hint));
      var rows = el("div", "rows");
      group.forEach(function (t) { rows.appendChild(card(t, {})); });
      sec.appendChild(rows);
      listEl.appendChild(sec);
    });

    updateCount();
    var none = shown === 0;
    emptyEl.hidden = !none;
    if (none) {
      setText("empty-text", state.savedOnly ? "Ta liste est vide. Coche une astuce pour la retrouver ici." : state.qRaw ? "Aucune astuce pour « " + state.qRaw + " »." : "Aucune astuce avec ces filtres.");
    }
  }

  document.getElementById("search").addEventListener("input", function (e) {
    state.qRaw = e.target.value.trim();
    state.q = fold(state.qRaw);
    render();
    if (state.q) setFiltersOpen(false);
  });
  document.getElementById("search-form").addEventListener("submit", function (e) { e.preventDefault(); });
  document.getElementById("hideKnown").addEventListener("change", function (e) {
    state.hideKnown = e.target.checked;
    render();
  });
  document.getElementById("expandAll").addEventListener("click", function () {
    state.expandAll = !state.expandAll;
    this.setAttribute("aria-pressed", state.expandAll ? "true" : "false");
    this.textContent = state.expandAll ? "Tout replier" : "Tout ouvrir";
    render();
  });
  function resetFilters() {
    state.q = "";
    state.qRaw = "";
    state.cat = "all";
    state.hideKnown = false;
    state.savedOnly = false;
    var search = document.getElementById("search");
    var hide = document.getElementById("hideKnown");
    if (search) search.value = "";
    if (hide) hide.checked = false;
    render();
    if (search) search.focus();
  }
  document.getElementById("reset").addEventListener("click", resetFilters);
  document.getElementById("clear").addEventListener("click", resetFilters);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !lightbox.hidden) {
      e.preventDefault();
      closeLightbox();
      return;
    }
    var tag = document.activeElement && document.activeElement.tagName;
    if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      var search = document.getElementById("search");
      var before = search.value;
      search.focus();
      setTimeout(function () {
        if (search.value === before + "/") {
          search.value = before;
          state.qRaw = before.trim();
          state.q = fold(state.qRaw);
          render();
        }
      }, 0);
    }
    if (e.key === "Escape" && tag === "INPUT") {
      if (state.q) resetFilters();
    }
  });

  render();
  store.loadCommunity(render);
})();
