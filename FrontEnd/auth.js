import { openModal } from "./modal.js";

export function interfaceAuth() {
  const token = localStorage.getItem("token");
  if (!token) return;

  document.body.classList.add("edit-mode");

  addEditBar();
  switchLoginToLogout();
  hideFilters();
  addEditButton();
}

function addEditBar() {
  const bar = document.createElement("div");
  bar.classList.add("edit-bar");
  bar.innerHTML = `<span>Mode édition</span>`;
  document.body.prepend(bar);
}

function switchLoginToLogout() {
  const loginLink = document.querySelector('nav a[href="./login.html"]');
  if (!loginLink) return;

  loginLink.textContent = "logout";
  loginLink.href = "#";

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  });
}

function hideFilters() {
  const filters = document.querySelector(".filters");
  if (filters) filters.style.display = "none";
}

function addEditButton() {
  const portfolioTitle = document.querySelector("#portfolio h2");
  if (!portfolioTitle) return;

  // évite le doublon
  if (document.querySelector(".edit-btn")) return;

  const btn = document.createElement("button");
  btn.classList.add("edit-btn");
  btn.type = "button";
  btn.textContent = "modifier";

  // ✅ ouvre la modale au clic
  btn.addEventListener("click", () => {
    openModal("gallery");
  });

  portfolioTitle.insertAdjacentElement("afterend", btn);
}
