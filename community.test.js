const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

const window = {
  fetch() {
    throw new Error("live network blocked");
  }
};
vm.runInNewContext(fs.readFileSync("community.js", "utf8"), { window, URL, URLSearchParams, FormData, Promise });
const C = window.COMMUNITY;

const HEADER = 'Timestamp,Tip title,Category,Details,"Source link (video, Reddit, X...)",Your name,Image,Column 6,Approved';

test("approved rows survive the new header order, including Image and Column 6", () => {
  const csv = HEADER + "\n"
    + "46327.8,Visible sans image,Addons,Juste le texte,https://example.com/guide,Ada,,,yes\n"
    + "46327.9,Visible avec image,Mistakes to avoid,Regarde ça,,Bea,http://cdn.example.com/tip.jpg,,YES\n"
    + '46328,Liste,Addons,"ligne 1\nligne 2",,Cee,https://i.ibb.co/abc/list.png,,y\n'
    + "46328.1,Pas encore,Leveling route & questing,Secret,,Dan,https://cdn.example.com/secret.png,yes,\n"
    + "46328.2,Lien pourri,Addons,Reste le texte,,Eve,javascript:alert(1),,true\n"
    + '46328.3,Data url,Addons,Sans image,,Fay,"data:image/png;base64,aaaa",,x\n';
  const tips = C.rowsToTips(csv, []);
  assert.equal(tips.map((tip) => tip.title).join("\n"), [
    "Visible sans image",
    "Visible avec image",
    "Liste",
    "Lien pourri",
    "Data url"
  ].join("\n"));
  assert.equal(tips[0].image, undefined);
  assert.equal(tips[0].cat, "addons");
  assert.equal(tips[0].by, "Ada");
  assert.equal(tips[0].source.url, "https://example.com/guide");
  assert.equal(tips[1].image, "http://cdn.example.com/tip.jpg");
  assert.equal(tips[1].cat, "mistakes");
  assert.equal(tips[2].image, "https://i.ibb.co/abc/list.png");
  assert.match(tips[2].text, /ligne 1\nligne 2/);
  assert.equal(tips[3].image, undefined);
  assert.equal(tips[4].image, undefined);
  assert.equal(tips.some((tip) => tip.title === "Pas encore"), false);
});

test("columns are matched by header name, not by position", () => {
  const csv = "Approved,Column 6,Image,Your name,Details,Category,Tip title\n"
    + "yes,yes,https://cdn.example.com/z.png,Sam,Body,Addons,Shuffled\n"
    + ",yes,https://cdn.example.com/no.png,Sam,Body,Addons,Hidden\n";
  const tips = C.rowsToTips(csv, []);
  assert.equal(tips.length, 1);
  assert.equal(tips[0].title, "Shuffled");
  assert.equal(tips[0].image, "https://cdn.example.com/z.png");
  assert.notEqual(tips[0].image, "yes");
});

test("headers are trimmed and case-insensitive, and a missing Image column still imports rows", () => {
  const csv = " TIP TITLE , Category ,Details,Approved\n"
    + "Encore là, Addons ,Du texte, yes \n";
  const tips = C.rowsToTips(csv, []);
  assert.equal(tips.length, 1);
  assert.equal(tips[0].title, "Encore là");
  assert.equal(tips[0].image, undefined);
});

test("image sources accept only http(s) or a local asset path", () => {
  assert.equal(C.safeImageSrc("https://i.ibb.co/abc/tip.jpg"), "https://i.ibb.co/abc/tip.jpg");
  assert.equal(C.safeImageSrc("http://cdn.example.com/a.png"), "http://cdn.example.com/a.png");
  assert.equal(C.safeImageSrc("assets/camp-buffs.svg"), "assets/camp-buffs.svg");
  assert.equal(C.safeImageSrc(" javascript:alert(1)"), "");
  assert.equal(C.safeImageSrc("data:image/png;base64,aaaa"), "");
  assert.equal(C.safeImageSrc("//cdn.example.com/a.png"), "");
  assert.equal(C.safeImageSrc("../secret.png"), "");
});

