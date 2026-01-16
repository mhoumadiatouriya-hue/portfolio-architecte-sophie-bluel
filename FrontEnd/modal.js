// BUT DU FICHIER
// - Créer et gérer la modale du mode édition
// - Afficher une galerie dans la modale (avec poubelles pour supprimer)
// - Permettre l'ajout d'un nouveau projet (photo + titre + catégorie)
// - Mettre à jour la page et la modale sans recharger la page
// =======================================================

let modal = null;
let activeView = "gallery";

// Adresse de base de l'API (pour éviter de répéter le début des URL)
const API_BASE = "http://localhost:5678/api";

// La fonction initModal Initialise la modale (si pas déjà fait)
export function initModal() {
  // Évite de créer la modale plusieurs fois
  if (document.getElementById("modal-overlay")) return;

  // Création de la structure de la modale
  modal = buildModal();
  document.body.appendChild(modal);

  const overlay = document.getElementById("modal-overlay");
// Fermer si on clique sur l'arrière-plan gris (pas sur la fenêtre blanche)
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  
  // Fermer si on appuie sur la touche "Echap"
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// La fonction openModal Ouvre la modale et affiche la vue demandée (gallery ou add)
export function openModal(view = "gallery") {
  initModal();
  activeView = view;

  // // On affiche la bonne vue (galerie ou ajout)
  renderView(activeView);

// On affiche l'overlay
  const overlay = document.getElementById("modal-overlay");
  overlay.classList.add("is-open");
}

// La fonction closeModal Ferme la modale

export function closeModal() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  overlay.classList.remove("is-open");
  activeView = "gallery";
}

// La fonction buildModal crée la structure HTML de la modale 
// Avec fond gris, fenêtre blanche, boutons, titre etc.
function buildModal() {
  // === OVERLAY (fond semi-transparent) ===
  const overlay = document.createElement("div");
  overlay.id = "modal-overlay";
  overlay.className = "modal-overlay";

  // === CONTENEUR PRINCIPAL ===
  const modalEl = document.createElement("div");
  modalEl.className = "modal";
  modalEl.setAttribute("role", "dialog");
  modalEl.setAttribute("aria-modal", "true");
  modalEl.setAttribute("aria-label", "Gestion des travaux");

  // === BOUTON FERMER (X) ===
  const closeBtn = document.createElement("button");
  closeBtn.className = "modal-close";
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Fermer");
  closeBtn.textContent = "×";
  closeBtn.addEventListener("click", closeModal);

  // === BOUTON RETOUR (←) ===
  const backBtn = document.createElement("button");
  backBtn.className = "modal-back";
  backBtn.type = "button";
  backBtn.setAttribute("aria-label", "Retour");
  backBtn.textContent = "←";
  backBtn.addEventListener("click", () => renderView("gallery"));

  // === TITRE DE LA MODALE ===
  const title = document.createElement("h3");
  title.className = "modal-title";

    // ===================================================
  // VUE 1 : GALERIE (liste des projets + poubelles)
  // ===================================================
  const galleryView = document.createElement("div");
  galleryView.className = "modal-view modal-view-gallery";

  // Conteneur des miniatures
  const modalGallery = document.createElement("div");
  modalGallery.className = "modal-gallery";

  // Séparateur
  const sep1 = document.createElement("hr");
  sep1.className = "modal-separator";

  // Bouton "Ajouter une photo"
  const openAddBtn = document.createElement("button");
  openAddBtn.className = "modal-primary";
  openAddBtn.type = "button";
  openAddBtn.id = "open-add-view";
  openAddBtn.textContent = "Ajouter une photo";
  openAddBtn.addEventListener("click", () => renderView("add"));

  galleryView.appendChild(modalGallery);
  galleryView.appendChild(sep1);
  galleryView.appendChild(openAddBtn);

  // ===================================================
  // VUE 2 : AJOUT (formulaire pour ajouter un projet)
  // ===================================================

  const addView = document.createElement("div");
  addView.className = "modal-view modal-view-add";
  addView.style.display = "none";

  // === FORMULAIRE D'AJOUT ===
  const form = document.createElement("form");
  form.id = "add-work-form";

  // Zone d'upload de l'image
  const uploadBox = document.createElement("div");
  uploadBox.className = "upload-box";

  // Prévisualisation de l'image
  const uploadPreview = document.createElement("div");
  uploadPreview.className = "upload-preview";
  uploadPreview.id = "upload-preview";

  const previewImg = document.createElement("img");
  previewImg.alt = "";
  uploadPreview.appendChild(previewImg);

  // Input type file (caché)
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.id = "work-image";
  fileInput.accept = "image/*";
  fileInput.hidden = true;

  // Bouton personnalisé pour choisir un fichier
  const pickBtn = document.createElement("button");
  pickBtn.type = "button";
  pickBtn.className = "upload-btn";
  pickBtn.id = "pick-image";
  pickBtn.textContent = "+ Ajouter photo";
  pickBtn.addEventListener("click", () => fileInput.click());

  // Indication de fomart
  const hint = document.createElement("p");
  hint.className = "upload-hint";
  hint.textContent = "jpg, png : 4mo max";

  uploadBox.appendChild(uploadPreview);
  uploadBox.appendChild(fileInput);
  uploadBox.appendChild(pickBtn);
  uploadBox.appendChild(hint);

  // CHAMP TITRE
  const labelTitle = document.createElement("label");
  labelTitle.setAttribute("for", "work-title");
  labelTitle.textContent = "Titre";

  const inputTitle = document.createElement("input");
  inputTitle.type = "text";
  inputTitle.id = "work-title";
  inputTitle.required = true;

  // CHAMP CATÉGORIE
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

  // Séparateur
  const sep2 = document.createElement("hr");
  sep2.className = "modal-separator";

  // BOUTON SOUMETTRE
  const submitBtn = document.createElement("button");
  submitBtn.className = "modal-primary";
  submitBtn.type = "submit";
  submitBtn.id = "submit-work";
  submitBtn.disabled = true;
  submitBtn.textContent = "Valider";

  // Message d'erreur
  const errorEl = document.createElement("p");
  errorEl.className = "modal-error";
  errorEl.id = "modal-error";

  // ======= GESTION DES ÉVÉNEMENTS DU FORMULAIRE =======
  // Prévisualisation de l'image choisie
  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    previewImg.src = URL.createObjectURL(file);
    uploadPreview.classList.add("has-image");
    updateSubmitState();
  });
