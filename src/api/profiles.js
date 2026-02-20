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
 * @param {string} name - The name of the profile
 * @returns {Promise<Object>} - The profile data
 */
export async function getProfileByName(name) {
  if (!name) throw new Error("Missing profile name.");

  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}?_posts=true&_followers=true&_following=true`,
    { method: "GET" },
    "Failed to fetch profile",
  );
}

export async function getProfilePosts(name, { limit = 20, page = 1 } = {}) {
  if (!name) throw new Error("Missing profile name.");

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

export async function followProfile(name) {
  if (!name) throw new Error("Missing profile name.");

  const safeName = encodeName(name);

  return request(
    `/social/profiles/${safeName}/follow`,
    { method: "PUT" },
    "Failed to follow profile",
  );
}

export async function unfollowProfile(name) {
  if (!name) throw new Error("Missing profile name.");

  const safeName = encodeName(name);
  return request(
    `/social/profiles/${safeName}/unfollow`,
    { method: "PUT" },
    "Failed to unfollow profile",
  );
}

export async function updateProfile(name, payload) {
  if (!name) throw new Error("Missing profile name.");
  if (!payload || typeof payload !== "object")
    throw new Error("Invalid profile data.");

  return request(
    `/social/profiles/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Failed to update profile",
  );
}
