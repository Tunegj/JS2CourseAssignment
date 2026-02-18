import { getToken } from "../utils/storage.js";

const BASE_URL = "https://v2.api.noroff.dev";

export async function createApiKey() {
  const token = getToken();

  const response = await fetch(`${BASE_URL}/auth/create-api-key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message ?? "Failed to create API key");
  }

  return data.data.key ?? data.key;
}
