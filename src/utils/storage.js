const TOKEN_KEY = "accessToken";
const USER_KEY = "user";
const API_KEY = "apiKey";

/**
 * saves auth session data to localStorage
 * @param {{ accessToken: string, name: string, email: string }} session
 */
export function saveSession({ accessToken, name, email }) {
  localStorage.setItem(TOKEN_KEY, String(accessToken || "")); // ensure token is a string
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({ name: String(name || ""), email: String(email || "") }),
  ); // stringify user data for storage
}

/**
 * Saves the API key to localStorage
 * @param {string} key - The API key to save
 */
export function saveApiKey(key) {
  localStorage.setItem(API_KEY, String(key || "")); // ensure API key is a string
}

/**
 *  Get the saved API key (or null if not set)
 * @returns {string | null}
 */
export function getApiKey() {
  return localStorage.getItem(API_KEY);
}
/**
 * Get the saved access token (or null if not logged in)
 * @returns {string | null}
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Get the saved user data (or null)
 * @returns {{ name: string, email: string } | null}
 */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    clearSession();
    return null;
  }
}

/**
 * Clear the saved session data.
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(API_KEY);
}
