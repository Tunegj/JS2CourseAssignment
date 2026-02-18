import { navigate } from "../router.js";
import { loginUser } from "../api/auth.js";
import { saveSession, saveApiKey, getApiKey } from "../utils/storage.js";
import { createApiKey } from "../api/apiKey.js";
/**
 * Render the login view
 */
export function loginHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Login</h1>
     <form id="login-form">
        <input type="text" id="email" placeholder="Email" required />
        <input type="password" id="password" placeholder="Password" required />
        <button id="login-btn" type="submit">Login</button>
        <p id="error-message" style="color: red;"></p>
        </form>
    <p>Don't have an account? <button id="to-register">Go to register</button></p>
    </section>
`;

  const form = document.querySelector("#login-form");
  const errorMessage = document.querySelector("#error-message");
  const loginBtn = document.querySelector("#login-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    errorMessage.textContent = "";

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email.endsWith("@stud.noroff.no")) {
      errorMessage.textContent =
        "Email must be a valid @stud.noroff.no address.";
      return;
    }

    if (password.length < 8) {
      errorMessage.textContent = "Password must be at least 8 characters long.";
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
      const result = await loginUser({ email, password });

      const session = result.data ?? result;

      saveSession({
        accessToken: session.accessToken,
        name: session.name,
        email: session.email,
      });

      const existingKey = getApiKey();
      if (!existingKey) {
        const apiKey = await createApiKey();
        saveApiKey(apiKey);
      }

      navigate("#/feed");
    } catch (error) {
      errorMessage.textContent = error.message;
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  document.querySelector("#to-register").addEventListener("click", () => {
    navigate("#/register");
  });
}
