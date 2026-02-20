import { navigate } from "../router.js";
import { loginUser } from "../api/auth.js";
import { saveSession, saveApiKey, getApiKey } from "../utils/storage.js";
import { createApiKey } from "../api/apiKey.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import { setFieldError, clearFieldErrors } from "../utils/formErrors.js";

/**
 * Render the login view
 */
export function loginHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Login</h1>
     <form id="login-form">
     <label for="email">Email:
            <input type="email" id="email" required />
            <p id="email-error" class="field-error"></p>
          </label>
        <label for="password">Password:
            <input type="password" id="password" required />
            <p id="password-error" class="field-error"></p>
          </label>
          <p id="api-error" class="api-error"></p>
        <button id="login-btn" class="btn btn-primary" type="submit">Login</button>
        <p id="error-message" style="color: red;"></p>
        </form>
    <p>Don't have an account? <button id="to-register" class="btn btn-ghost">Go to register</button></p>
    </section>
`;

  const form = document.querySelector("#login-form");
  const loginBtn = document.querySelector("#login-btn");
  const apiError = document.querySelector("#api-error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors(["email", "password"]);
    apiError.textContent = "";

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    let hasError = false;

    if (!email) {
      setFieldError("email", "Email is required.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError("email", "Email must be a valid @stud.noroff.no address.");
      hasError = true;
    }

    if (!email.endsWith("@stud.noroff.no")) {
      setFieldError("email", "Email must be a valid @stud.noroff.no address.");
      hasError = true;
    }

    if (!password) {
      setFieldError("password", "Password is required.");
      hasError = true;
    } else if (!isValidPassword(password)) {
      setFieldError("password", "Password must be at least 8 characters long.");
      hasError = true;
    }

    if (hasError) return;

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

      if (!getApiKey()) {
        const apiKey = await createApiKey(session.accessToken);
        saveApiKey(apiKey);
      }

      navigate("#/feed");
    } catch (error) {
      apiError.textContent = error.message ?? "Login failed, please try again.";
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = "Login";
    }
  });

  document.querySelector("#to-register").addEventListener("click", () => {
    navigate("#/register");
  });
}
