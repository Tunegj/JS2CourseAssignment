import { loginHandler } from "./handlers/loginHandler.js";
import { registerHandler } from "./handlers/registerHandler.js";
import { feedHandler } from "./handlers/feedHandler.js";

const app = document.querySelector("#app");

/**
 * Navigate to a new route by updating the URL hash
 * @param {string} hash - The new hash to navigate to (e.g., "#/login")
 */
export function navigate(hash) {
  window.location.hash = hash;
}

/**
 * Read the current route from the URL hash
 * Defaults to "#/login" if no hash is present
 * @returns {string}
 */

function getRoute() {
  return window.location.hash || "#/login";
}

/**
 * Render the correct view based on the current route
 */

export function renderRoute() {
  const route = getRoute();

  const [path] = route.split("?");

  switch (path) {
    case "#/login":
      loginHandler();
      break;
    case "#/register":
      registerHandler();
      break;
    case "#/feed":
      feedHandler();
      break;
    default:
      navigate("#/login");
      break;
  }
}

/**
 * Initialize SPA routing (first render + listen for hash changes)
 */
export function initRouter() {
  window.addEventListener("hashchange", renderRoute);
  window.addEventListener("DOMContentLoaded", renderRoute);

  renderRoute();
}
