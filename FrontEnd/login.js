const form = document.getElementById("login-form");
const errorEl = document.getElementById("login-error");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorEl.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:5678/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      errorEl.textContent = "Erreur dans l’identifiant ou le mot de passe";
      return;
    }

    const data = await response.json(); // { token: "..." }
    localStorage.setItem("token", data.token);

    window.location.href = "./index.html";
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Erreur serveur. Réessaie plus tard.";
  }
});
