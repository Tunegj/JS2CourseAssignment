import { getApiKey, getToken } from "../utils/storage.js";

const BASE_URL = "https://v2.api.noroff.dev";

/**
 * Fetches all posts from the API.
 * @returns {Promise<Array>} An array of posts.
 */
export async function getAllPosts() {
  const token = getToken();
  const apiKey = getApiKey();

  console.log("TOKEN:", token);
  console.log("API KEY:", apiKey);

  const response = await fetch(
    `${BASE_URL}/social/posts?_author=true&_reactions=true&_comments=true`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-Noroff-Api-Key": apiKey,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to fetch posts");
  }

  return data.data ?? data;
}
