let modal = null;
let activeView = "gallery"; // "gallery" | "add"

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

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="Gestion des travaux">
      <button class="modal-close" type="button" aria-label="Fermer">×</button>

      <button class="modal-back" type="button" aria-label="Retour">
        ←
      </button>

      <h3 class="modal-title"></h3>

      <!-- VUE 1 : Galerie -->
      <div class="modal-view modal-view-gallery">
        <div class="modal-gallery"></div>
        <hr class="modal-separator" />
        <button class="modal-primary" type="button" id="open-add-view">Ajouter une photo</button>
      </div>

      <!-- VUE 2 : Ajout -->
      <div class="modal-view modal-view-add">
        <form id="add-work-form">
          <div class="upload-box">
            <div class="upload-preview" id="upload-preview">
              <img alt="" />
            </div>

            <input type="file" id="work-image" accept="image/*" hidden />
            <button type="button" class="upload-btn" id="pick-image">+ Ajouter photo</button>
            <p class="upload-hint">jpg, png : 4mo max</p>
          </div>

          <label for="work-title">Titre</label>
          <input type="text" id="work-title" required />

          <label for="work-category">Catégorie</label>
          <select id="work-category" required>
            <option value="">-- Sélectionner --</option>
          </select>

          <hr class="modal-separator" />

          <button class="modal-primary" type="submit" id="submit-work" disabled>Valider</button>
          <p class="modal-error" id="modal-error"></p>
        </form>
      </div>
    </div>
  `;

  // fermeture
  overlay.querySelector(".modal-close").addEventListener("click", closeModal);

  // retour vers galerie
  const backBtn = overlay.querySelector(".modal-back");
  backBtn.addEventListener("click", () => renderView("gallery"));

  // aller vers ajout
  overlay.querySelector("#open-add-view").addEventListener("click", () => renderView("add"));

  // pick image
  overlay.querySelector("#pick-image").addEventListener("click", () => {
    overlay.querySelector("#work-image").click();
  });

  // preview image
  overlay.querySelector("#work-image").addEventListener("change", () => {
    const file = overlay.querySelector("#work-image").files?.[0];
    if (!file) return;

    const img = overlay.querySelector("#upload-preview img");
    img.src = URL.createObjectURL(file);
    overlay.querySelector("#upload-preview").classList.add("has-image");

    updateSubmitState();
  });

  // validation live
  overlay.querySelector("#work-title").addEventListener("input", updateSubmitState);
  overlay.querySelector("#work-category").addEventListener("change", updateSubmitState);

  // submit : POST /works
  overlay.querySelector("#add-work-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await submitNewWork();
  });

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

/* ====== Catégories dynamiques ====== */
async function loadCategoriesIntoSelect() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const select = overlay.querySelector("#work-category");
  if (!select) return;

  if (select.options.length > 1) return;

  try {
    const res = await fetch("http://localhost:5678/api/categories");
    const cats = await res.json();

    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = String(c.id);
      opt.textContent = c.name;
      select.appendChild(opt);
    });
  } catch {
    // silencieux
  }
}

function resetAddForm() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  overlay.querySelector("#modal-error").textContent = "";
  overlay.querySelector("#work-title").value = "";
  overlay.querySelector("#work-image").value = "";
  overlay.querySelector("#work-category").value = "";

  const preview = overlay.querySelector("#upload-preview");
  preview.classList.remove("has-image");
  preview.querySelector("img").src = "";
}

function updateSubmitState() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const title = overlay.querySelector("#work-title").value.trim();
  const cat = overlay.querySelector("#work-category").value;
  const file = overlay.querySelector("#work-image").files?.[0];

  overlay.querySelector("#submit-work").disabled = !(title && cat && file);
}

/* ====== Étape 7 : Galerie + suppression ====== */
async function fetchWorks() {
  const res = await fetch("http://localhost:5678/api/works");
  return res.json();
}

export async function renderModalGallery() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const container = overlay.querySelector(".modal-gallery");
  if (!container) return;

  container.innerHTML = "";

  const works = await fetchWorks();
  works.forEach((work) => container.appendChild(buildModalItem(work)));
}

function buildModalItem(work) {
  const item = document.createElement("div");
  item.classList.add("modal-item");
  item.dataset.modalId = work.id;

  item.innerHTML = `
    <img src="${work.imageUrl}" alt="${work.title}">
    <button class="trash-btn" type="button" aria-label="Supprimer" data-trash-id="${work.id}">
      🗑
    </button>
  `;

  item.querySelector(".trash-btn").addEventListener("click", async () => {
    await deleteWork(work.id);
  });

  return item;
}

async function deleteWork(id) {
  const token = localStorage.getItem("token");
  if (!token) return;

  const res = await fetch(`http://localhost:5678/api/works/${id}`, {
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

/* ====== Étape 8 : POST /works + AJOUT DYNAMIQUE DOM ====== */
async function submitNewWork() {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;

  const errorEl = overlay.querySelector("#modal-error");
  errorEl.textContent = "";

  const token = localStorage.getItem("token");
  if (!token) {
    errorEl.textContent = "Vous devez être connecté.";
    return;
  }

  const title = overlay.querySelector("#work-title").value.trim();
  const category = overlay.querySelector("#work-category").value;
  const imageFile = overlay.querySelector("#work-image").files?.[0];

  if (!title || !category || !imageFile) {
    errorEl.textContent = "Veuillez compléter tous les champs.";
    return;
  }

  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("title", title);
  formData.append("category", category);

  try {
    const res = await fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      errorEl.textContent = "Erreur : le formulaire n'a pas pu être envoyé.";
      return;
    }

    //  Réponse API = nouveau work
    const newWork = await res.json();

    //  1) Ajout dynamique dans la galerie de la page
    addWorkToHomeGallery(newWork);

    //  2) Ajout dynamique dans la galerie de la modale
    addWorkToModalGallery(newWork);

    //  3) Retour à la galerie
    renderView("gallery");
  } catch {
    errorEl.textContent = "Erreur serveur. Réessaie plus tard.";
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
