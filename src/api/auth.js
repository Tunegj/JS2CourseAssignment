import { BASE_URL } from "./config.js";
import { getApiErrorMessage } from "../utils/apiErrors.js";

/**
 * Registers a new user by sending a POST request to the API
 * @param {{ name: string, email: string, password: string }} userData
 * @returns {Promise<Object>} The created user object
 * @throws Will throw an error if the API request fails.
 */
export async function registerUser(userData) {
  let response;

  try {
    response = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
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
    throw new Error(getApiErrorMessage(data, "Registration failed"));
  }

  return data?.data ?? data;
}

/**
 * Logs in a user by sending a POST request to the API
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ name: string, email: string, accessToken: string }>} The logged-in user data
 * @throws Will throw an error if the API request fails.
 */
export async function loginUser(credentials) {
  let response;

  try {
    response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
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
    throw new Error(getApiErrorMessage(data, "Login failed"));
  }
  return data?.data ?? data; // Handle both { data: {...} } and { ... } response formats
}
