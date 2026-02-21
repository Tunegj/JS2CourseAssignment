import { BASE_URL } from "./config.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";

/**
 * Creates a new API key using the provided access token.
 * @param {string} accessToken - The access token of the logged-in user.
 * @returns {Promise<string>} The newly created API key.
 */
export async function createApiKey(accessToken) {
  if (!accessToken) {
    throw new Error("Please log in to create an API key.");
  }

  let response;

  try {
    response = await fetch(`${BASE_URL}/auth/create-api-key`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new Error("Network error: Unable to connect to the server.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(data, `Failed to create API key (${response.status})`),
    );
  }

  const key = data?.data?.key;
  if (!key) throw new Error("API key not found in response.");

  return key;
}