test("wide images are scaled to 1600px wide", () => {
  assert.equal(C.imageMaxWidth, 1600);
  assert.equal(C.imageMaxBytes, 10 * 1024 * 1024);
  assert.equal(C.imageJpegQuality, 0.85);
  const wide = C.imageExportSize(2000, 1000);
  assert.equal(wide.width, 1600);
  assert.equal(wide.height, 800);
  assert.equal(wide.scaled, true);
  const exact = C.imageExportSize(1600, 900);
  assert.equal(exact.width, 1600);
  assert.equal(exact.height, 900);
  assert.equal(exact.scaled, false);
  const small = C.imageExportSize(800, 600);
  assert.equal(small.width, 800);
  assert.equal(small.height, 600);
  assert.equal(small.scaled, false);
  assert.equal(C.imageExportSize(0, 10), null);
});

test("Google Form entry ids stay put and an image URL is optional", async () => {
  assert.equal(C.entries.title, "entry.222267680");
  assert.equal(C.entries.category, "entry.829806976");
  assert.equal(C.entries.details, "entry.1557623342");
  assert.equal(C.entries.source, "entry.465615384");
  assert.equal(C.entries.name, "entry.1699823806");
  assert.equal(C.entries.image, "entry.1827524123");
  assert.equal(C.categories.map((cat) => cat.label).join("|"), [
    "Before launch / settings & UI",
    "Race & class picks",
    "Leveling route & questing",
    "Professions & gold",
    "Group play & dungeons",
    "Addons",
    "Mistakes to avoid"
  ].join("|"));

  let formCalls = 0;
  await C.submitTip({
    title: "Title",
    categoryLabel: "Addons",
    details: "Details",
    source: "https://example.com/src",
    name: "Ada",
    image: "https://i.ibb.co/abc/tip.jpg"
  }, (_url, options) => {
    formCalls += 1;
    assert.equal(options.method, "POST");
    assert.equal(options.mode, "no-cors");
    assert.equal(options.body.get(C.entries.title), "Title");
    assert.equal(options.body.get(C.entries.category), "Addons");
    assert.equal(options.body.get(C.entries.details), "Details");
    assert.equal(options.body.get(C.entries.source), "https://example.com/src");
    assert.equal(options.body.get(C.entries.name), "Ada");
    assert.equal(options.body.get(C.entries.image), "https://i.ibb.co/abc/tip.jpg");
    return Promise.resolve();
  });

  await C.submitTip({ title: "Title", categoryLabel: "Addons", details: "Details", image: "javascript:alert(1)" },
    (_url, options) => {
      formCalls += 1;
      assert.equal(options.body.get(C.entries.image), null);
      return Promise.resolve();
    });
  assert.equal(formCalls, 2);
});

test("ImgBB upload is stubbed and reads url, then display_url", async () => {
  assert.equal(C.imgbb.uploadUrl, "https://api.imgbb.com/1/upload");
  const payload = "abc123base64";
  const url = await C.uploadImage(payload, (endpoint, options) => {
    assert.equal(endpoint, C.imgbb.uploadUrl + "?key=" + encodeURIComponent(C.imgbb.key));
    assert.equal(options.method, "POST");
    assert.notEqual(options.mode, "no-cors");
    assert.equal(options.body.get("image"), payload);
    assert.equal(String(options.body.get("image")).startsWith("data:"), false);
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: { url: "https://i.ibb.co/abc/tip.jpg", display_url: "https://i.ibb.co/abc/display.jpg" } })
    });
  });
  assert.equal(url, "https://i.ibb.co/abc/tip.jpg");

  const fallback = await C.uploadImage(payload, () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { url: "", display_url: "https://i.ibb.co/fallback.jpg" } })
  }));
  assert.equal(fallback, "https://i.ibb.co/fallback.jpg");

  await assert.rejects(C.uploadImage(payload, () => Promise.resolve({ ok: false })));
  await assert.rejects(C.uploadImage(payload, () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { url: "javascript:alert(1)", display_url: "data:text/html,hi" } })
  })));
  await assert.rejects(C.uploadImage("", () => {
    throw new Error("should not fetch");
  }));
});
