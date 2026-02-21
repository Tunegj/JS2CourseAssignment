/**
 * Optional chaining to get the first error message from an API response, with a fallback if it doesn't exist.
 * @param {*} data - The API response data
 * @param {*} fallback - The fallback message if no error message is found
 * @returns {string} - The error message
 */

export function getApiErrorMessage(data, fallback = "An error occurred") {
  return data?.errors?.[0]?.message ?? data?.message ?? fallback;
}
