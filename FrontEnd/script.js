// Pour garder tous les projets en mémoire
let allWorks = [];

// Pour charger les projets depuis l'API
async function loadWorks() {
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    allWorks = works;
    displayWorks(works);
}

// Pour afficher les projets dans la galerie
function displayWorks(works) {
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = "";

    works.forEach(work => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const caption = document.createElement("figcaption");

        img.src = work.imageUrl;
        img.alt = work.title;
        caption.textContent = work.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });
}

// Pour charger les filtres catégories
async function loadFilters() {
    const response = await fetch("http://localhost:5678/api/categories");
    const categories = await response.json();

    const filtersDiv = document.querySelector(".filters");

    // Bouton "Tous"
    const btnAll = document.createElement("button");
    btnAll.textContent = "Tous";
    btnAll.classList.add("active");
    filtersDiv.appendChild(btnAll);

    btnAll.addEventListener("click", () => {
        setActiveButton(btnAll);
        displayWorks(allWorks);
    });

    // Boutons catégories
    categories.forEach(category => {
        const button = document.createElement("button");
        button.textContent = category.name;
        filtersDiv.appendChild(button);

        button.addEventListener("click", () => {
            setActiveButton(button);
            const filteredWorks = allWorks.filter(
                work => work.categoryId === category.id
            );
            displayWorks(filteredWorks);
        });
    });
}

// Pour gérer le bouton actif
function setActiveButton(activeButton) {
    const buttons = document.querySelectorAll(".filters button");
    buttons.forEach(btn => btn.classList.remove("active"));
    activeButton.classList.add("active");
}

// Pour le lancement au chargement de la page
loadWorks();
loadFilters();
