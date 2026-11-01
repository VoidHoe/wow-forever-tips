const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

const window = {};
vm.runInNewContext(fs.readFileSync("community.js", "utf8"), { window, URL, URLSearchParams, FormData, Promise });
const C = window.COMMUNITY;

test("only approved CSV rows expose their images", () => {
  const csv = "Tip title,Category,Details,Image,Approved\n"
    + "Ready,Addons,Use this,https://example.com/a.png,yes\n"
    + "Pending,Addons,Not yet,https://example.com/b.png,\n";
  const tips = C.rowsToTips(csv, []);
  assert.equal(tips.length, 1);
  assert.equal(tips[0].image, "https://example.com/a.png");
});

test("image upload URL is added to the Google Form submission", async () => {
  let body;
  await C.submitTip({ title: "Title", categoryLabel: "Addons", details: "Details", image: "https://example.com/a.png" },
    (_url, options) => { body = options.body; return Promise.resolve(); });
  assert.equal(body.get(C.entries.image), "https://example.com/a.png");
});

test("image upload uses the unsigned preset and checks the returned URL", async () => {
  C.imageUpload.cloudName = "demo";
  C.imageUpload.uploadPreset = "tips";
  const file = new File(["image"], "tip.png", { type: "image/png" });
  const url = await C.uploadImage(file, (endpoint, options) => {
    assert.equal(endpoint, "https://api.cloudinary.com/v1_1/demo/image/upload");
    assert.equal(options.body.get("file"), file);
    assert.equal(options.body.get("upload_preset"), "tips");
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ secure_url: "https://res.cloudinary.com/demo/image/upload/tip.png" }) });
  });
  assert.equal(url, "https://res.cloudinary.com/demo/image/upload/tip.png");
  await assert.rejects(C.uploadImage(file, () => Promise.resolve({ ok: false })));
});
