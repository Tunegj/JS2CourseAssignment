import { navigate } from "../router.js";
import { registerUser } from "../api/auth.js";

export function registerHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Register</h1>
        
        <form id="register-form">
        <input type="text" id="username" placeholder="Username" required />
        <input type="email" id="email" placeholder="Email" required />
        <input type="password" id="password" placeholder="Password" required />
        <button type="submit">Register</button>
        <p id="error-message" style="color: red;"></p>
        </form>

        <button id="to-login">Go to login</button>
    </section>
`;

  const form = document.querySelector("#register-form");
  const errorMessage = document.querySelector("#error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMessage.textContent = "";

    const name = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value;

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      errorMessage.textContent =
        "Username can only contain letters, numbers, and underscores.";
      return;
    }

    if (!email.endsWith("@stud.noroff.no")) {
      errorMessage.textContent = "Email must be a stud.noroff.no address.";
      return;
    }

    if (password.length < 8) {
      errorMessage.textContent = "Password must be at least 8 characters long.";
      return;
    }

    try {
      await registerUser({ name, email, password });

      navigate("#/login");
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  });

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
