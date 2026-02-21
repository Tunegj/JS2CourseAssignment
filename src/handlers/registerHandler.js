import { navigate } from "../router.js";
import { registerUser } from "../api/auth.js";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
  isValidBio,
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
        
        <form id="register-form" class="form" novalidate>
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

          <label for="bio">Bio:
            <textarea id="bio" rows="6" placeholder="Tell us about yourself...(optional)" ></textarea>
            <p id="bio-error" class="field-error"></p>
          </label>
          

          <p id="api-error" class="api-error"></p> 

        <button type="submit" id="register-btn" class="btn btn--primary">Register</button>
        </form>

        <div>Already have an account? <button id="to-login" class="btn btn--ghost">Login here</button></div>
    </section>
`;

  const form = document.querySelector("#register-form");
  const apiError = document.querySelector("#api-error");
  const submitBtn = document.querySelector("#register-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors(["username", "email", "password", "bio"]);
    apiError.textContent = "";

    const name = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const bio = document.querySelector("#bio").value.trim();

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
    if (bio && !isValidBio(bio)) {
      setFieldError("bio", "Bio must be 160 characters or less.");
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const payload = { name, email, password };
      if (bio) payload.bio = bio; // Only include bio if it's provided

      await registerUser(payload);

      navigate("#/login");
    } catch (error) {
      const message = error.message ?? "Registration failed, please try again.";

      if (message.toLowerCase().includes("already exists")) {
        apiError.textContent =
          "A user with this email or username already exists. Try a different username or login instead.";
      } else {
        apiError.textContent = message;
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
