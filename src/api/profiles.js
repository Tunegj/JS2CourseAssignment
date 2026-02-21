import { BASE_URL } from "./config";
import { getApiErrorMessage } from "../utils/apiErrors";
import { getApiKey, getToken, getUser } from "../utils/storage";

/**
 *  Create the necessary authentication headers for API requests
 * @param {Object} extraHeaders - Additional headers to include in the request
 * @returns {Object} - The complete headers object
 */
function createAuthHeaders(extraHeaders = {}) {
  const token = getToken();
  const apiKey = getApiKey();

  return {
    Authorization: `Bearer ${token}`,
    "X-Noroff-API-Key": apiKey,
    ...extraHeaders,
  };
}

/**
 * Encode and validate a profile name for URL usage
 * @param {string} name - The profile name to encode
 * @returns {string} - The encoded profile name
 */
function encodeName(name) {
  if (!name) throw new Error("Missing profile name.");

  return encodeURIComponent(name);
}

/**
 * Make an API request with authentication headers and error handling
 * @param {string} path - The API endpoint path
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {string} fallbackMessage - Fallback error message
 * @returns {Promise<Object>} - The response data
 */
async function request(path, options = {}, fallbackMessage = "Request failed") {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: createAuthHeaders(options.headers),
    });
  } catch {
    throw new Error(
      "Network error. Please check your connection and try again.",
    );
  }

  if (response.status === 204) return null;

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        `${fallbackMessage} (Status: ${response.status})`,
      ),
    );
  }

  return data.data ?? data;
}

/**
 * Fetch a profile by its name
 * Includes related data such as posts, followers, and following if available
 * @param {string} name - The name of the profile
 * @returns {Promise<Object>} - The profile data
 */
export async function getProfileByName(name) {
  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}?_posts=true&_followers=true&_following=true`,
    { method: "GET" },
    "Failed to fetch profile",
  );
}

/**
 * Fetch posts for a specific profile
 * @param {string} name - The name of the profile
 * @param {{limit?: number, page?: number}} options - Pagination options
 * @returns {Promise<Array>}
 */
export async function getProfilePosts(name, { limit = 20, page = 1 } = {}) {
  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}/posts?_reactions=true&_comments=true&_limit=${limit}&_page=${page}&_author=true`,
    { method: "GET" },
    "Failed to fetch profile posts",
  );
}

/**
 *  Fetch the profile of the currently logged-in user
 * @returns {Promise<Object>} - The profile data
 */
export async function getMyProfile() {
  const user = getUser();
  if (!user) throw new Error("User not logged in.");

  return getProfileByName(user.name);
}

/**
 * Follow a specific profile
 * @param {string} name - The name of the profile to follow
 * @returns {Promise<Object | null>}
 */
export async function followProfile(name) {
  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}/follow`,
    { method: "PUT" },
    "Failed to follow profile",
  );
}

/**
 * Unfollow a specific profile
 * @param {string} name - The name of the profile to unfollow
 * @returns {Promise<Object | null>}
 */
export async function unfollowProfile(name) {
  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}/unfollow`,
    { method: "PUT" },
    "Failed to unfollow profile",
  );
}

/**
 * Update a profile (bio/avatar/banner)
 * @param {string} name - The name of the profile to update
 * @param {Object} payload - The profile data to update
 * @returns {Promise<Object | null>}
 */
export async function updateProfile(name, payload) {
  const safeName = encodeName(name);

  if (!payload || typeof payload !== "object")
    throw new Error("Invalid profile data.");

  return request(
    `/social/profiles/${safeName}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Failed to update profile",
  );
}
