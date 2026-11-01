(function () {
  "use strict";
  var LAUNCH = new Date("2026-11-04T23:00:00Z"); // Nov 4 3:00 PM PST = Nov 5 00:00 Brussels
  var TZ = "Europe/Brussels";
  var tips = window.TIPS || [], cats = window.CATEGORIES || {};
  var state = { q: "", cat: "all", must: false };

  // ---- countdown ----
  var fmt = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  document.getElementById("launch-local").textContent = fmt.format(LAUNCH) + " Brussels time (Nov 4, 3:00 PM PST)";
  function pad(n) { return String(n).padStart(2, "0"); }
  function tick() {
    var ms = LAUNCH - Date.now();
    if (ms <= 0) {
      document.querySelector(".cd-grid").outerHTML = '<div class="live">⚔️ Servers are live – go level!</div>';
      return;
    }
    var s = Math.floor(ms / 1000);
    document.getElementById("cd-d").textContent = Math.floor(s / 86400);
    document.getElementById("cd-h").textContent = pad(Math.floor(s % 86400 / 3600));
    document.getElementById("cd-m").textContent = pad(Math.floor(s % 3600 / 60));
    document.getElementById("cd-s").textContent = pad(s % 60);
    setTimeout(tick, 1000);
  }
  tick();

  // ---- helpers ----
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function matches(t) {
    if (state.cat !== "all" && t.cat !== state.cat) return false;
    if (state.must && !t.must) return false;
    if (!state.q) return true;
    var hay = (t.title + " " + t.text + " " + (t.source && t.source.name || "") + " " + (t.more || []).map(function (x) { return x.name || ""; }).join(" ") + " " + (cats[t.cat] ? cats[t.cat].label : "")).toLowerCase();
    return state.q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
  }

  // ---- chips ----
  var chipsEl = document.getElementById("chips");
  function chip(key, label, n) {
    var b = el("button", "chip" + (state.cat === key ? " active" : ""));
    b.type = "button"; b.dataset.cat = key; b.setAttribute("role", "tab");
    b.textContent = label; b.appendChild(el("span", "n", n));
    b.addEventListener("click", function () { state.cat = key; render(); });
    return b;
  }
  function renderChips() {
    chipsEl.innerHTML = "";
    chipsEl.appendChild(chip("all", "All", tips.length));
    Object.keys(cats).forEach(function (k) {
      var n = tips.filter(function (t) { return t.cat === k; }).length;
      chipsEl.appendChild(chip(k, cats[k].icon + " " + cats[k].label, n));
    });
  }

  // ---- cards ----
  function card(t) {
    var c = el("article", "card" + (t.must ? " must" : ""));
    if (t.must) { var s = el("span", "star", "★"); s.title = "Must know"; c.appendChild(s); }
    c.appendChild(el("h3", null, t.title));
    c.appendChild(el("p", null, t.text));
    var m = el("div", "meta");
    if (t.must) m.appendChild(el("span", "badge mustb", "Must know"));
    if (t.badge === "beta") m.appendChild(el("span", "badge beta", "Beta"));
    if (t.badge === "classic") m.appendChild(el("span", "badge classic", "Classic-era"));
    [t.source].concat(t.more || []).forEach(function (src) {
      if (!src || !src.url) return;
      var a = el("a", "src"); a.href = src.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.appendChild(el("span", "stype " + src.type, src.type));
      a.appendChild(document.createTextNode(src.name || src.url));
      m.appendChild(a);
    });
    c.appendChild(m);
    return c;
  }

  var listEl = document.getElementById("list");
  function render() {
    renderChips();
    listEl.innerHTML = "";
    var shown = 0;
    Object.keys(cats).forEach(function (k) {
      var group = tips.filter(function (t) { return t.cat === k && matches(t); });
      group.sort(function (a, b) { return (b.must ? 1 : 0) - (a.must ? 1 : 0); });
      if (!group.length) return;
      shown += group.length;
      var sec = el("section");
      sec.id = "cat-" + k;
      sec.appendChild(el("h2", "cat-title", cats[k].icon + " " + cats[k].label));
      var g = el("div", "grid");
      group.forEach(function (t) { g.appendChild(card(t)); });
      sec.appendChild(g);
      listEl.appendChild(sec);
    });
    document.getElementById("count").textContent = "Showing " + shown + " of " + tips.length + " tips";
    document.getElementById("empty").hidden = shown !== 0;
  }

  document.getElementById("search").addEventListener("input", function (e) { state.q = e.target.value.trim().toLowerCase(); render(); });
  document.getElementById("mustOnly").addEventListener("change", function (e) { state.must = e.target.checked; render(); });
  render();
})();
