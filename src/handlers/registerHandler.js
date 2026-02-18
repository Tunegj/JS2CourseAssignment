import { navigate } from "../router.js";
import { registerUser } from "../api/auth.js";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
} from "../utils/validators.js";
import { setFieldError, clearFieldErrors } from "../utils/formErrors.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";

/**
 * Render the registration form and handle user registration
 */
export function registerHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section>
        <h1>Register</h1>
        
        <form id="register-form">
          <label for="username">Username:
            <input type="text" id="username" required />
            <p id="username-error" class="field-error"></p>
          </label>
          <label for="email">Email:
            <input type="email" id="email" required />
            <p id="email-error" class="field-error"></p>
          </label>
          <label for="password">Password:
            <input type="password" id="password" required />
            <p id="password-error" class="field-error"></p>
          </label>

          <p id="api-error" class="api-error"></p> 

        <button type="submit" id="register-btn">Register</button>
        </form>

        <button id="to-login">Go to login</button>
    </section>
`;

  const form = document.querySelector("#register-form");
  const apiError = document.querySelector("#api-error");
  const submitBtn = document.querySelector("#register-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors(["username", "email", "password"]);
    apiError.textContent = "";

    const name = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    let hasError = false;

    if (!name) {
      setFieldError("username", "Username is required.");
      hasError = true;
    } else if (!isValidName(name)) {
      setFieldError(
        "username",
        "Username must be 3-20 characters and can only contain letters, numbers, and underscores.",
      );
      hasError = true;
    }

    if (!email) {
      setFieldError("email", "Email is required.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setFieldError("email", "Email must be a stud.noroff.no address.");
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

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      await registerUser({ name, email, password });

      navigate("#/login");
    } catch (error) {
      apiError.textContent =
        error.message ?? "Registration failed, please try again.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
