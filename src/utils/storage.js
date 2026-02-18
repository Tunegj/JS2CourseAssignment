const TOKEN_KEY = "accessToken";
const USER_KEY = "user";

/**
 * saves auth session data to localStorage
 * @param {{ accessToken: string, name: string, email: string }} session
 */
export function saveSession({ accessToken, name, email }) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(USER_KEY, JSON.stringify({ name, email }));
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
  return raw ? JSON.parse(raw) : null;
}

/**
 * Clear the saved session data.
 */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
