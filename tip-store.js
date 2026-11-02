(function (root) {
  "use strict";

  // Data and browser state stay independent from DOM rendering.
  function create(tips, categories, community) {
    var STORE = "wowft-known-v1";
    var state = { q: "", qRaw: "", cat: "all", hideKnown: false, savedOnly: false, expandAll: false };
    var known = loadKnown();

    function fold(value) {
      return String(value || "").toLowerCase().normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae");
    }
    function catName(key, full) {
      var cat = categories[key];
      return cat ? (full ? cat.label : (cat.short || cat.label)) : key;
    }
    function takeaway(tip) { return tip.summary || tip.title; }
    function haystack(tip) {
      var more = (tip.more || []).map(function (source) {
        return (source && source.name || "") + " " + (source && source.type || "");
      }).join(" ");
      return [tip.title, tip.summary || "", tip.text, tip.id,
        tip.source && tip.source.name, tip.source && tip.source.type, more,
        tip.by || "", tip.community ? "community communauté" : "",
        catName(tip.cat, true), catName(tip.cat, false)].join(" ");
    }
    function queryMatch(tip) {
      if (!state.q) return true;
      var words = state.q.split(/\s+/).filter(Boolean);
      var text = fold(haystack(tip));
      return words.every(function (word) { return text.indexOf(word) !== -1; });
    }
    function rowMatch(tip, category) {
      if (category === "must" && !tip.must) return false;
      if (category === "saved" && !known[tip.id]) return false;
      if (category !== "all" && category !== "must" && category !== "saved" && tip.cat !== category) return false;
      if (state.hideKnown && known[tip.id]) return false;
      if (state.savedOnly && !known[tip.id]) return false;
      return queryMatch(tip);
    }
    function countFor(category) {
      return tips.filter(function (tip) { return rowMatch(tip, category); }).length;
    }
    function loadKnown() {
      try {
        var stored = JSON.parse(root.localStorage.getItem(STORE) || "{}");
        return stored && typeof stored === "object" ? stored : {};
      } catch (error) { return {}; }
    }
    function saveKnown() {
      try { root.localStorage.setItem(STORE, JSON.stringify(known)); } catch (error) {}
    }
    function mustStats() {
      var essentials = tips.filter(function (tip) { return tip.must; });
      return { n: essentials.filter(function (tip) { return known[tip.id]; }).length, total: essentials.length };
    }
    function savedCount() {
      return tips.filter(function (tip) { return known[tip.id]; }).length;
    }
    function absorbCommunity(extra) {
      if (!extra || !extra.length) return false;
      var seen = {};
      tips.forEach(function (tip) { if (tip.id) seen[tip.id] = true; });
      var added = false;
      extra.forEach(function (tip) {
        if (!tip || !tip.id || seen[tip.id]) return;
        seen[tip.id] = true;
        tips.push(tip);
        added = true;
      });
      return added;
    }
    function loadCommunity(onUpdate) {
      if (!community || typeof root.fetch !== "function") return;
      var url = root.COMMUNITY_CSV_URL || community.csvUrl;
      if (!url) return;
      root.fetch(url).then(function (response) {
        if (!response.ok) throw new Error("csv");
        return response.text();
      }).then(function (csv) {
        if (absorbCommunity(community.rowsToTips(csv, tips))) onUpdate();
      }).catch(function () {});
    }

    return { tips: tips, cats: categories, state: state, known: known,
      fold: fold, catName: catName, takeaway: takeaway, rowMatch: rowMatch,
      countFor: countFor, saveKnown: saveKnown, mustStats: mustStats,
      savedCount: savedCount, loadCommunity: loadCommunity };
  }

  root.TipStore = { create: create };
})(window);
