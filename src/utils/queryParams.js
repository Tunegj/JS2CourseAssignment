/**
 * Extracts the query string from the URL hash - #/profile?name=JohnDoe
 * @returns {string} - The query string part of the URL hash or an empty string if not present
 */

function getHashQueryString() {
  const hash = window.location.hash || "";
  const queryIndex = hash.indexOf("?");
  if (queryIndex === -1) return "";

  const query = hash.slice(queryIndex + 1);
  return query.split("#")[0];
}

/**
 * Get the value of a query parameter from the URL hash - #/profile?name=JohnDoe
 * @param {string} key - The name of the query parameter
 * @returns {string|null} - The value of the query parameter or null if not found
 */
export function getHashQueryParam(key) {
  const queryString = getHashQueryString();
  const params = new URLSearchParams(queryString);
  const value = params.get(key);
  return value ? value.trim() : null;
}

/**
 * Get all query parameters from the URL hash as an object - #/profile?name=JohnDoe&age=30
 * @returns {Object} - An object containing all query parameters as key-value pairs
 */
export function getHashQueryParams() {
  const queryString = getHashQueryString();
  const params = new URLSearchParams(queryString);

  const obj = {};
  for (const [key, value] of params.entries()) {
    obj[key] = value.trim();
  }

  return obj;
}
