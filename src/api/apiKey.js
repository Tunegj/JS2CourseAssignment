import { getToken } from "../utils/storage.js";
import { BASE_URL } from "./config.js";

/**
 * Creates a new API key using the provided access token.
 * @param {string} accessToken - The access token of the logged-in user.
 * @returns {Promise<string>} The newly created API key.
 */
export async function createApiKey(accessToken) {
  if (!accessToken) {
    throw new Error("Please log in to create an API key.");
  }

  const response = await fetch(`${BASE_URL}/auth/create-api-key`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.errors?.[0]?.message ??
        `Failed to create API key (${response.status})`,
    );
  }

  return data.data.key;
}
