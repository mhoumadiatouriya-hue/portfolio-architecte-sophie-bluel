
// =======================================================
// BUT DU FICHIER
// - Gérer la connexion de l'utilisateur (admin)
// - Envoyer l'email + mot de passe à l'API
// - Si c'est correct : récupérer le token, le stocker, puis revenir à la page d'accueil
// - Si c'est incorrect : afficher un message d'erreur
// =======================================================

// On récupère le formulaire et la zone où on affiche les erreurs
const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

// Quand l'utilisateur clique sur "Se connecter"
form.addEventListener("submit", async (event) => {
  // Empêche le rechargement automatique de la page
  event.preventDefault();
  // On vide le message d'erreur avant de tenter une connexion
  errorEl.textContent = "";

    // On récupère ce que l'utilisateur a tapé
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
     // On envoie les identifiants à l'API pour vérifier la connexion
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { 
        // On indique qu'on envoie des données au format JSON
        "Content-Type": "application/json",
       },
            // On envoie email + password dans le corps de la requête
      body: JSON.stringify({ email, password }),
    });

        // Si l'API refuse (mauvais identifiant ou mauvais mot de passe)
    if (!response.ok) {
      errorEl.textContent = "Erreur dans l’identifiant ou le mot de passe";
      return;
    }
    // Si c'est bon : l'API renvoie un token
    const data = await response.json(); // { token: "..." }
        // On stocke le token dans le navigateur pour rester "connecté"
    // Ce token servira ensuite pour :
    // - afficher le mode édition
    // - supprimer/ajouter des projets via l'API
    localStorage.setItem("token", data.token);

  // On revient sur la page d'accueil
    window.location.href = "./index.html";

  } catch (err) {
        // Erreur réseau / serveur / API indisponible
    console.error(err);
    errorEl.textContent = "Erreur serveur. Réessaie plus tard.";
  }
});
