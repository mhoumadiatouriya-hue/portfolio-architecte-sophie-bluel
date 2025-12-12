async function loadWorks() {
    // Appel à l'API backend
    const response = await fetch("http://localhost:5678/api/works");
    const works = await response.json();

    // Sélection de la galerie
    const gallery = document.querySelector(".gallery");
    gallery.innerHTML = ""; // on vide le contenu statique

    // Pour chaque travail reçu, on crée une figure
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

// On lance le chargement au démarrage de la page
loadWorks();
