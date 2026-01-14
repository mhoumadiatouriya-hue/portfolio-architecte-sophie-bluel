 // But de ce fichier
 // - Charger les projets depuis l'API 
 // - Afficher ces projets dans la galerie de la page d'accueil
 // - Charger les catégories depuis l'API
 // - Créer les boutons de filtres et filtrer les projets au clic

 // === Pour importer les modules ===
import { interfaceAuth } from "./auth.js";
import { initModal } from "./modal.js";

// === Initialisation au chargement ===
// Vérifie si l'utilisateur est connecté et adapte l'interface
// Si un token est présent dans le vavigateur, on passe en "mode édition"
// (barre noire, bouton modifier, logout, filtres cachés...)
interfaceAuth();

// Prépare la modale (elle sera ouverte quand on clique sur "modifier")
initModal();

// === VARIABLES GLOBALES ===
// Pour garder tous les projets en mémoire comme ça qd on clique sur un filtre, on peut filtrer directement sans rappeler l'API à chaque fois.
let allWorks = [];

// 1) Charger les projets depuis l'API 
// la fonction loadWorks fait ça, elle récupère tous les projets depuis l'API et les affiche
// Elle est appelée au chargement initial de la page

async function loadWorks() {
  // On demande à l'API la liste des projets 
  try {
  const response = await fetch("http://localhost:5678/api/works");
  

  // Si l'API répond avec une erreur, on arrête ici
  if(!response.ok){
    throw new Error ("Impossible de charger les projets.")
  }

  // On transforme la réponse de l'API en liste de projets utilisable en JS  
  const works = await response.json();

  // On stocke la liste complète en mémoire (utile pour les filtres)
  allWorks = works;

  // Affichage intial de tous les projets
  displayWorks(works);
  } catch (error) {
    console.error("Erreur lors du chargement des projets:", error);
}
}

// 2) Pour afficher les projets dans la galerie
// La fonction displayWorks permet d'afficher les projets dans la galerie principale
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  
  // On vide la galerie avant d'afficher les projets ( sinon ça empilerait les projets)
  gallery.innerHTML = "";

  // Pour chaque projet on crée une structure avec une image et un titre
  works.forEach((work) => {
    const figure = document.createElement("figure");

    // On ajoute identifiant dans le HTML (data-id)
    // Cette commande permet aussi de supprimer un projet plus tard sans recharger la page
    figure.dataset.id = work.id; // data-id="3"

    const img = document.createElement("img");
    const caption = document.createElement("figcaption");
    // Remplissage des élèments
    img.src = work.imageUrl;
    img.alt = work.title;
    caption.textContent = work.title;

    // Assemblage
    figure.appendChild(img);
    figure.appendChild(caption);
    gallery.appendChild(figure);
  });
}

// 3) Pour charger catégories et créer les filtres 
// La focntion loadFilters génère dynamiquement tous les boutons (Tous + catégories)

async function loadFilters() {
  try {
    // On demande à l'API la liste des catégories
  const response = await fetch("http://localhost:5678/api/categories");

  if (!response.ok) {
    throw new Error("Impossible de charger les catégories.");
  }

  const categories = await response.json();

  const filtersDiv = document.querySelector(".filters");
if (!filtersDiv) return; // Si pas de div filtres, on arrête ici (ex: en mode édition)
  
// Bouton "Tous" qui réaffiche tous les projets
  const btnAll = document.createElement("button");
  btnAll.textContent = "Tous";
  btnAll.classList.add("active");
  filtersDiv.appendChild(btnAll);

  btnAll.addEventListener("click", () => {
    // On met le bouton en "actif" visuellement
    setActiveButton(btnAll);

    // On réaffiche tous les projets
    displayWorks(allWorks);
  });

  // Création des boutons par catégorie

  categories.forEach((category) => {
    const button = document.createElement("button");
    button.textContent = category.name;
    filtersDiv.appendChild(button);
    
    // Filtrer par catégorie
    button.addEventListener("click", () => {
      setActiveButton(button);

      // On garde seulement les projets de la catégorie cliquée
      const filteredWorks = allWorks.filter(
        (work) => work.categoryId === category.id
      );

      // On affiche seulement ces projets
      displayWorks(filteredWorks);
    });
  });
    } catch (error) {
    console.error(error);
  }
}

// 4) Pour gérer le bouton actif
// La fonction setActiveButton gère l'état visuel des boutons de filtres
function setActiveButton(activeButton) {
  // On enlève la classe "active" sur tous les boutons
  const buttons = document.querySelectorAll(".filters button");
  buttons.forEach((btn) => btn.classList.remove("active"));
  
  // Puis on ajoute "active" seulement sur le bouton cliqué
  activeButton.classList.add("active");
}

// 5) Pour le lancement au chargement de la page
loadWorks();
loadFilters();

// Fonction qui permet de recharger rapidement après modification
window.reloadWorks = loadWorks;
