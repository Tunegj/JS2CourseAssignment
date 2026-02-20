import { loginHandler } from "./handlers/loginHandler.js";
import { registerHandler } from "./handlers/registerHandler.js";
import { feedHandler } from "./handlers/feedHandler.js";
import { getToken, getApiKey, clearSession } from "./utils/storage.js";
import { singlePostHandler } from "./handlers/singlePostHandler.js";
import { createPostHandler } from "./handlers/createPostHandler.js";
import { profileHandler } from "./handlers/profileHandler.js";
import { getHashQueryParam } from "./utils/queryParams.js";

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
 *  Check if the user has a valid session (access token and API key)
 * @returns {boolean} - True if the user has a valid session, false otherwise
 */
function hasValidSession() {
  const token = getToken();
  const apiKey = getApiKey();

  return Boolean(token && apiKey);
}

/**
 * Protection guard for routes that require authentication
 * @returns {boolean} - True if the user is authenticated, false otherwise
 */
function authGuard() {
  if (!hasValidSession()) {
    clearSession();
    navigate("#/login");
    return false;
  }
  return true;
}

/**
 *  Protection guard for routes that should only be accessible to guests (not logged in)
 * @returns {boolean} - True if the user is a guest, false otherwise
 */
function guestGuard() {
  if (hasValidSession()) {
    navigate("#/feed");
    return false;
  }
  return true;
}

/**
 * Render the correct view based on the current route
 */
export function renderRoute() {
  const route = getRoute();

  const [path] = route.split("?");

  switch (path) {
    case "#/login":
      if (!guestGuard()) return;
      loginHandler();
      break;
    case "#/register":
      if (!guestGuard()) return;
      registerHandler();
      break;
    case "#/feed":
      if (!authGuard()) return;
      feedHandler();
      break;
    case "#/create":
      if (!authGuard()) return;
      createPostHandler();
      break;
    case "#/post":
      if (!authGuard()) return;

      const postId = getHashQueryParam("id");

      if (!postId) {
        navigate("#/feed");
        return;
      }
      singlePostHandler(postId);
      break;
    case "#/logout":
      clearSession();
      navigate("#/login");
      break;
    case "#/profile":
      if (!authGuard()) return;
      profileHandler();
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
