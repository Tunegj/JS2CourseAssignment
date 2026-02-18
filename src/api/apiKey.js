import { getToken } from "../utils/storage.js";

const BASE_URL = "https://v2.api.noroff.dev";

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
