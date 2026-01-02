let modal = null;
let activeView = "gallery";

const API_BASE = "http://localhost:5678/api";

export function initModal() {
  if (document.getElementById("modal-overlay")) return;

  modal = buildModal();
  document.body.appendChild(modal);

  const overlay = document.getElementById("modal-overlay");

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

export function openModal(view = "gallery") {
  initModal();
  activeView = view;
  renderView(activeView);

  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("is-open");
}

export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  overlay.classList.remove("is-open");
  activeView = "gallery";
}

function buildModal() {
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.className = "modal-overlay";

  const modalEl = document.createElement("div");
  modalEl.className = "modal";
  modalEl.setAttribute("role", "dialog");
  modalEl.setAttribute("aria-modal", "true");
  modalEl.setAttribute("aria-label", "Gestion des travaux");

  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Fermer");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeModal);

  const backBtn = document.createElement("button");
  backBtn.className = "modal-back";
  backBtn.type = "button";
  backBtn.setAttribute("aria-label", "Retour");
  backBtn.textContent = "←";
  backBtn.addEventListener("click", () => renderView("gallery"));

  const title = document.createElement("h3");
  title.className = "modal-title";

  const galleryView = document.createElement("div");
  galleryView.className = "modal-view modal-view-gallery";

  const modalGallery = document.createElement("div");
  modalGallery.className = "modal-gallery";

  const sep1 = document.createElement("hr");
  sep1.className = "modal-separator";

  const openAddBtn = document.createElement("button");
  openAddBtn.className = "modal-primary";
  openAddBtn.type = "button";
  openAddBtn.id = "open-add-view";
  openAddBtn.textContent = "Ajouter une photo";
  openAddBtn.addEventListener("click", () => renderView("add"));

  galleryView.appendChild(modalGallery);
  galleryView.appendChild(sep1);
  galleryView.appendChild(openAddBtn);

  const addView = document.createElement("div");
  addView.className = "modal-view modal-view-add";
  addView.style.display = "none";

  const form = document.createElement("form");
  form.id = "add-work-form";

  const uploadBox = document.createElement("div");
  uploadBox.className = "upload-box";

  const uploadPreview = document.createElement("div");
  uploadPreview.className = "upload-preview";
  uploadPreview.id = "upload-preview";

  const previewImg = document.createElement("img");
  previewImg.alt = "";
  uploadPreview.appendChild(previewImg);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "work-image";
  fileInput.accept = "image/*";
  fileInput.hidden = true;

  const pickBtn = document.createElement("button");
  pickBtn.type = "button";
  pickBtn.className = "upload-btn";
  pickBtn.id = "pick-image";
  pickBtn.textContent = "+ Ajouter photo";
  pickBtn.addEventListener("click", () => fileInput.click());

  const hint = document.createElement("p");
  hint.className = "upload-hint";
  hint.textContent = "jpg, png : 4mo max";

  uploadBox.appendChild(uploadPreview);
  uploadBox.appendChild(fileInput);
  uploadBox.appendChild(pickBtn);
  uploadBox.appendChild(hint);

  const labelTitle = document.createElement("label");
  labelTitle.setAttribute("for", "work-title");
  labelTitle.textContent = "Titre";

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.id = "work-title";
  inputTitle.required = true;

  const labelCat = document.createElement("label");
  labelCat.setAttribute("for", "work-category");
  labelCat.textContent = "Catégorie";

  const selectCat = document.createElement("select");
  selectCat.id = "work-category";
  selectCat.required = true;

  const optDefault = document.createElement("option");
  optDefault.value = "";
  optDefault.textContent = "-- Sélectionner --";
  selectCat.appendChild(optDefault);

  const sep2 = document.createElement("hr");
  sep2.className = "modal-separator";

  const submitBtn = document.createElement("button");
  submitBtn.className = "modal-primary";
  submitBtn.type = "submit";
  submitBtn.id = "submit-work";
  submitBtn.disabled = true;
  submitBtn.textContent = "Valider";

  const errorEl = document.createElement("p");
  errorEl.className = "modal-error";
  errorEl.id = "modal-error";

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    uploadPreview.classList.add("has-image");
    updateSubmitState();
  });

  inputTitle.addEventListener("input", updateSubmitState);
  selectCat.addEventListener("change", updateSubmitState);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitNewWork();
  });

  form.appendChild(uploadBox);
  form.appendChild(labelTitle);
  form.appendChild(inputTitle);
  form.appendChild(labelCat);
  form.appendChild(selectCat);
  form.appendChild(sep2);
  form.appendChild(submitBtn);
  form.appendChild(errorEl);

  addView.appendChild(form);

  modalEl.appendChild(closeBtn);
  modalEl.appendChild(backBtn);
  modalEl.appendChild(title);
  modalEl.appendChild(galleryView);
  modalEl.appendChild(addView);

  overlay.appendChild(modalEl);
  return overlay;
}

