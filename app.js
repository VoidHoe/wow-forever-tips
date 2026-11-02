(function () {
  "use strict";

  var STORE = "wowft-known-v1";
  var tips = window.TIPS || [];
  var cats = window.CATEGORIES || {};
  var state = { q: "", qRaw: "", cat: "all", hideKnown: false, savedOnly: false, expandAll: false };
  var known = loadKnown();

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
    mistakes: '<path d="M12 4l8 14H4z"/><path d="M12 10v4M12 16.5h.01"/>'
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
  function iconEl(name) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("class", "ico");
    svg.innerHTML = ICONS[name] || ICONS.all;
    return svg;
  }
  function fold(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae");
  }
  function catName(key, full) {
    var c = cats[key];
    if (!c) return key;
    return (full ? c.label : (c.short || c.label));
  }
  function takeaway(t) { return t.summary || t.title; }
  function haystack(t) {
    var more = (t.more || []).map(function (x) { return (x && (x.name || "")) + " " + (x && x.type || ""); }).join(" ");
    return [
      t.title, t.summary || "", t.text, t.id,
      t.source && t.source.name, t.source && t.source.type, more,
      t.by || "", t.community ? "community communauté" : "",
      catName(t.cat, true), catName(t.cat, false)
    ].join(" ");
  }
  function queryMatch(t) {
    if (!state.q) return true;
    var hay = fold(haystack(t));
    return state.q.split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) !== -1; });
  }
  function rowMatch(t, catMode) {
    if (catMode === "must" && !t.must) return false;
    if (catMode === "saved" && !known[t.id]) return false;
    if (catMode !== "all" && catMode !== "must" && catMode !== "saved" && t.cat !== catMode) return false;
    if (state.hideKnown && known[t.id]) return false;
    if (state.savedOnly && !known[t.id]) return false;
    return queryMatch(t);
  }
  function countFor(key) {
    return tips.filter(function (t) { return rowMatch(t, key); }).length;
  }
  function loadKnown() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORE) || "{}");
      return raw && typeof raw === "object" ? raw : {};
    } catch (e) { return {}; }
  }
  function saveKnown() {
    try { localStorage.setItem(STORE, JSON.stringify(known)); } catch (e) {}
  }
  function mustStats() {
    var all = tips.filter(function (t) { return t.must; });
    var n = all.filter(function (t) { return known[t.id]; }).length;
    return { n: n, total: all.length };
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
    if (t.by) badges.appendChild(el("span", "byline", "par " + t.by));
    sum.appendChild(badges);
    sum.appendChild(el("span", "chev"));
    summary.appendChild(sum);
    details.appendChild(summary);

    var detail = el("div", "detail");
    detail.appendChild(el("p", "text", t.text));
    if (t.image) {
      var img = el("img", "tip-image");
      img.src = t.image;
      img.alt = "";
      img.loading = "lazy";
      detail.appendChild(img);
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
    var knownN = Object.keys(known).length;
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

  function absorbCommunity(extra) {
    if (!extra || !extra.length) return;
    var seen = {};
    tips.forEach(function (t) { if (t.id) seen[t.id] = 1; });
    var added = false;
    extra.forEach(function (t) {
      if (!t || !t.id || seen[t.id]) return;
      seen[t.id] = 1;
      tips.push(t);
      added = true;
    });
    if (added) render();
  }

  function loadCommunity() {
    if (!window.COMMUNITY || typeof fetch !== "function") return;
    var url = window.COMMUNITY_CSV_URL || window.COMMUNITY.csvUrl;
    if (!url) return;
    fetch(url).then(function (res) {
      if (!res || !res.ok) throw new Error("csv");
      return res.text();
    }).then(function (text) {
      absorbCommunity(window.COMMUNITY.rowsToTips(text, tips));
    }).catch(function () {});
  }

  render();
  loadCommunity();
})();
