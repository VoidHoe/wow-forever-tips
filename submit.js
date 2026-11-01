(function () {
  "use strict";

  var C = window.COMMUNITY;
  var NAME_KEY = "wowft-author-name";
  var form = document.getElementById("tip-form");
  var sendBtn = document.getElementById("send");
  var success = document.getElementById("success");
  var choices = document.getElementById("choices");
  var titleInput = document.getElementById("title");
  var detailsInput = document.getElementById("details");
  var sourceInput = document.getElementById("source");
  var nameInput = document.getElementById("name");
  var sending = false;

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function chipLabel(cat) {
    var known = window.CATEGORIES && window.CATEGORIES[cat.id];
    if (known && known.label === cat.label && known.short) return known.short;
    return cat.label;
  }

  C.categories.forEach(function (cat) {
    var label = el("label", "choice");
    var input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.value = cat.id;
    input.required = true;
    var text = el("span", null, chipLabel(cat));
    label.appendChild(input);
    label.appendChild(text);
    label.title = cat.label;
    choices.appendChild(label);
  });

  try {
    var saved = localStorage.getItem(NAME_KEY);
    if (saved) nameInput.value = saved;
  } catch (e) {}

  function rememberName() {
    try { localStorage.setItem(NAME_KEY, nameInput.value.trim()); } catch (e) {}
  }
  nameInput.addEventListener("change", rememberName);
  nameInput.addEventListener("input", rememberName);

  function updateCount() {
    document.getElementById("title-count").textContent = titleInput.value.length + "/140";
  }
  titleInput.addEventListener("input", function () { updateCount(); setError("title-error", ""); });
  detailsInput.addEventListener("input", function () { setError("details-error", ""); });
  sourceInput.addEventListener("input", function () { setError("source-error", ""); });
  choices.addEventListener("change", function () { setError("cat-error", ""); });
  updateCount();

  function setError(id, message) {
    var node = document.getElementById(id);
    var inputId = id.replace(/-error$/, "");
    var field = document.getElementById(inputId);
    if (!node) return;
    node.hidden = !message;
    node.textContent = message || "";
    if (id === "cat-error") field = document.getElementById("choices");
    if (field && field.setAttribute) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
  }

  function selectedCategory() {
    var picked = form.querySelector('input[name="category"]:checked');
    return picked ? C.categoryById(picked.value) : null;
  }

  function looseUrl(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (/^(javascript|data|vbscript):/i.test(raw)) return null;
    var candidate = /^https?:\/\//i.test(raw) ? raw : "https://" + raw;
    var safe = C.safeHttpUrl(candidate);
    return safe || null;
  }

  function validate() {
    var title = titleInput.value.trim();
    var details = detailsInput.value.trim();
    var cat = selectedCategory();
    var source = looseUrl(sourceInput.value);
    var ok = true;

    if (!title) { setError("title-error", "Add a short title."); ok = false; }
    else if (title.length > 140) { setError("title-error", "Keep the title to 140 characters."); ok = false; }
    else setError("title-error", "");

    if (!cat) { setError("cat-error", "Pick a category."); ok = false; }
    else setError("cat-error", "");

    if (!details) { setError("details-error", "Add a sentence or two of detail."); ok = false; }
    else setError("details-error", "");

    if (source === null) { setError("source-error", "That link doesn't look usable. Use an https address, or leave it blank."); ok = false; }
    else setError("source-error", "");

    return ok ? {
      title: title,
      categoryLabel: cat.label,
      details: details,
      source: source,
      name: nameInput.value.trim()
    } : null;
  }

  function showError() {
    var box = document.getElementById("form-error");
    box.hidden = false;
    box.textContent = "";
    box.appendChild(document.createTextNode("Couldn't send that. "));
    var link = el("a", null, "Open the Google Form");
    link.href = C.formView;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(link);
    box.appendChild(document.createTextNode(" and try there."));
  }

  function showSuccess() {
    form.hidden = true;
    document.getElementById("form-error").hidden = true;
    success.hidden = false;
    var again = document.getElementById("another");
    if (again) again.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    var fields = validate();
    if (!fields) return;
    sending = true;
    sendBtn.disabled = true;
    sendBtn.textContent = "Sending…";
    document.getElementById("form-error").hidden = true;
    rememberName();
    C.submitTip(fields).then(function () {
      showSuccess();
    }).catch(function () {
      showError();
    }).then(function () {
      sending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = "Submit tip";
    });
  });

  document.getElementById("another").addEventListener("click", function () {
    titleInput.value = "";
    detailsInput.value = "";
    sourceInput.value = "";
    updateCount();
    setError("title-error", "");
    setError("cat-error", "");
    setError("details-error", "");
    setError("source-error", "");
    success.hidden = true;
    form.hidden = false;
    titleInput.focus();
  });
})();
