/**
 * Extracts the query string from the URL hash - #/profile?name=JohnDoe
 * @returns {string} - The query string part of the URL hash or an empty string if not present
 */

function getHashQueryString() {
  const hash = window.location.hash || ""; // Get the URL hash
  return hash.includes("?") ? hash.split("?")[1] : ""; // Extract the query string part after '?'
}

/**
 * Get the value of a query parameter from the URL hash - #/profile?name=JohnDoe
 * @param {string} key - The name of the query parameter
 * @returns {string|null} - The value of the query parameter or null if not found
 */
export function getHashQueryParam(key) {
  const queryString = getHashQueryString();
  const params = new URLSearchParams(queryString);
  return params.get(key); // Return the value of the specified key or null if not found
}

/**
 * Get all query parameters from the URL hash as an object - #/profile?name=JohnDoe&age=30
 * @returns {Object} - An object containing all query parameters as key-value pairs
 */
export function getHashQueryParams() {
  const queryString = getHashQueryString(); // Get the query string from the hash
  const params = new URLSearchParams(queryString); // Parse the query string

  const obj = {};
  for (const [key, value] of params.entries()) obj[key] = value; // Populate the object with key-value pairs
  return obj;
}
