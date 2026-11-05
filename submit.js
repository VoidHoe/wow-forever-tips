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
  var imageDrop = document.getElementById("image-drop");
  var imagePreview = document.getElementById("image-preview");
  var imageThumb = document.getElementById("image-thumb");
  var imageNote = document.getElementById("image-preview-note");
  var imageRemove = document.getElementById("image-remove");
  var nameInput = document.getElementById("name");
  var sending = false;
  var imageBusy = false;
  var imageToken = 0;
  var pending = null;

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

  function setStatus(message) {
    var node = document.getElementById("image-status");
    if (!node) return;
    node.hidden = !message;
    node.textContent = message || "";
  }

  function hideFormError() {
    var box = document.getElementById("form-error");
    box.hidden = true;
    box.textContent = "";
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

  function imageErrorMessage(code) {
    if (code === "size") return "Cette image dépasse 10 Mo. Choisis un fichier plus léger.";
    if (code === "type") return "Ce fichier n'est pas une image.";
    return "Impossible de lire cette image. Essaie un autre fichier.";
  }

  function failImage(code) {
    var err = new Error(code || "decode");
    err.code = code || "decode";
    return err;
  }

  function clearPending() {
    if (pending && pending.url) URL.revokeObjectURL(pending.url);
    pending = null;
    if (imageThumb) imageThumb.removeAttribute("src");
    if (imagePreview) imagePreview.hidden = true;
    if (imageDrop) imageDrop.hidden = false;
  }

  function removeImage() {
    imageToken++;
    imageBusy = false;
    if (!sending) sendBtn.disabled = false;
    clearPending();
    if (imageInput) imageInput.value = "";
    setError("image-error", "");
  }

  function loadImageElement(file) {
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(failImage("decode"));
      };
      img.src = url;
    });
  }

  function rasterize(img, width, height) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    if (!ctx) return Promise.reject(failImage("decode"));
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) reject(failImage("decode"));
        else resolve(blob);
      }, "image/jpeg", C.imageJpegQuality);
    });
  }

  function prepareImage(file) {
    if (!file || !file.size) return Promise.reject(failImage("decode"));
    if (file.size > C.imageMaxBytes) return Promise.reject(failImage("size"));
    if (file.type && file.type.indexOf("image/") !== 0) return Promise.reject(failImage("type"));
    return loadImageElement(file).then(function (img) {
      var size = C.imageExportSize(img.naturalWidth, img.naturalHeight, C.imageMaxWidth);
      if (!size) throw failImage("decode");
      if (!size.scaled && file.type !== "image/svg+xml") return { blob: file, scaled: false };
      return rasterize(img, size.width, size.height).then(function (blob) {
        return { blob: blob, scaled: !!size.scaled };
      });
    });
  }

  function acceptFile(file) {
    var token = ++imageToken;
    setError("image-error", "");
    clearPending();
    if (imageInput) imageInput.value = "";
    if (!file) return;
    imageBusy = true;
    sendBtn.disabled = true;
    prepareImage(file).then(function (ready) {
      if (token !== imageToken) return;
      var url = URL.createObjectURL(ready.blob);
      pending = { blob: ready.blob, url: url, scaled: ready.scaled };
      imageThumb.src = url;
      imageNote.textContent = ready.scaled
        ? "Aperçu réduit (1600 px), prêt à l'envoi."
        : "Aperçu, prêt à l'envoi.";
      imagePreview.hidden = false;
      imageDrop.hidden = true;
    }).catch(function (err) {
      if (token !== imageToken) return;
      clearPending();
      setError("image-error", imageErrorMessage(err && err.code));
    }).then(function () {
      if (token !== imageToken) return;
      imageBusy = false;
      if (!sending) sendBtn.disabled = false;
    });
  }

  function blobToBase64Payload(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var result = String(reader.result || "");
        var comma = result.indexOf(",");
        var payload = comma >= 0 ? result.slice(comma + 1) : result;
        if (!payload || payload.indexOf("data:") === 0) reject(failImage("decode"));
        else resolve(payload);
      };
      reader.onerror = function () { reject(failImage("decode")); };
      reader.readAsDataURL(blob);
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", function () {
      var file = imageInput.files && imageInput.files[0];
      if (file) acceptFile(file);
    });
  }
  if (imageRemove) imageRemove.addEventListener("click", removeImage);
  if (imageDrop) {
    imageDrop.addEventListener("dragover", function (e) {
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      imageDrop.classList.add("is-dragover");
    });
    imageDrop.addEventListener("dragleave", function (e) {
      e.preventDefault();
      imageDrop.classList.remove("is-dragover");
    });
    imageDrop.addEventListener("drop", function (e) {
      e.preventDefault();
      imageDrop.classList.remove("is-dragover");
      var files = e.dataTransfer && e.dataTransfer.files;
      if (files && files.length) acceptFile(files[0]);
    });
  }
  window.addEventListener("paste", function (e) {
    if (!form || form.hidden || sending) return;
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].kind === "file" && items[i].type.indexOf("image/") === 0) {
        var file = items[i].getAsFile();
        if (!file) return;
        e.preventDefault();
        acceptFile(file);
        return;
      }
    }
  });

  function validate() {
    var title = titleInput.value.trim();
    var details = detailsInput.value.trim();
    var cat = selectedCategory();
    var source = looseUrl(sourceInput.value);
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

    if (imageBusy) {
      setError("image-error", "Patiente, l'image est en cours de préparation.");
      ok = false;
    } else if (!imagePreview.hidden && !pending) {
      setError("image-error", "Impossible de lire cette image. Essaie un autre fichier.");
      ok = false;
    }

    return ok ? {
      title: title,
      categoryLabel: cat.label,
      details: details,
      source: source,
      name: nameInput.value.trim(),
      imageBlob: pending ? pending.blob : null
    } : null;
  }

  function showFormError() {
    var box = document.getElementById("form-error");
    box.hidden = false;
    box.textContent = "";
    box.appendChild(document.createTextNode("L'envoi a planté. "));
    var link = el("a", null, "Ouvre le formulaire Google");
    link.href = C.formView;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    box.appendChild(link);
    box.appendChild(document.createTextNode(" pour réessayer."));
  }

  function showImageUploadError(fields) {
    var box = document.getElementById("form-error");
    box.hidden = false;
    box.textContent = "";
    box.appendChild(document.createTextNode("L'image n'a pas pu être envoyée. Réessaie, ou envoie l'astuce sans image."));
    var skip = el("button", "btn ghost", "Envoyer sans l'image");
    skip.type = "button";
    skip.addEventListener("click", function () {
      if (sending) return;
      postTip({
        title: fields.title,
        categoryLabel: fields.categoryLabel,
        details: fields.details,
        source: fields.source,
        name: fields.name
      });
    });
    box.appendChild(skip);
  }

  function showSuccess() {
    form.hidden = true;
    hideFormError();
    setStatus("");
    success.hidden = false;
    var again = document.getElementById("another");
    if (again) again.focus();
  }

  function unlockForm() {
    sending = false;
    if (imageRemove) imageRemove.disabled = false;
    if (!imageBusy) sendBtn.disabled = false;
    sendBtn.textContent = "Envoyer l'astuce";
  }

  function postTip(fields) {
    sending = true;
    sendBtn.disabled = true;
    if (imageRemove) imageRemove.disabled = true;
    sendBtn.textContent = "Envoi…";
    setStatus("");
    hideFormError();
    rememberName();
    return C.submitTip(fields).then(function () {
      showSuccess();
    }).catch(function () {
      showFormError();
    }).then(unlockForm);
  }

  function sendWithImage(fields) {
    sending = true;
    sendBtn.disabled = true;
    if (imageRemove) imageRemove.disabled = true;
    sendBtn.textContent = "Envoi de l'image...";
    setStatus("Envoi de l'image...");
    hideFormError();
    rememberName();
    var stage = "upload";
    blobToBase64Payload(fields.imageBlob).then(function (payload) {
      return C.uploadImage(payload);
    }).then(function (url) {
      stage = "form";
      fields.image = url;
      sendBtn.textContent = "Envoi…";
      setStatus("");
      return C.submitTip(fields);
    }).then(function () {
      showSuccess();
    }).catch(function () {
      setStatus("");
      if (stage === "upload") showImageUploadError(fields);
      else showFormError();
    }).then(unlockForm);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (sending) return;
    var fields = validate();
    if (!fields) return;
    if (fields.imageBlob) sendWithImage(fields);
    else postTip(fields);
  });

  document.getElementById("another").addEventListener("click", function () {
    titleInput.value = "";
    detailsInput.value = "";
    sourceInput.value = "";
    removeImage();
    updateCount();
    setError("title-error", "");
    setError("cat-error", "");
    setError("details-error", "");
    setError("source-error", "");
    setStatus("");
    success.hidden = true;
    form.hidden = false;
    titleInput.focus();
  });
})();
