const BASE_URL = "https://v2.api.noroff.dev";

/**
 * Registers a new user by sending a POST request to the API
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<Object>} The created user object
 * @throws Will throw an error if the API request fails.
 */
export async function registerUser(userData) {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.errors?.[0]?.message || "Registration failed");
  }

  return data;
}
