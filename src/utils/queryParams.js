/**
 * Get the value of a query parameter from the URL hash - #/profile?name=JohnDoe
 * @param {string} key - The name of the query parameter
 * @returns {string|null} - The value of the query parameter or null if not found
 */
export function getHashQueryParam(key) {
  const hash = window.location.hash || "";
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(queryString);
  return params.get(key);
}

/**
 * Get all query parameters from the URL hash as an object - #/profile?name=JohnDoe&age=30
 * @returns {Object} - An object containing all query parameters as key-value pairs
 */
export function getHashQueryParams() {
  const hash = window.location.hash || "";
  const queryString = hash.includes("?") ? hash.split("?")[1] : "";
  const params = new URLSearchParams(queryString);

  const obj = {};
  for (const [key, value] of params.entries()) obj[key] = value;
  return obj;
}
