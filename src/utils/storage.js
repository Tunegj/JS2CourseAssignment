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
