/**
 * Gère l'interface quand l'utilisateur est authentifié
 * - Active le mode édition
 * - Affiche la barre "Mode édition"
 * - Remplace "login" par "logout"
 * - Cache les filtres
 * - Ajoute le bouton "modifier" dans le portfolio
 */

export function interfaceAuth() {
  const token = localStorage.getItem("token");
  if (!token) return;

  // Activation du mode édition (utilisé par le CSS)
  document.body.classList.add("edit-mode");

  addEditBar();
  switchLoginToLogout();
  hideFilters();
  addEditButton();
}

/**
 * Ajoute la barre noire "Mode édition" en haut de la page
 */
function addEditBar() {
  // Évite d'ajouter la barre plusieurs fois
  if (document.querySelector(".edit-bar")) return;

  const bar = document.createElement("div");
  bar.classList.add("edit-bar");

  const text = document.createElement("span");
  text.textContent = "Mode édition";

  bar.appendChild(text);
  document.body.prepend(bar);
}

/**
 * Remplace le lien "login" par "logout" et gère la déconnexion
 */
function switchLoginToLogout() {
  const loginLink = document.querySelector('nav a[href="./login.html"]');
  if (!loginLink) return;

  loginLink.textContent = "logout";
  loginLink.setAttribute("href", "#");

  loginLink.addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  });
}

/**
 * Cache les filtres de catégories en mode édition
 */
function hideFilters() {
  const filters = document.querySelector(".filters");
  if (filters) {
    filters.style.display = "none";
  }
}

/**
 * Ajoute le bouton "modifier" à côté du titre "Mes projets"
 * Le titre et le bouton sont regroupés dans un wrapper
 * pour permettre un alignement propre via le CSS
 */
function addEditButton() {
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (!portfolioTitle) return;

  // Empêche l'ajout multiple du bouton
  if (document.querySelector(".edit-btn")) return;

  // Création (ou récupération) du conteneur titre + bouton
  let header = document.querySelector("#portfolio .portfolio-header");
  if (!header) {
    header = document.createElement("div");
    header.classList.add("portfolio-header");

    portfolioTitle.parentNode.insertBefore(header, portfolioTitle);
    header.appendChild(portfolioTitle);
  }

  // Création du bouton "modifier"
  const button = document.createElement("button");
  button.type = "button";
  button.classList.add("edit-btn");

  // Icône "carré ouvert + crayon" (SVG inline, indépendant de FontAwesome)
  const icon = createEditIcon();

  const label = document.createElement("span");
  label.textContent = "modifier";

  button.appendChild(icon);
  button.appendChild(label);

  // Ouverture de la modale au clic
  button.addEventListener("click", async () => {
    const { openModal } = await import("./modal.js");
    openModal("gallery");
  });

  header.appendChild(button);
}

/**
 * Génère l'icône "carré ouvert + crayon" en SVG
 * Choix d'un SVG inline pour :
 * - éviter les dépendances externes
 * - garantir un rendu identique sur tous les navigateurs
 * - permettre un stylage simple via le CSS
 */
function createEditIcon() {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");

  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("edit-icon");

  // Style du SVG (icône en outline)
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  // Contour du carré
  const squareTop = document.createElementNS(ns, "path");
  squareTop.setAttribute("d", "M14 3H5a2 2 0 0 0-2 2v9");

  const squareBottom = document.createElementNS(ns, "path");
  squareBottom.setAttribute("d", "M19 14v5a2 2 0 0 1-2 2H7");

  // Crayon
  const pen = document.createElementNS(ns, "path");
  pen.setAttribute(
    "d",
    "M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
  );

  // Détail du crayon
  const penDetail = document.createElementNS(ns, "path");
  penDetail.setAttribute("d", "M15 5l4 4");

  svg.appendChild(squareTop);
  svg.appendChild(squareBottom);
  svg.appendChild(pen);
  svg.appendChild(penDetail);

  return svg;
}