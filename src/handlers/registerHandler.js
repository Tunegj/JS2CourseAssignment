import { navigate } from "../router.js";
import { registerUser } from "../api/auth.js";
import {
  isValidName,
  isValidEmail,
  isValidPassword,
  isValidBio,
  isValidUrl,
} from "../utils/validators.js";
import { setFieldError, clearFieldErrors } from "../utils/formErrors.js";

/**
 * Render the registration form and handle user registration
 */
export function registerHandler() {
  const app = document.querySelector("#app");

  app.innerHTML = `
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-lg-8 col-xl-7">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
              <h1 class="h2 mb-4 text-center">Register</h1>

              <form id="register-form" novalidate>
                <div class="mb-3">
                  <label for="username" class="form-label">Username</label>
                  <input
                    type="text"
                    id="username"
                    class="form-control"
                    aria-describedby="username-error"
                    required
                    minlength="3"
                    maxlength="20"
                  />
                  <div id="username-error" class="invalid-feedback"></div>
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
                    aria-describedby="email-error"
                    required
                  />
                  <div id="email-error" class="invalid-feedback"></div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input
                    type="password"
                    id="password"
                    class="form-control"
                    aria-describedby="password-error"
                    required
                    minlength="8"
                  />
                  <div id="password-error" class="invalid-feedback"></div>
                </div>

                <div class="mb-3">
                  <label for="bio" class="form-label">Bio</label>
                  <textarea
                    id="bio"
                    class="form-control"
                    rows="5"
                    maxlength="160"
                    aria-describedby="bio-error bio-help"
                    placeholder="Tell us about yourself... (optional)"
                  ></textarea>
                  <div id="bio-help" class="form-text">
                    Optional. Maximum 160 characters.
                  </div>
                  <div id="bio-error" class="invalid-feedback"></div>
                </div>

                <div class="mb-3">
                  <label for="avatar-url" class="form-label">Avatar URL</label>
                  <input
                    type="url"
                    id="avatar-url"
                    class="form-control"
                    aria-describedby="avatar-url-error avatar-url-help"
                    placeholder="https://..."
                  />
                  <div id="avatar-url-help" class="form-text">Optional.</div>
                  <div id="avatar-url-error" class="invalid-feedback"></div>
                </div>

                <div class="mb-3">
                  <label for="banner-url" class="form-label">Banner URL</label>
                  <input
                    type="url"
                    id="banner-url"
                    class="form-control"
                    aria-describedby="banner-url-error banner-url-help"
                    placeholder="https://..."
                  />
                  <div id="banner-url-help" class="form-text">Optional.</div>
                  <div id="banner-url-error" class="invalid-feedback"></div>
                </div>

                <div
                  id="api-error"
                  class="alert alert-danger d-none"
                  role="alert"
                ></div>

                <div class="d-grid">
                  <button type="submit" id="register-btn" class="btn btn-primary">
                    Register
                  </button>
                </div>
              </form>

              <p class="mt-4 mb-0 text-center">
                Already have an account?
                <button
                  id="to-login"
                  class="btn btn-link p-0 align-baseline"
                  type="button"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  const form = document.querySelector("#register-form");
  const apiError = document.querySelector("#api-error");
  const submitBtn = document.querySelector("#register-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    clearFieldErrors([
      "username",
      "email",
      "password",
      "bio",
      "avatar-url",
      "banner-url",
    ]);
    apiError.textContent = "";
    apiError.classList.add("d-none");

    const name = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();
    const bio = document.querySelector("#bio").value.trim();
    const avatarUrl = document.querySelector("#avatar-url").value.trim();
    const bannerUrl = document.querySelector("#banner-url").value.trim();

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
    if (avatarUrl && !isValidUrl(avatarUrl)) {
      setFieldError("avatar-url", "Avatar URL must be a valid URL.");
      hasError = true;
    }
    if (bannerUrl && !isValidUrl(bannerUrl)) {
      setFieldError("banner-url", "Banner URL must be a valid URL.");
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Registering...";

    try {
      const payload = { name, email, password };

      if (bio) payload.bio = bio; // Only include bio if it's provided

      if (avatarUrl) {
        payload.avatar = { url: avatarUrl, alt: "" };
      }

      if (bannerUrl) {
        payload.banner = { url: bannerUrl, alt: "" };
      }

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

      apiError.classList.remove("d-none");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Register";
    }
  });

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("#/login");
  });
}
