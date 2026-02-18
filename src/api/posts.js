import { getApiKey, getToken } from "../utils/storage.js";
import { BASE_URL } from "./config.js";

function createAuthHeaders(extraHeaders = {}) {
  const token = getToken();
  const apiKey = getApiKey();

  return {
    Authorization: `Bearer ${token}`,
    "X-Noroff-Api-Key": apiKey,
    ...extraHeaders,
  };
}

/**
 * Fetches all posts from the API.
 * @returns {Promise<Array>} An array of posts.
 */
export async function getAllPosts() {
  const response = await fetch(
    `${BASE_URL}/social/posts?_author=true&_reactions=true&_comments=true`,
    {
      headers: createAuthHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to fetch posts");
  }

  return data.data ?? data;
}

/**
 * Fetches a single post by its ID from the API.
 * @param {string} id - The ID of the post to fetch.
 * @returns {Promise<Object>} The post data.
 */
export async function getPostById(id) {
  if (!id) throw new Error("Missing post ID");

  const response = await fetch(
    `${BASE_URL}/social/posts/${id}?_author=true&_reactions=true&_comments=true`,
    {
      headers: createAuthHeaders(),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message ?? `Failed to fetch post`);
  }

  return data.data ?? data;
}

export async function createPost({ title, body }) {
  const response = await fetch(`${BASE_URL}/social/posts`, {
    method: "POST",
    headers: createAuthHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ title, body }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to create post");
  }

  return data.data ?? data;
}
