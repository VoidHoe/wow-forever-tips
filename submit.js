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
  var imageInput = document.getElementById("image");
  if (!C.imageUpload.cloudName || !C.imageUpload.uploadPreset) imageInput.parentNode.hidden = true;
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
    if (known) return known.short || known.label;
    return cat.label;
  }
  function chipTitle(cat) {
    var known = window.CATEGORIES && window.CATEGORIES[cat.id];
    if (known && known.label) return known.label;
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
    label.title = chipTitle(cat);
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
  imageInput.addEventListener("change", function () { setError("image-error", ""); });
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
    var imageFile = imageInput.files[0];
    var ok = true;

    if (!title) { setError("title-error", "Ajoute un titre court."); ok = false; }
    else if (title.length > 140) { setError("title-error", "Garde le titre sous 140 caractères."); ok = false; }
    else setError("title-error", "");

    if (!cat) { setError("cat-error", "Choisis une catégorie."); ok = false; }
    else setError("cat-error", "");

    if (!details) { setError("details-error", "Ajoute une phrase ou deux de détail."); ok = false; }
    else setError("details-error", "");

    if (source === null) { setError("source-error", "Ce lien n'a pas l'air utilisable. Mets une adresse https, ou laisse vide."); ok = false; }
    else setError("source-error", "");

    // shortcut: the 5 MB limit is browser-only, add a server upload endpoint for strict enforcement.
    if (imageFile && !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)) {
      setError("image-error", "Choisis un fichier JPG, PNG ou WebP."); ok = false;
    } else if (imageFile && (!imageFile.size || imageFile.size > 5 * 1024 * 1024)) {
      setError("image-error", "Choisis une image de 5 Mo ou moins."); ok = false;
    } else setError("image-error", "");

    return ok ? {
      title: title,
      categoryLabel: cat.label,
      details: details,
      source: source,
      imageFile: imageFile,
      name: nameInput.value.trim()
    } : null;
  }

  function showError(uploadFailed) {
    var box = document.getElementById("form-error");
    box.hidden = false;
    box.textContent = "";
    box.appendChild(document.createTextNode(uploadFailed ? "L'image n'a pas pu être envoyée. Réessaie. " : "L'envoi a planté. "));
    var link = el("a", null, "Ouvre le formulaire Google");
    link.href = C.formView;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(link);
    box.appendChild(document.createTextNode(" pour envoyer l'astuce sans image."));
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
    sendBtn.textContent = fields.imageFile ? "Téléversement…" : "Envoi…";
    document.getElementById("form-error").hidden = true;
    rememberName();
    var uploadFailed = !!fields.imageFile;
    (fields.imageFile ? C.uploadImage(fields.imageFile) : Promise.resolve("")).then(function (url) {
      fields.image = url;
      uploadFailed = false;
      sendBtn.textContent = "Envoi…";
      return C.submitTip(fields);
    }).then(function () {
      showSuccess();
    }).catch(function () {
      showError(uploadFailed);
    }).then(function () {
      sending = false;
      sendBtn.disabled = false;
      sendBtn.textContent = "Envoyer l'astuce";
    });
  });

  document.getElementById("another").addEventListener("click", function () {
    titleInput.value = "";
    detailsInput.value = "";
    sourceInput.value = "";
    imageInput.value = "";
    updateCount();
    setError("title-error", "");
    setError("cat-error", "");
    setError("details-error", "");
    setError("source-error", "");
    setError("image-error", "");
    success.hidden = true;
    form.hidden = false;
    titleInput.focus();
  });
})();
