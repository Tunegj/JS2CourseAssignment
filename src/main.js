const app = document.querySelector("#app");

/**
 * Helper to change route, by changing the hash in the URL
 * @param {string} hash
 */
export function navigate(hash) {
  window.location.hash = hash;
}

/**
 * Read the current route, defaulting to #login if no hash is present
 * @returns {string}
 */

function getRoute() {
  return window.location.hash || "/#login";
}

function renderLoginView() {
  app.innerHTML = `
  <section>
    <h1>Login</h1>
    <p> Placeholder for login form </p>
    <button id="to-register">Go to register</button>
  </section>
`;

  document.querySelector("#to-register").addEventListener("click", () => {
    navigate("/#register");
  });
}

function renderRegisterView() {
  app.innerHTML = `
  <section>
    <h1>Register</h1>
    <p> Placeholder for register form </p>
    <button id="to-login">Go to login</button>
  </section>
`;

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("/#login");
  });
}

function renderFeedView() {
  app.innerHTML = `
  <section>
    <h1>Feed</h1>
    <p> Placeholder for feed </p>
    <button id="to-login">Go to login</button>
  </section>
`;

  document.querySelector("#to-login").addEventListener("click", () => {
    navigate("/#login");
  });
}

function renderRoute() {
  const route = getRoute();

  const [path] = route.split("?");

  switch (path) {
    case "/#login":
      renderLoginView();
      break;
    case "/#register":
      renderRegisterView();
      break;
    case "/#feed":
      renderFeedView();
      break;
    default:
      navigate("/#login");
      break;
  }
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", renderRoute);
