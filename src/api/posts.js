import { getApiKey, getToken } from "../utils/storage.js";
import { BASE_URL } from "./config.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";

/**
 * Creates authentication headers for API requests.
 * @param {Object} extraHeaders - Additional headers to include.
 * @returns {Object} The headers object.
 */
function createAuthHeaders(extraHeaders = {}) {
  const headers = { ...extraHeaders };

  const token = getToken();
  const apiKey = getApiKey();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

  return headers;
}

/**
 * Makes an API request with authentication headers.
 * @param {string} path - The API endpoint path.
 * @param {Object} options - Fetch options (method, headers, body, etc.).
 * @param {string} fallbackMessage - Fallback error message if the request fails.
 * @returns {Promise<any>} The response data.
 */
async function request(
  path,
  options = {},
  fallbackMessage = "API request failed",
) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: createAuthHeaders(options.headers),
    });
  } catch {
    throw new Error("Network error: Unable to connect to the server.");
  }

  if (response.status === 204) return null;

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `${fallbackMessage} (${response.status})`),
    );
  }

  return data?.data ?? data;
}

/**
 * Fetches all posts from the API.
 * @returns {Promise<Array>} An array of posts.
 */
export async function getAllPosts() {
  return request(
    "/social/posts?_author=true&_reactions=true&_comments=true",
    { method: "GET" },
    "Failed to fetch posts",
  );
}

/**
 * Fetches a single post by its ID from the API.
 * @param {string} id - The ID of the post to fetch.
 * @returns {Promise<Object>} The post data.
 */
export async function getPostById(id) {
  if (!id) throw new Error("Missing post ID");

  return request(
    `/social/posts/${id}?_author=true&_reactions=true&_comments=true`,
    { method: "GET" },
    "Failed to fetch post",
  );
}

/**
 * Creates a new post.
 * @param {{ title: string, body: string }} postData - The data for the new post.
 * @returns {Promise<Object>} The created post data.
 */
export async function createPost({ title, body }) {
  return request(
    "/social/posts",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    },
    "Failed to create post",
  );
}

/**
 * Deletes a post by its ID.
 * @param {string} id - The ID of the post to delete.
 * @returns {Promise<boolean>} True if the post was deleted successfully.
 */
export async function deletePost(id) {
  if (!id) throw new Error("Missing post ID");

  await request(
    `/social/posts/${id}`,
    { method: "DELETE" },
    "Failed to delete post",
  );

  return true;
}

/**
 * Updates a post by its ID.
 * @param {string} id - The ID of the post to update.
 * @param {{ title: string, body: string }} postData - The data for the post update.
 * @returns {Promise<Object>} The updated post data.
 */
export async function updatePost(id, { title, body }) {
  if (!id) throw new Error("Missing post ID");

  return request(
    `/social/posts/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    },
    "Failed to update post",
  );
}