// Validation des champs pour activer/désactiver le bouton submit
  inputTitle.addEventListener("input", updateSubmitState);
  selectCat.addEventListener("change", updateSubmitState);
// Soumission du formulaire
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitNewWork();
  });
// ======= ASSEMBLAGE DU FORMULAIRE =======
  form.appendChild(uploadBox);
  form.appendChild(labelTitle);
  form.appendChild(inputTitle);
  form.appendChild(labelCat);
  form.appendChild(selectCat);
  form.appendChild(sep2);
  form.appendChild(submitBtn);
  form.appendChild(errorEl);

  addView.appendChild(form);

// ======= ASSEMBLAGE FINAL DE LA MODALE =======
  modalEl.appendChild(closeBtn);
  modalEl.appendChild(backBtn);
  modalEl.appendChild(title);
  modalEl.appendChild(galleryView);
  modalEl.appendChild(addView);

  overlay.appendChild(modalEl);
  return overlay;
}

// La fonction renderView affiche la vue demandée dans la modale
function renderView(view) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const title = overlay.querySelector(".modal-title");
  const galleryView = overlay.querySelector(".modal-view-gallery");
  const addView = overlay.querySelector(".modal-view-add");
  const backBtn = overlay.querySelector(".modal-back");

  if (view === "gallery") {
    // Affichage de la galerie
    title.textContent = "Galerie photo";
    galleryView.style.display = "block";
    addView.style.display = "none";
    backBtn.style.display = "none";
    renderModalGallery();
  } else {
    // Affiche le formulaire d'ajout
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

// La fonction loadCategoriesIntoSelect charge les catégories dans le select du formulaire
async function loadCategoriesIntoSelect() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const select = overlay.querySelector("#work-category");
  // Evite de charger plusieurs fois
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

// La fonction resetAddForm Réinitialise le formulaire d'ajout
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

// la fonction updateSubmitState Active ou désactive le bouton submit du formulaire
function updateSubmitState() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const title = overlay.querySelector("#work-title")?.value.trim();
  const cat = overlay.querySelector("#work-category")?.value;
  const file = overlay.querySelector("#work-image")?.files?.[0];

  const submit = overlay.querySelector("#submit-work");
  if (submit) submit.disabled = !(title && cat && file);
}