function renderView(view) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const title = overlay.querySelector(".modal-title");
  const galleryView = overlay.querySelector(".modal-view-gallery");
  const addView = overlay.querySelector(".modal-view-add");
  const backBtn = overlay.querySelector(".modal-back");

  if (view === "gallery") {
    title.textContent = "Galerie photo";
    galleryView.style.display = "block";
    addView.style.display = "none";
    backBtn.style.display = "none";
    renderModalGallery();
  } else {
    title.textContent = "Ajout photo";
    galleryView.style.display = "none";
    addView.style.display = "block";
    backBtn.style.display = "inline-flex";
    loadCategoriesIntoSelect();
    resetAddForm();
    updateSubmitState();
  }

  activeView = view;
}

async function loadCategoriesIntoSelect() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const select = overlay.querySelector("#work-category");
  if (!select) return;

  if (select.options.length > 1) return;

  try {
    const res = await fetch(`${API_BASE}/categories`);
    const cats = await res.json();

    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch {
    // noop
  }
}

function resetAddForm() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const errorEl = overlay.querySelector("#modal-error");
  const titleInput = overlay.querySelector("#work-title");
  const fileInput = overlay.querySelector("#work-image");
  const select = overlay.querySelector("#work-category");
  const preview = overlay.querySelector("#upload-preview");
  const img = preview?.querySelector("img");

  if (errorEl) errorEl.textContent = "";
  if (titleInput) titleInput.value = "";
  if (fileInput) fileInput.value = "";
  if (select) select.value = "";

  if (preview) preview.classList.remove("has-image");
  if (img) img.src = "";
}

function updateSubmitState() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const title = overlay.querySelector("#work-title")?.value.trim();
  const cat = overlay.querySelector("#work-category")?.value;
  const file = overlay.querySelector("#work-image")?.files?.[0];

  const submit = overlay.querySelector("#submit-work");
  if (submit) submit.disabled = !(title && cat && file);
}

async function fetchWorks() {
  const res = await fetch(`${API_BASE}/works`);
  return res.json();
}

export async function renderModalGallery() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const container = overlay.querySelector(".modal-gallery");
  if (!container) return;

  container.textContent = "";

  const works = await fetchWorks();
  works.forEach((work) => container.appendChild(buildModalItem(work)));
}

function buildModalItem(work) {
  const item = document.createElement("div");
  item.className = "modal-item";
  item.dataset.modalId = work.id;

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  const trashBtn = document.createElement("button");
  trashBtn.className = "trash-btn";
  trashBtn.type = "button";
  trashBtn.setAttribute("aria-label", "Supprimer");
  trashBtn.dataset.trashId = work.id;

  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-trash-can");
  icon.setAttribute("aria-hidden", "true");

  trashBtn.appendChild(icon);

  trashBtn.addEventListener("click", async () => {
    await deleteWork(work.id);
  });

  item.appendChild(img);
  item.appendChild(trashBtn);

  return item;
}

async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`${API_BASE}/works/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    alert("Erreur lors de la suppression.");
    return;
  }

  const modalItem = document.querySelector(`[data-modal-id="${id}"]`);
  if (modalItem) modalItem.remove();

  const pageItem = document.querySelector(`figure[data-id="${id}"]`);
  if (pageItem) pageItem.remove();
}

async function submitNewWork() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const errorEl = overlay.querySelector("#modal-error");
  if (errorEl) errorEl.textContent = "";

  const token = localStorage.getItem("token");
  if (!token) {
    if (errorEl) errorEl.textContent = "Vous devez être connecté.";
    return;
  }

  const title = overlay.querySelector("#work-title")?.value.trim();
  const category = overlay.querySelector("#work-category")?.value;
  const imageFile = overlay.querySelector("#work-image")?.files?.[0];

  if (!title || !category || !imageFile) {
    if (errorEl) errorEl.textContent = "Veuillez compléter tous les champs.";
    return;
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", category);

  try {
    const res = await fetch(`${API_BASE}/works`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      if (errorEl) errorEl.textContent = "Erreur : le formulaire n'a pas pu être envoyé.";
      return;
    }

    const newWork = await res.json();

    addWorkToHomeGallery(newWork);
    addWorkToModalGallery(newWork);

    renderView("gallery");
  } catch {
    if (errorEl) errorEl.textContent = "Erreur serveur. Réessaie plus tard.";
  }
}

function addWorkToHomeGallery(work) {
  const gallery = document.querySelector(".gallery");
  if (!gallery) return;

  const figure = document.createElement("figure");
  figure.dataset.id = work.id;

  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  const caption = document.createElement("figcaption");
  caption.textContent = work.title;

  figure.appendChild(img);
  figure.appendChild(caption);
  gallery.appendChild(figure);
}

function addWorkToModalGallery(work) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const container = overlay.querySelector(".modal-gallery");
  if (!container) return;

  container.appendChild(buildModalItem(work));
}
