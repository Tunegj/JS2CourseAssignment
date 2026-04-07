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
    <section class="container py-5">
      <div class="row justify-content-center">
        <div class="col-12 col-md-8 col-lg-6">
          <div class="card shadow-sm border-0">
            <div class="card-body p-4 p-md-5">
              <h1 class="h2 mb-4 text-center">Login</h1>

              <form id="login-form" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    type="email"
                    id="email"
                    class="form-control"
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
                    required
                  />
                  <div id="password-error" class="invalid-feedback"></div>
                </div>

                <div
                  id="api-error"
                  class="alert alert-danger d-none"
                  role="alert"
                ></div>

                <div class="d-grid">
                  <button id="login-btn" class="btn btn-primary" type="submit">
                    Login
                  </button>
                </div>
              </form>

              <p class="mt-4 mb-0 text-center">
                Don't have an account?
                <button
                  id="to-register"
                  class="btn btn-link p-0 align-baseline"
                  type="button"
                >
                  Go to register
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
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