// La fonction fetchWorks Récupère la liste des projets depuis l'API
async function fetchWorks() {
  const res = await fetch(`${API_BASE}/works`);
  return res.json();
}

// La fonction renderModalGallery Affiche les projets dans la modale
export async function renderModalGallery() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const container = overlay.querySelector(".modal-gallery");
  if (!container) return;

  // On vide la galerie avant d'afficher les projets
  container.textContent = "";
// Récupération des projets
  const works = await fetchWorks();
  works.forEach((work) => container.appendChild(buildModalItem(work)));
}

// La fonction buildModalItem Crée un élément de la galerie dans la modale avec la poubelle
function buildModalItem(work) {
  const item = document.createElement("div");
  item.className = "modal-item";
  item.dataset.modalId = work.id;

  // image du projet
  const img = document.createElement("img");
  img.src = work.imageUrl;
  img.alt = work.title;

  // Bouton de suppression
  const trashBtn = document.createElement("button");
  trashBtn.className = "trash-btn";
  trashBtn.type = "button";
  trashBtn.setAttribute("aria-label", "Supprimer");
  trashBtn.dataset.trashId = work.id;

  // Icône poubelle
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-trash-can");
  icon.setAttribute("aria-hidden", "true");

  trashBtn.appendChild(icon);

  //event de suppression au clic
  trashBtn.addEventListener("click", async () => {
    await deleteWork(work.id);
  });

  item.appendChild(img);
  item.appendChild(trashBtn);

  return item;
}

// La fonction deleteWork Supprime un projet via l'API
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

  // Suppression réussie : on enlève l'élément de la modale et de la page
  const modalItem = document.querySelector(`[data-modal-id="${id}"]`);
  if (modalItem) modalItem.remove();

  // Suppression de la galerie principale
  const pageItem = document.querySelector(`figure[data-id="${id}"]`);
  if (pageItem) pageItem.remove();
}

// La fonction submitNewWork envoie le nouveau projet à l'API
async function submitNewWork() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const errorEl = overlay.querySelector("#modal-error");
  if (errorEl) errorEl.textContent = "";

  // Vérification du token
  const token = localStorage.getItem("token");
  if (!token) {
    if (errorEl) errorEl.textContent = "Vous devez être connecté.";
    return;
  }

  // Récupération des valeurs du formulaire
  const title = overlay.querySelector("#work-title")?.value.trim();
  const category = overlay.querySelector("#work-category")?.value;
  const imageFile = overlay.querySelector("#work-image")?.files?.[0];

  // Validation
  if (!title || !category || !imageFile) {
    if (errorEl) errorEl.textContent = "Veuillez compléter tous les champs.";
    return;
  }
  // Préparation des données à envoyer
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", category);

  try {
    // Envoi à l'API
    const res = await fetch(`${API_BASE}/works`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      if (errorEl) errorEl.textContent = "Erreur : le formulaire n'a pas pu être envoyé.";
      return;
    }

    // Récupération du nouveau projet créé
    const newWork = await res.json();

    // Ajout du nouveau projet dans la galerie principale et la modale
    addWorkToHomeGallery(newWork);
    addWorkToModalGallery(newWork);
// Retour à la vue galerie
    renderView("gallery");
  } catch {
    if (errorEl) errorEl.textContent = "Erreur serveur. Réessaie plus tard.";
  }
}

// La fonction addWorkToHomeGallery Ajoute un projet à la galerie principale
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

// La fonction addWorkToModalGallery Ajoute un projet à la galerie de la modale
function addWorkToModalGallery(work) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const container = overlay.querySelector(".modal-gallery");
  if (!container) return;

  container.appendChild(buildModalItem(work));
}
