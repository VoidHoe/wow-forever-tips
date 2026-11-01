/*
  Shared submit + approval config.
  Category labels here are the EXACT Google Form choice strings.
  They must stay in English: the sheet and the form are English.
  French display names live on window.CATEGORIES in tips.js.
*/
(function (root) {
  "use strict";

  var FORM_ID = "1FAIpQLSdEUAgfhalw4qdauGNlIxsKiolpiam7RJ0Um9_lbVU5YkeyaQ";
  var FORM_BASE = "https://docs.google.com/forms/d/e/" + FORM_ID;

  var categories = [
    { id: "before", label: "Before launch / settings & UI" },
    { id: "race", label: "Race & class picks" },
    { id: "leveling", label: "Leveling route & questing" },
    { id: "professions", label: "Professions & gold" },
    { id: "group", label: "Group play & dungeons" },
    { id: "addons", label: "Addons" },
    { id: "mistakes", label: "Mistakes to avoid" }
  ];

  var entries = {
    title: "entry.222267680",
    category: "entry.829806976",
    details: "entry.1557623342",
    source: "entry.465615384",
    name: "entry.1699823806",
    image: "entry.1827524123"
  };

  // shortcut: an exposed unsigned preset can be abused, add a server upload endpoint if abuse appears.
  var imageUpload = { cloudName: "xj5obs3e", uploadPreset: "wowforevertips" };

  function categoryById(id) {
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].id === id) return categories[i];
    }
    return null;
  }

  function categoryByLabel(label) {
    var want = String(label || "").trim();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].label === want) return categories[i];
    }
    return null;
  }

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;
    var s = String(text || "").replace(/^\uFEFF/, "");
    for (var i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (inQuotes) {
        if (c === '"') {
          if (s.charAt(i + 1) === '"') { field += '"'; i++; continue; }
          inQuotes = false;
          continue;
        }
        field += c;
        continue;
      }
      if (c === '"') { inQuotes = true; continue; }
      if (c === ",") { row.push(field); field = ""; continue; }
      if (c === "\r") continue;
      if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; continue; }
      field += c;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (cell) { return String(cell).trim() !== ""; }); });
  }

  function headerIndex(header) {
    var idx = {};
    header.forEach(function (cell, i) {
      idx[String(cell || "").trim().toLowerCase()] = i;
    });
    function find(name) {
      if (idx[name] != null) return idx[name];
      var keys = Object.keys(idx);
      for (var i = 0; i < keys.length; i++) {
        if (keys[i].indexOf(name) === 0) return idx[keys[i]];
      }
      return -1;
    }
    return {
      title: find("tip title"),
      category: find("category"),
      details: find("details"),
      source: find("source link"),
      name: find("your name"),
      image: find("image"),
      approved: find("approved")
    };
  }

  function cell(row, index) {
    if (index < 0 || index >= row.length) return "";
    return String(row[index] || "").trim();
  }

  function isApproved(value) {
    var s = String(value || "").trim().toLowerCase();
    return s === "yes" || s === "y" || s === "true" || s === "x" || s === "1";
  }

  function safeHttpUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(javascript|data|vbscript):/i.test(raw)) return "";
    var withProto = /^https?:\/\//i.test(raw) ? raw : "";
    if (!withProto) return "";
    try {
      var u = new URL(withProto);
      if (u.protocol !== "http:" && u.protocol !== "https:") return "";
      if (!u.hostname || u.hostname.indexOf(".") === -1) return "";
      return u.href;
    } catch (e) {
      return "";
    }
  }

  function sourceFromUrl(url) {
    var host = "";
    try { host = new URL(url).hostname.replace(/^www\./, "").toLowerCase(); } catch (e) { host = ""; }
    var type = "Link";
    if (host === "youtu.be" || host === "youtube.com" || host.slice(-13) === ".youtube.com") type = "YouTube";
    else if (host === "reddit.com" || host.slice(-11) === ".reddit.com") type = "Reddit";
    else if (host === "x.com" || host === "twitter.com" || host.slice(-6) === ".x.com" || host.slice(-12) === ".twitter.com") type = "X";
    var name = host || url;
    return { url: url, type: type, name: name };
  }

  function slug(value) {
    var s = String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return s.slice(0, 42) || "tip";
  }

  function hash(value) {
    var h = 0;
    var s = String(value || "");
    for (var i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function uniqueId(base, seen) {
    var id = base;
    var n = 2;
    while (seen[id]) {
      id = base + "-" + n;
      n++;
      if (n > 100) break;
    }
    seen[id] = 1;
    return id;
  }

  function rowsToTips(csvText, existing) {
    var rows = parseCsv(csvText);
    if (!rows.length) return [];
    var cols = headerIndex(rows[0]);
    if (cols.title < 0 || cols.category < 0 || cols.details < 0 || cols.approved < 0) return [];
    var seen = {};
    (existing || []).forEach(function (t) { if (t && t.id) seen[t.id] = 1; });
    var out = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      if (!isApproved(cell(row, cols.approved))) continue;
      var title = cell(row, cols.title);
      var details = cell(row, cols.details);
      var cat = categoryByLabel(cell(row, cols.category));
      if (!title || !details || !cat) continue;
      var by = cell(row, cols.name);
      var url = safeHttpUrl(cell(row, cols.source));
      var image = safeHttpUrl(cell(row, cols.image));
      var id = uniqueId("c-" + slug(title) + "-" + hash(title + "\n" + details + "\n" + cell(row, 0)), seen);
      var tip = {
        id: id,
        cat: cat.id,
        title: title,
        summary: title,
        text: details,
        community: true
      };
      if (by) tip.by = by;
      if (url) tip.source = sourceFromUrl(url);
      if (image && image.slice(0, 8) === "https://") tip.image = image;
      out.push(tip);
    }
    return out;
  }

  function submitTip(fields, fetchFn) {
    var body = new URLSearchParams();
    body.set(entries.title, fields.title);
    body.set(entries.category, fields.categoryLabel);
    body.set(entries.details, fields.details);
    if (fields.source) body.set(entries.source, fields.source);
    if (fields.name) body.set(entries.name, fields.name);
    if (fields.image) body.set(entries.image, fields.image);
    var fetcher = fetchFn || root.fetch;
    return fetcher(FORM_BASE + "/formResponse", {
      method: "POST",
      mode: "no-cors",
      body: body
    });
  }

  function uploadImage(file, fetchFn) {
    if (!imageUpload.cloudName || !imageUpload.uploadPreset) return Promise.reject(new Error("Image upload is not configured"));
    var body = new FormData();
    body.set("file", file);
    body.set("upload_preset", imageUpload.uploadPreset);
    return (fetchFn || root.fetch)("https://api.cloudinary.com/v1_1/" + encodeURIComponent(imageUpload.cloudName) + "/image/upload", {
      method: "POST",
      body: body
    }).then(function (res) {
      if (!res.ok) throw new Error("Image upload failed");
      return res.json();
    }).then(function (data) {
      var url = safeHttpUrl(data && data.secure_url);
      if (!url || url.indexOf("https://res.cloudinary.com/" + imageUpload.cloudName + "/image/upload/") !== 0) throw new Error("Invalid image URL");
      return url;
    });
  }

  root.COMMUNITY = {
    categories: categories,
    entries: entries,
    imageUpload: imageUpload,
    formView: FORM_BASE + "/viewform",
    formResponse: FORM_BASE + "/formResponse",
    csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwkjMPOnMWkdVyg6Rz1fQ6weZaTTDUMq6S-nuwNrBRRB_wi8iVoZaKSin_LDv4cwNLgE9C0oD1DLVA/pub?gid=278733250&single=true&output=csv",
    sheetUrl: "https://docs.google.com/spreadsheets/d/1_pIif9WGzURLXSXnn9RDIVFEu5mqf0xbpvuo8Ijq_ic/edit",
    categoryById: categoryById,
    categoryByLabel: categoryByLabel,
    parseCsv: parseCsv,
    rowsToTips: rowsToTips,
    submitTip: submitTip,
    uploadImage: uploadImage,
    safeHttpUrl: safeHttpUrl,
    isApproved: isApproved
  };
})(typeof window !== "undefined" ? window : globalThis);
